import { Link } from 'react-router-dom';

const stats = [
  { label: 'Companies Tracked', value: '50+' },
  { label: 'AI Talent Monitored', value: '500+' },
  { label: 'Data Sources', value: '7' },
  { label: 'Update Frequency', value: '6-48h' },
];

const sources = [
  'Semantic Scholar',
  'GitHub',
  'LinkedIn (via Apify)',
  'X / Twitter',
  'Company Websites',
  'arXiv Papers',
  'News & RSS',
];

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
          The AI Draft
        </h1>
        <p className="mt-6 text-xl text-gray-400 max-w-2xl mx-auto">
          Real-time career move intelligence across the AI industry.
          Know who's leaving, who's joining, and who's starting something new.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            to="/dashboard"
            className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            View Dashboard
          </Link>
          <Link
            to="/suggest"
            className="border border-gray-700 text-gray-300 px-6 py-3 rounded-lg font-medium hover:border-gray-500 hover:text-white transition-colors"
          >
            Suggest Someone
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-800 bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold">{s.value}</p>
              <p className="text-sm text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-3xl mb-3">1</p>
            <h3 className="font-semibold mb-2">Collect</h3>
            <p className="text-sm text-gray-400">
              7 automated collectors scan LinkedIn, GitHub, Semantic Scholar, X,
              company websites, arXiv, and news feeds.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-3xl mb-3">2</p>
            <h3 className="font-semibold mb-2">Analyze</h3>
            <p className="text-sm text-gray-400">
              An AI brain correlates signals across sources, filters noise,
              and determines confidence levels for each detected move.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-3xl mb-3">3</p>
            <h3 className="font-semibold mb-2">Surface</h3>
            <p className="text-sm text-gray-400">
              Verified moves appear on a real-time dashboard with AI-generated
              summaries explaining who moved and why it matters.
            </p>
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-center mb-6">Data Sources</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {sources.map((s) => (
            <span
              key={s}
              className="bg-gray-900 border border-gray-800 px-4 py-2 rounded-full text-sm text-gray-300"
            >
              {s}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
