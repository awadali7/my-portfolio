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
    tags?: string[];
  };
}
