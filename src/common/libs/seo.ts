import { NextSeoProps } from 'next-seo';

import {
  DEFAULT_OG_IMAGE,
  SITE_LOCALE,
  SITE_NAME,
  SITE_URL,
} from '../constant/site';
import { BuildSeoProps } from '../types/seo';

// Pages Router equivalent of the App Router's `metadataBase`: every canonical
// and OpenGraph URL goes through here so relative paths resolve to SITE_URL.
export const absoluteUrl = (path: string) => {
  if (/^https?:\/\//.test(path)) return path;
  if (path === '/') return SITE_URL;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

export const buildSeo = ({
  path,
  title,
  description,
  noindex = false,
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  article,
}: BuildSeoProps): NextSeoProps => {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image.url);
  const imageAlt = image.alt ?? title;

  return {
    title,
    description,
    canonical: noindex ? undefined : url,
    noindex,
    openGraph: {
      url,
      title,
      description,
      type,
      locale: SITE_LOCALE,
      siteName: SITE_NAME,
      images: [{ ...image, url: imageUrl, alt: imageAlt }],
      article,
    },
    // next-seo only emits twitter:card/site/creator. X falls back to og:*,
    // but explicit tags keep every card consistent.
    additionalMetaTags: [
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: imageUrl },
      { name: 'twitter:image:alt', content: imageAlt },
    ],
  };
};
