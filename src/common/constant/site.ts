import { SeoImageProps } from '../types/seo';

// www is the primary host: https://awadali.com 308-redirects to it.
export const SITE_URL = 'https://www.awadali.com';

export const SITE_NAME = 'Awad Ali';

export const SITE_LOCALE = 'en_US';

export const TWITTER_HANDLE = '@awadali91206435';

// TODO(awad): replace with a 1200x630 image designed for social cards.
// summary_large_image crops this 576x576 photo.
export const DEFAULT_OG_IMAGE: SeoImageProps = {
  url: '/images/awad-ali.jpeg',
  width: 576,
  height: 576,
  alt: 'Awad Ali, freelance Next.js and React developer',
};
