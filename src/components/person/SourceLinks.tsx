import type { PersonSources } from '../../types';

const links: { key: keyof PersonSources; label: string; urlPrefix: string }[] = [
  { key: 'githubUsername', label: 'GitHub', urlPrefix: 'https://github.com/' },
  { key: 'xHandle', label: 'X', urlPrefix: 'https://x.com/' },
  { key: 'linkedinSlug', label: 'LinkedIn', urlPrefix: 'https://linkedin.com/in/' },
  { key: 'semanticScholarId', label: 'Scholar', urlPrefix: 'https://www.semanticscholar.org/author/' },
  { key: 'personalSite', label: 'Website', urlPrefix: '' },
];

export function SourceLinks({ sources }: { sources: PersonSources }) {
  const available = links.filter((l) => sources[l.key]);
  if (available.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {available.map((l) => (
        <a
          key={l.key}
          href={`${l.urlPrefix}${sources[l.key]}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-lg text-gray-300 hover:text-white hover:border-gray-600 transition-colors"
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}
