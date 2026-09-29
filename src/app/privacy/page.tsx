import Link from 'next/link';

const CHECK = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f7181" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
);

const CROSS = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d1b2a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 no-underline transition-colors hover:text-brand-700">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Back to home
        </Link>
        <p className="eyebrow">Privacy</p>
        <h1 className="mt-2 text-3xl text-ink-900 sm:text-4xl">Your data stays in your browser</h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-600">
          ClearFlow is a small public-data tool that runs entirely in your browser. We handle your address and
          anything you share carefully and transparently.
        </p>
      </div>

      {/* Client-side reality callout */}
      <div className="mb-10 rounded-2xl border border-brand-200 bg-brand-50 p-5">
        <h2 className="mb-1 flex items-center gap-2 text-base font-semibold text-ink-900">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f7181" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
          No server, no cloud database
        </h2>
        <p className="text-sm leading-relaxed text-ink-600">
          This demo is a static app with no backend. Your check results, water grade, and any pilot signup are
          stored <strong>only in your browser</strong> (sessionStorage and localStorage on your device). They
          are never sent to or stored on a ClearFlow server, because there is not one. Clearing your browser
          data removes everything.
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-xl text-ink-900">What we handle</h2>
          <div className="space-y-4">
            {[
              {
                title: 'Address (to find your water system)',
                body: <>When you check your water, your address is used to find the public water system most likely serving your location. It is processed <strong>in your browser</strong> and is <strong>not stored raw</strong> — we hash it before saving.</>,
              },
              {
                title: 'Hashed address + check result',
                body: <>We create a one-way hash of your address and keep that, along with the water-system match and compliance snapshot, in your browser session. The hash lets the results page reference your check without storing the raw address.</>,
              },
              {
                title: 'Pilot signup (optional)',
                body: <>If you join the ClearFlow pilot, the details you provide (name, email, city/state, household goal, optional phone) are saved in your browser&apos;s local storage so the demo admin view can show them. In a real deployment this is where a lead would be sent to a monitored inbox or CRM.</>,
              },
            ].map((item, i) => (
              <div key={i} className="surface-card p-4">
                <h3 className="mb-2 font-semibold text-ink-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-ink-600">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl text-ink-900">Address handling</h2>
          <ul className="space-y-3">
            {[
              'Your address is geocoded and matched in your browser — it does not leave your device to a ClearFlow server.',
              'We do not keep the raw address text. Instead we store a one-way hash of it.',
              'The hash is not reversible — the raw address cannot be recovered from it.',
              'The hash and match result let the results page reload within the same browser session.',
              'To remove everything, clear this site\u2019s data in your browser.',
            ].map((item, i) => (
              <li key={i} className="flex gap-3">
                {CHECK}
                <span className="text-sm text-ink-600">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-xl text-ink-900">Retention</h2>
          <div className="space-y-4">
            <div className="surface-card p-4">
              <h3 className="mb-2 font-semibold text-ink-900">Check results and grade</h3>
              <p className="text-sm leading-relaxed text-ink-600">
                Held in your browser&apos;s session storage and cleared when you close the tab or clear site
                data. Nothing persists on a server.
              </p>
            </div>
            <div className="surface-card p-4">
              <h3 className="mb-2 font-semibold text-ink-900">Pilot signups</h3>
              <p className="text-sm leading-relaxed text-ink-600">
                Held in your browser&apos;s local storage for this demo so the admin view can display them.
                They stay until you clear site data. We do not sell or share pilot data.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl text-ink-900">What we do not do</h2>
          <ul className="space-y-3">
            {[
              'We do not send your address or signup to a ClearFlow server (there is not one in this demo).',
              'We do not sell your data or share it with data brokers.',
              'We do not use your address for advertising or marketing.',
              'We do not store your raw address — only a one-way hash.',
              'We do not use large language models to decide your water treatment path.',
            ].map((item, i) => (
              <li key={i} className="flex gap-3">
                {CROSS}
                <span className="text-sm text-ink-600">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-xl text-ink-900">Deletion and contact</h2>
          <div className="surface-card p-4">
            <p className="mb-2 text-sm leading-relaxed text-ink-600">
              Because your data lives only in your browser, you can delete all of it yourself by clearing this
              site&apos;s storage. For questions about this demo:
            </p>
            <p className="text-sm font-medium text-ink-900">clearflow@example.com</p>
            <p className="mt-2 text-xs leading-relaxed text-ink-400">(placeholder contact — a real deployment would use a monitored inbox)</p>
          </div>
        </section>
      </div>

      <div className="mt-10 rounded-xl border border-ink-100 bg-ink-50/60 p-4">
        <p className="text-xs leading-relaxed text-ink-500">
          ClearFlow uses public EPA and local utility data. A home test is recommended before making
          household-specific treatment decisions.
        </p>
      </div>
    </div>
  );
}
