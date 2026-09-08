# Backlog

Ten things that are wrong with Pulseboard.

Each item below is handed to one agent, in one box. The agents cannot see each
other and they all branch from `main`, so every item is scoped to its own files.
If two items touched the same file we would get back two branches that fight at
merge time.

Branch naming: `fix/<item-number>-<short-name>`.

---

## 1. The login endpoint has no rate limiting

`POST /api/auth/login` will happily accept ten thousand attempts a second. There
is nothing between a script and every password in the database.

Add per-IP rate limiting to the login route: a small fixed window is fine, in
memory is fine. Reject with `429` and a `Retry-After` header once the limit is
hit. Successful logins should reset the counter for that IP. Cover it with a
test.

Touches: `app/api/auth/login/route.ts`, `lib/rate-limit.ts` (new), `tests/rate-limit.test.ts` (new)

---

## 2. The dashboard loads every row

`listActivity` runs `SELECT ... ORDER BY created_at DESC` with no `LIMIT`, and
the dashboard renders all of it. That is 480 rows today and it will be 480,000
rows the first time a real customer uses this.

Add pagination: 25 rows per page, page number from the `?page=` search param,
previous and next controls, and a "page X of Y" line. `countActivity` already
gives you the total.

Touches: `lib/queries/activity.ts`, `app/dashboard/page.tsx`

---

## 3. The mobile nav does not close after you tap a link

Open the menu on a narrow screen, tap Dashboard, and the page navigates behind a
menu that is still sitting open over the top of it. You have to tap Menu again to
get rid of it.

Close the menu when a link is tapped. Closing it on route change is better than
closing it on click, since it also handles back and forward navigation.

Touches: `components/MobileNav.tsx`

---

## 4. N+1 query on the users list

`listUsers` fetches all users, then loops and runs two more queries per user, one
for the team and one for the event count. Twenty-four users means forty-nine
queries for one page.

Rewrite it as a single query using a join and a group-by. The returned shape must
stay exactly the same, because `app/users/page.tsx` depends on it. The existing
test in `tests/queries.test.ts` should still pass untouched.

Touches: `lib/queries/users.ts`

---

## 5. There are no error or empty states

`app/error.tsx` renders an unstyled `Something went wrong` with no way to
recover. Empty tables render as a header row with nothing under it, which reads
as a broken page rather than an empty one.

Build a shared `ErrorState` component with a title, a description and a retry
action, use it in the error boundary, and add matching empty states to the
dashboard and users tables.

Touches: `app/error.tsx`, `components/ErrorState.tsx` (new)

---

## 6. The seed script cannot be run twice

`npm run seed` works exactly once. The second time it dies on
`UNIQUE constraint failed: users.email`, and the only way out is to delete
`data/app.db` by hand.

Make it idempotent: clear the existing rows before inserting, or skip the seed
if data is already present. Add a `--reset` flag that wipes and reseeds, and
print what it did.

Touches: `scripts/seed.ts`

---

## 7. The README is a stub

Five lines with no context. Nothing about what the app is, what the routes are,
what the environment variables do, or how to run the tests.

Write a proper README: what Pulseboard is, requirements, setup, the environment
variables in `.env.example`, the available npm scripts, the route map, and a
short section on the project layout.

Touches: `README.md`

---

## 8. PDF export is not implemented

`GET /api/reports/export` calls `renderReportPdf`, which throws
`PDF export is not implemented`. The button in the UI has never worked.

Implement it. Render the per-user report rows to a real PDF and return it with
the correct content type so the browser downloads it.

Touches: `lib/pdf.ts`, `app/api/reports/export/route.ts`

---

## 9. Password reset tokens never expire

`createResetToken` writes a token and a timestamp. `verifyResetToken` ignores the
timestamp entirely, so a reset link found in an old inbox two years from now still
works. `tests/reset.test.ts` already has a failing test for this.

Give tokens a one hour lifetime and enforce it in `verifyResetToken`. Make the
failing test pass.

Touches: `lib/auth/reset.ts`, `tests/reset.test.ts`

---

## 10. The daily digest ignores user timezones

Every user has a `timezone` column and `usersDueForDigest` never reads it. It
compares against the server clock, so either everybody gets the digest at once or
nobody does. The test for this is failing.

Send to each user at 09:00 in their own timezone. Make the failing test in
`tests/digest.test.ts` pass without changing what it asserts.

Touches: `lib/digest.ts`, `tests/digest.test.ts`
