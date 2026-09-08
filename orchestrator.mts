/**
 * Pulseboard software factory.
 *
 * Reads backlog.md, and hands each item to its own Claude Code agent running
 * inside its own Upstash Box. Nothing runs on this laptop except this file.
 *
 *   npx tsx orchestrator.mts            # every item in backlog.md
 *   npx tsx orchestrator.mts 1          # just item 1
 *   npx tsx orchestrator.mts 2,4,9      # a subset
 *   npx tsx orchestrator.mts ls         # boxes from previous runs
 *   npx tsx orchestrator.mts pause  <box-id>
 *   npx tsx orchestrator.mts resume <box-id>
 *
 * .env: UPSTASH_BOX_API_KEY and REPO_URL are required. ANTHROPIC_API_KEY is
 * optional (falls back to the box's own LLM allowance) and GITHUB_TOKEN is
 * needed for private repos and for pushing branches back.
 */

import { readFileSync } from "node:fs"
import { Agent, Box, BoxApiKey, ClaudeCode, BoxError, type Snapshot } from "@upstash/box"

// Node reads .env itself — no dotenv needed.
try {
  process.loadEnvFile(".env")
} catch {
  // no .env file, fall back to whatever is already exported
}

const REPO_URL = required("REPO_URL")
const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const BASE_BRANCH = process.env.BASE_BRANCH ?? "main"
const MODEL = ClaudeCode.Opus_5

/**
 * The key the agent inside the box talks to Anthropic with. Your own key if you
 * have one; otherwise the LLM allowance Upstash ships with the box, which is
 * capped ($1/mo free, $100/mo pay-as-you-go) — fine for one test run, not for
 * ten agents working overnight.
 */
const AGENT_KEY = process.env.ANTHROPIC_API_KEY || BoxApiKey.UpstashKey

/** Folder the repo gets cloned into, under the box's default cwd. */
const FOLDER = "pulseboard"

/** Push finished branches back to the remote. Off unless you set PUSH=1. */
const PUSH = process.env.PUSH === "1"

/**
 * By default a box can reach the entire internet. Set LOCK_NETWORK=1 to hand
 * the agents an allowlist instead — worth doing before you leave this running
 * unattended overnight. Anything the build needs has to be in here.
 */
const networkPolicy = process.env.LOCK_NETWORK === "1"
  ? {
      mode: "custom" as const,
      allowedDomains: [
        "registry.npmjs.org",
        "github.com",
        "codeload.github.com",
        "objects.githubusercontent.com",
        "api.anthropic.com",
      ],
    }
  : { mode: "allow-all" as const }

// ---------------------------------------------------------------- backlog ---

type BacklogItem = {
  number: number
  title: string
  body: string
  branch: string
}

/** Dropped from branch names so `fix/3-mobile-nav-close-tap` reads as a branch. */
const STOP_WORDS = new Set([
  "a", "an", "the", "is", "are", "no", "not", "does", "do", "cannot", "can",
  "after", "you", "every", "there", "be", "on", "of", "to", "it", "run",
])

