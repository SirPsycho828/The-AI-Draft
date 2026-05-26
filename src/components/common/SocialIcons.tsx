import type { PersonSources } from '../../types';

interface SocialIconsProps {
  sources: PersonSources;
  className?: string;
}

interface SocialLink {
  key: keyof PersonSources;
  label: string;
  urlPrefix: string;
  svg: string;
}

const SOCIAL_LINKS: SocialLink[] = [
  {
    key: 'githubUsername',
    label: 'GitHub',
    urlPrefix: 'https://github.com/',
    svg: 'M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.66-.22.66-.48v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0112 6.8c.85.004 1.71.11 2.51.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.16.58.67.48A10.01 10.01 0 0022 12c0-5.52-4.48-10-10-10z',
  },
  {
    key: 'linkedinSlug',
    label: 'LinkedIn',
    urlPrefix: 'https://linkedin.com/in/',
    svg: 'M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.37V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.26 2.37 4.26 5.45v6.29zM5.34 7.43a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zM7.12 20.45H3.56V9h3.56v11.45z',
  },
  {
    key: 'xHandle',
    label: 'X',
    urlPrefix: 'https://x.com/',
    svg: 'M18.24 2.25h3.13l-6.84 7.82 8.05 10.68h-6.3l-4.93-6.45-5.65 6.45H2.56l7.31-8.36L2.12 2.25h6.46l4.46 5.9 5.2-5.9zm-1.1 16.63h1.74L7.04 4.03H5.18l11.96 14.85z',
  },
  {
    key: 'semanticScholarId',
    label: 'Scholar',
    urlPrefix: 'https://www.semanticscholar.org/author/',
    svg: 'M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z',
  },
  {
    key: 'personalSite',
    label: 'Website',
    urlPrefix: '',
    svg: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
  },
];

export function SocialIcons({ sources, className = '' }: SocialIconsProps) {
  const available = SOCIAL_LINKS.filter((link) => sources[link.key]);

  if (available.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {available.map((link) => {
        const value = sources[link.key]!;
        const href = link.urlPrefix ? `${link.urlPrefix}${value}` : value;
        return (
          <a
            key={link.key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={link.label}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path d={link.svg} />
            </svg>
          </a>
        );
      })}
    </div>
  );
}
