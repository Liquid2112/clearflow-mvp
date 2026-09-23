import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-brand-900 hover:text-brand-600 transition-colors mb-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Back to home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-900 mb-3">Privacy</h1>
        <p className="text-lg text-brand-800/70 leading-relaxed max-w-2xl">
          ClearFlow is a small public-data tool. We handle your address and any information you share with us carefully and transparently.
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-bold text-brand-900 mb-4">What we collect</h2>
          <div className="space-y-4">
            {[
              {
                title: 'Address (to find your water system)',
                body: <>When you check your water, we use your address to find the public water system most likely serving your location. The address is <strong>not stored raw</strong> by default — we hash it before storing.</>,
              },
              {
                title: 'Hashed address',
                body: <>We create a one-way hash of your address and store that, along with the water-system match result and compliance snapshot. The hash lets us reference your check without storing the raw address.</>,
              },
              {
                title: 'Lead information (optional)',
                body: <>If you join the ClearFlow pilot, we collect the information you choose to provide: name, email, city/state, household goal, and optional phone. This is used only to follow up with your recommendation.</>,
              },
            ].map((item, i) => (
              <div key={i} className="p-4 bg-white rounded-xl border border-brand-100">
                <h3 className="font-semibold text-brand-900 mb-2">{item.title}</h3>
                <p className="text-sm text-brand-700/80 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-brand-900 mb-4">Address handling</h2>
          <ul className="space-y-3">
            {[
              'Your address is sent from your browser to our server only to perform the water-system match.',
              'We do not store the raw address text by default. Instead, we store a hash of the address.',
              'The hash is not reversible — we cannot recover your address from it.',
              'The hash and match result let us show your results page when you revisit with the same check ID.',
              'If you want your address hash deleted, contact us (see below).',
            ].map((item, i) => (
              <li key={i} className="flex gap-3 items-start">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0"><polyline points="20 6 9 17 4 12" /></svg>
                <span className="text-sm text-brand-700/80">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-brand-900 mb-4">Data retention</h2>
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-xl border border-brand-100">
              <h3 className="font-semibold text-brand-900 mb-2">Address hashes</h3>
              <p className="text-sm text-brand-700/80 leading-relaxed">
                Address hashes and check results are kept for <strong>90 days</strong> and then deleted.
                <span className="block mt-1 text-brand-600/60">(placeholder — a real deployment would set and enforce this automatically)</span>
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-brand-100">
              <h3 className="font-semibold text-brand-900 mb-2">Leads (pilot participants)</h3>
              <p className="text-sm text-brand-700/80 leading-relaxed">
                Leads who join the ClearFlow pilot are kept so we can follow up with their recommendation and improve the service. We do not sell lead information and do not share it with third parties.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-brand-900 mb-4">What we do not do</h2>
          <ul className="space-y-3">
            {[
              'We do not sell your data to third parties.',
              'We do not share your address or lead information with data brokers.',
              'We do not use your address for advertising or marketing beyond this service.',
              'We do not store your raw address by default.',
              'We do not use large language models to decide your water treatment path.',
            ].map((item, i) => (
              <li key={i} className="flex gap-3 items-start">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0c4a6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                <span className="text-sm text-brand-700/80">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-brand-900 mb-4">Deletion and contact</h2>
          <div className="p-4 bg-white rounded-xl border border-brand-100">
            <p className="text-sm text-brand-700/80 leading-relaxed mb-2">To request deletion of your address hash, check results, or lead record:</p>
            <p className="text-sm font-medium text-brand-900">clearflow@example.com</p>
            <p className="text-xs text-brand-600/60 mt-2 leading-relaxed">(placeholder contact — a real deployment would use a monitored inbox)</p>
          </div>
        </section>
      </div>

      <div className="mt-10 p-4 bg-brand-50 rounded-lg border border-brand-100">
        <p className="text-xs text-brand-800/70 leading-relaxed">
          ClearFlow uses public EPA and local utility data. A home test is recommended before making household-specific treatment decisions.
        </p>
      </div>
    </div>
  );
}