/** backlog.md is ten `## N. Title` sections separated by horizontal rules. */
function parseBacklog(path = "backlog.md"): BacklogItem[] {
  return readFileSync(path, "utf8")
    .split(/^---$/m)
    .map((block) => block.trim())
    .filter((block) => /^##\s+\d+\./.test(block))
    .map((block) => {
      const [heading, ...rest] = block.split("\n")
      const [, number, title] = heading.match(/^##\s+(\d+)\.\s+(.*)$/)!

      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim()
        .split(/\s+/)
        .filter((word) => !STOP_WORDS.has(word))
        .slice(0, 4)
        .join("-")

      return {
        number: Number(number),
        title: title.trim(),
        body: rest.join("\n").trim(),
        branch: `fix/${number}-${slug}`,
      }
    })
}

function buildPrompt(item: BacklogItem): string {
  return `You are working in the Pulseboard repo, already cloned and installed at
the current directory. You are on branch ${item.branch}, cut from ${BASE_BRANCH}.

Your job is backlog item ${item.number}: ${item.title}

${item.body}

Rules:
- Only touch the files listed on the "Touches" line above. Nine other agents are
  working on this same repo right now, in their own containers, and they cannot
  see you. Two agents editing one file means two branches that fight at merge.
- Do not delete, skip, or weaken an existing test to get a green run. If a test
  is failing and you cannot fix it honestly, leave it failing and say so.
- \`npm test\` must pass before you commit.
- Commit to ${item.branch} with a message that says what you changed and why.
  Do not push.`
}

// -------------------------------------------------------------------- box ---

const boxDefaults = {
  runtime: "node" as const,
  size: "small" as const,
  labels: ["pulseboard"],
  agent: {
    harness: Agent.ClaudeCode,
    model: MODEL,
    apiKey: AGENT_KEY,
  },
  git: {
    token: GITHUB_TOKEN,
    userName: "Pulseboard Bot",
    userEmail: "bot@pulseboard.dev",
  },
  env: {
    SESSION_SECRET: process.env.SESSION_SECRET ?? "dev-secret-change-me",
    DATABASE_PATH: process.env.DATABASE_PATH ?? "./data/app.db",
  },
  networkPolicy,
}

/**
 * One box, repo cloned, dependencies installed, database seeded.
 * `Box.create<Agent.ClaudeCode>` is what types `agent.stream({ options })`
 * as Claude Code's options rather than a bag of unknowns.
 */
async function createReadyBox(name: string) {
  const box = await Box.create<Agent.ClaudeCode>({ ...boxDefaults, name })
  log(name, `box ${box.id} created`)

  await box.git.clone({ repo: REPO_URL, branch: BASE_BRANCH, folder: FOLDER })
  await box.cd(FOLDER)
  log(name, "repo cloned, installing")

  await run(box, "npm install")
  await run(box, "npm run seed")
  log(name, "ready")

  return box
}

/** Same thing, but restored from a snapshot — no clone, no npm install. */
async function boxFromSnapshot(snapshot: Snapshot, name: string) {
  const box = await Box.fromSnapshot<Agent.ClaudeCode>(snapshot.id, {
    ...boxDefaults,
    name,
  })
  await box.cd(FOLDER)
  log(name, `box ${box.id} restored from ${snapshot.id}`)
  return box
}

async function run(box: Box, command: string) {
  const result = await box.exec.command(command)
  if (result.exitCode !== 0) {
    throw new Error(`\`${command}\` exited ${result.exitCode}\n${result.result}`)
  }
  return result
}

// ------------------------------------------------------------------- work ---

type Report = {
  item: BacklogItem
  boxId: string
  committed: boolean
  testsPass: boolean
  suspicious: boolean
  diffstat: string
  costUsd: number
  error?: string
}

async function work(box: Box<Agent.ClaudeCode>, item: BacklogItem): Promise<Report> {
  const tag = `${item.number}`
  const report: Report = {
    item,
    boxId: box.id,
    committed: false,
    testsPass: false,
    suspicious: false,
    diffstat: "",
    costUsd: 0,
  }

  try {
    await box.git.exec({ args: ["checkout", "-b", item.branch] })
    log(tag, `on ${item.branch}, handing over: ${item.title}`)

    // This is the agent talking from inside the container.
    const out = prefixed(tag)
    const stream = await box.agent.stream({
      prompt: buildPrompt(item),
      timeout: 60 * 60 * 1000,
      options: {
        maxTurns: 60,
        maxBudgetUsd: 3,
        effort: "high",
      },
      onToolUse: (tool) => log(tag, `→ ${tool.name}`),
    })

    for await (const chunk of stream) {
      if (chunk.type === "text-delta") out.write(chunk.text)
      if (chunk.type === "finish") out.flush()
    }
    out.flush()
    report.costUsd = stream.cost.totalUsd

    // Do not take the agent's word for it. Check the repo yourself.
    const log_ = await box.git.exec({ args: ["log", "--oneline", `${BASE_BRANCH}..HEAD`] })
    report.committed = log_.output.trim().length > 0

    const diff = await box.git.exec({ args: ["diff", "--stat", BASE_BRANCH, "HEAD"] })
    report.diffstat = diff.output.trim()

    // A branch that goes green by deleting its tests is the failure mode to
    // watch for. Flag any diff that removes lines from tests/.
    const tests = await box.git.exec({ args: ["diff", "--numstat", BASE_BRANCH, "HEAD", "--", "tests/"] })
    report.suspicious = tests.output
      .split("\n")
      .filter(Boolean)
      .some((line) => Number(line.split("\t")[1]) > 0)

    const verify = await box.exec.command("npm test")
    report.testsPass = verify.exitCode === 0

    if (PUSH && report.committed) {
      await box.git.push({ branch: item.branch })
      log(tag, `pushed ${item.branch}`)
    }
  } catch (error) {
    report.error = error instanceof BoxError
      ? `${error.message} (${error.statusCode})`
      : String(error)
    log(tag, `failed: ${report.error}`)
  }

  // Pause rather than delete: you stop paying for CPU, and the box is still
  // there tomorrow with node_modules and the branch exactly as it was.
  await box.pause().catch(() => {})
  log(tag, `paused ${box.id}`)

  return report
}

// ------------------------------------------------------------------- main ---

async function main() {
  const [command, argument] = process.argv.slice(2)

  if (command === "items") return printBacklog()
  if (command === "ls") return listBoxes()
  if (command === "pause") return (await Box.get(argument)).pause()
  if (command === "resume") return resumeBox(argument)

  const all = parseBacklog()
  const wanted = command
    ? new Set(command.split(",").map(Number))
    : null
  const items = wanted ? all.filter((item) => wanted.has(item.number)) : all

  if (items.length === 0) throw new Error(`no backlog items matched "${command}"`)

  console.log(`repo   ${REPO_URL} @ ${BASE_BRANCH}`)
  console.log(`model  ${MODEL} via ${AGENT_KEY === BoxApiKey.UpstashKey ? "the box's own LLM allowance" : "your Anthropic key"}`)
  console.log(`push   ${PUSH ? "on" : "off (branches stay in the box)"}\n`)

  let reports: Report[]

  if (items.length === 1) {
    // One item, one box. No point building a snapshot for a single run.
    const box = await createReadyBox(`pulseboard-${items[0].number}`)
    reports = [await work(box, items[0])]
  } else {
    // Clone and npm install once, snapshot the result, and start every other
    // box from that image. Otherwise you pay for the same install ten times.
    console.log(`${items.length} items. Building the base image first.\n`)
    const first = items[0]
    const base = await createReadyBox(`pulseboard-${first.number}`)
    const snapshot = await base.snapshot({ name: `pulseboard-${BASE_BRANCH}` })
    console.log(`snapshot ${snapshot.id} ready — starting ${items.length} agents\n`)

    reports = await Promise.all([
      work(base, first),
      ...items.slice(1).map(async (item) => {
        const box = await boxFromSnapshot(snapshot, `pulseboard-${item.number}`)
        return work(box, item)
      }),
    ])
  }

  summarize(reports)
}

function summarize(reports: Report[]) {
  console.log("\n─── morning report ───────────────────────────────────────────")
  for (const report of reports.sort((a, b) => a.item.number - b.item.number)) {
    const state = report.error
      ? "errored"
      : !report.committed
        ? "no commit"
        : report.suspicious
          ? "REVIEW — deleted test lines"
          : report.testsPass
            ? "ok"
            : "tests failing"

    console.log(
      `${report.item.branch.padEnd(34)} ${state.padEnd(28)} ` +
        `$${report.costUsd.toFixed(2).padStart(5)}  ${report.boxId}`,
    )
    if (report.diffstat) {
      console.log(report.diffstat.split("\n").map((l) => `    ${l}`).join("\n"))
    }
  }
  console.log("\nBoxes are paused, not deleted. Resume one with:")
  console.log("  npx tsx orchestrator.mts resume <box-id>")
}

/** Dry run: see what the file parsed into before you spend anything. */
function printBacklog() {
  for (const item of parseBacklog()) {
    console.log(`${String(item.number).padStart(2)}  ${item.branch.padEnd(34)} ${item.title}`)
  }
}

async function listBoxes() {
  for (const box of await Box.list({ label: "pulseboard" })) {
    console.log(`${box.id}  ${(box.name ?? "").padEnd(20)} ${box.status}`)
  }
}

async function resumeBox(boxId: string) {
  const box = await Box.get(boxId)
  await box.resume()
  await box.cd(FOLDER)

  // Everything is exactly where the agent left it — nothing was rebuilt.
  const branch = await box.git.exec({ args: ["rev-parse", "--abbrev-ref", "HEAD"] })
  const status = await box.git.status()
  const files = await box.files.list(`${box.cwd}`)

  console.log(`resumed ${boxId} on ${branch.output.trim()}`)
  console.log(files.map((file) => file.name).join("  "))
  console.log(status)
}

// ------------------------------------------------------------------ utils ---

function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing ${name} — put it in .env`)
  return value
}

function log(tag: string, message: string) {
  console.log(`[${tag.padStart(2)}] ${message}`)
}

/** Ten agents streaming at once: buffer to whole lines so they stay readable. */
function prefixed(tag: string) {
  let buffer = ""
  return {
    write(text: string) {
      buffer += text
      const lines = buffer.split("\n")
      buffer = lines.pop() ?? ""
      for (const line of lines) log(tag, line)
    },
    flush() {
      if (buffer.trim()) log(tag, buffer)
      buffer = ""
    },
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
