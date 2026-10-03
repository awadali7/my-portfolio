import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown, { uriTransformer } from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { absoluteUrl } from './seo';

/**
 * Plain HTML for a post body, for places that can't run the page's React
 * renderer, such as the RSS feed. Server-side only.
 *
 * Relative links and images become absolute, because a feed reader has no
 * page to resolve them against. Unsafe schemes are still stripped first.
 */
const absolutize = (uri: string, pagePath: string): string => {
  const safe = uriTransformer(uri);
  if (!safe) return safe;
  if (safe.startsWith('#')) return absoluteUrl(`${pagePath}${safe}`);
  if (safe.startsWith('/')) return absoluteUrl(safe);
  return safe;
};

export const markdownToHtml = (markdown: string, pagePath: string): string =>
  renderToStaticMarkup(
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      transformLinkUri={(href) => absolutize(href, pagePath)}
      transformImageUri={(src) => absolutize(src, pagePath)}
    >
      {markdown}
    </ReactMarkdown>,
  );
