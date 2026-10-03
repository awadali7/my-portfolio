export interface SeoImageProps {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
}

export interface PageSeoProps {
  path: string;
  title: string;
  description: string;
  noindex?: boolean;
}

export interface BuildSeoProps extends PageSeoProps {
  image?: SeoImageProps;
  type?: 'website' | 'article' | 'profile';
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    authors?: string[];
    section?: string;
    tags?: string[];
  };
  /** Points search engines elsewhere, e.g. at a post's original home. */
  canonical?: string;
  /** Extra <meta name> tags, e.g. the reading-time labels X and Slack show. */
  extraMetaTags?: { name: string; content: string }[];
}
