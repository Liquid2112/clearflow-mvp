import Link from 'next/link';

/**
 * A static preview of the Whoop-style water grade ring used on the results
 * page. Rendered as layered SVG (no chart lib) so the hero shows the actual
 * product artifact rather than clip-art.
 */
function GradeRingPreview() {
  const size = 260;
  const stroke = 20;
  const r = (size - stroke) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  const pct = 0.84; // B-grade preview
  const dash = circ * pct;

  return (
    <div className="relative mx-auto w-[260px] max-w-full">
      {/* Soft aura behind the ring */}
      <div className="absolute inset-0 -z-10 rounded-full bg-brand-200/40 blur-3xl" aria-hidden="true" />
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-[0_20px_40px_rgba(13,27,42,0.18)]" role="img" aria-label="Example water grade of B, score 84 out of 100">
        <defs>
          <linearGradient id="hero-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#17b0bd" />
          </linearGradient>
        </defs>
        <circle cx={c} cy={c} r={r} fill="#ffffff" />
        <circle cx={c} cy={c} r={r} fill="none" stroke="#eef2f5" strokeWidth={stroke} />
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke="url(#hero-ring)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
          transform={`rotate(-90 ${c} ${c})`}
        />
        <text x={c} y={c - 6} textAnchor="middle" className="font-display" style={{ fontSize: 76, fontWeight: 700, fill: '#15803d' }}>
          B
        </text>
        <text x={c} y={c + 28} textAnchor="middle" style={{ fontSize: 18, fontWeight: 600, fill: '#5b7085' }}>
          84 / 100
        </text>
      </svg>

      {/* Floating sub-score chips to suggest the "metric" depth */}
      <div className="absolute -left-6 top-8 hidden rounded-xl border border-ink-100 bg-white px-3 py-2 shadow-card sm:block">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">Chlorine</p>
        <p className="text-sm font-bold text-brand-700">Fair</p>
      </div>
      <div className="absolute -right-4 bottom-10 hidden rounded-xl border border-ink-100 bg-white px-3 py-2 shadow-card sm:block">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">Compliance</p>
        <p className="text-sm font-bold text-brand-700">Clean record</p>
      </div>
    </div>
  );
}

const STEPS = [
  {
    n: '01',
    title: 'Enter your location',
    body: 'Drop in your address or ZIP. We match it to the public water system most likely serving you — no account, no test kit required to start.',
    icon: (
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 13a3 3 0 100-6 3 3 0 000 6z" />
    ),
  },
  {
    n: '02',
    title: 'Get your water grade',
    body: 'We translate EPA and utility compliance data into a single Whoop-style grade, with sub-scores for contaminants, chlorine, hardness and the utility record.',
    icon: <path d="M12 2a10 10 0 100 20 10 10 0 000-20z M12 8v4l3 2" />,
  },
  {
    n: '03',
    title: 'Ship a plan, then improve',
    body: 'Answer a short quiz and get a deterministic, no-upsell treatment plan — plus a projected grade so you can see how far each step moves the needle.',
    icon: <path d="M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3" />,
  },
];

export default function HomePage() {
  return (
    <div className="bg-hero-mesh">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            Built on public EPA &amp; SDWIS data
          </span>

          <h1 className="mt-5 text-4xl leading-[1.05] text-ink-900 sm:text-5xl lg:text-6xl">
            Know your water.
            <br />
            <span className="italic text-brand-700">Grade it.</span> Improve it.
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-600">
            ClearFlow turns free public water-system data into a personalized water grade and a
            shippable treatment plan. Like a fitness score for your tap — one you can actually move.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/check-water" className="btn-primary text-base">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              Check my water
            </Link>
            <Link href="/how-it-works" className="btn-ghost text-base">
              See how it works
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="mt-8 flex items-start gap-3 rounded-xl border border-brand-100 bg-white/70 p-4 backdrop-blur-sm">
            <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <p className="text-sm leading-relaxed text-ink-600">
              <strong className="text-ink-800">A likely match, not a tap test.</strong> We show what public
              data says about your system. A home test is recommended before household-specific decisions.
            </p>
          </div>
        </div>

        <div className="animate-fade-in lg:pl-6">
          <GradeRingPreview />
        </div>
      </section>

      {/* ── How it works (3 steps, varied rhythm) ────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-2 text-3xl text-ink-900 sm:text-4xl">
            From a public dataset to a plan you can ship — in three steps.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={step.n}
              className={`surface-card flex flex-col p-6 ${i === 1 ? 'md:mt-8' : ''} ${i === 2 ? 'md:mt-16' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {step.icon}
                  </svg>
                </span>
                <span className="font-display text-2xl font-semibold text-ink-200">{step.n}</span>
              </div>
              <h3 className="mt-4 text-lg text-ink-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Credibility band ─────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="surface-card overflow-hidden">
          <div className="grid gap-px bg-ink-100 sm:grid-cols-3">
            {[
              { stat: '100%', label: 'Public data', sub: 'EPA SDWIS / ECHO compliance records and Consumer Confidence Reports.' },
              { stat: 'Deterministic', label: 'No AI guesswork', sub: 'The same inputs always produce the same grade and plan. You can see why.' },
              { stat: 'No upsell', label: 'Not a sales pitch', sub: 'We are not paid to recommend a product. A test-first path is always offered.' },
            ].map((item) => (
              <div key={item.label} className="bg-white p-6">
                <p className="font-display text-2xl font-semibold text-brand-700">{item.stat}</p>
                <p className="mt-1 text-sm font-semibold text-ink-800">{item.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing CTA ──────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-4xl bg-ink-900 px-6 py-12 text-center shadow-lift sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute inset-0 bg-hero-mesh opacity-60" aria-hidden="true" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl text-white sm:text-4xl">
              Curious what grade your water would get?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ink-300">
              Start with your address. We will find your water system, grade it, and help you decide the
              right next step.
            </p>
            <Link href="/check-water" className="btn-accent mt-8 text-base">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Check my water
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
