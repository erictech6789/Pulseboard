/**
 * Team accent colours. Three slots only — beyond three the hues stop being
 * reliably separable, and the team name is always spelled out beside the
 * avatar anyway, so the colour is reinforcement rather than the label.
 */
const ACCENTS = ['#2a78d6', '#eb6834', '#1baf7a']

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()
}

export default function Avatar({ name, accent = 0 }: { name: string; accent?: number }) {
  const colour = ACCENTS[accent % ACCENTS.length]

  return (
    <span
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-ink"
      style={{ backgroundColor: `${colour}1f`, boxShadow: `inset 0 0 0 1.5px ${colour}` }}
      aria-hidden
    >
      {initials(name)}
    </span>
  )
}
