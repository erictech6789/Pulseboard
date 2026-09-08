const tones = {
  neutral: 'border-hairline bg-plane text-ink2',
  accent: 'border-accent/25 bg-accent/10 text-ink',
} as const

export default function Badge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode
  tone?: keyof typeof tones
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${tones[tone]}`}
    >
      {children}
    </span>
  )
}
