const canonicalUrl = 'https://awad.id';
const metaImage = 'https://cloud.awad.com/public/images/awad-id.png';
const metaDescription =
  'Seasoned Software Engineer especially in Frontend side, with a passion for creating pixel-perfect web experiences';

const defaultSEOConfig = {
  defaultTitle: 'Awad Ali - Personal Website',
  description: metaDescription,
  canonical: canonicalUrl,
  openGraph: {
    canonical: canonicalUrl,
    title: 'Awad Ali - Personal Website',
    description: metaDescription,
    type: 'website',
    images: [
      {
        url: metaImage,
        alt: 'awad.id og-image',
        width: 800,
        height: 600,
      },
      {
        url: metaImage,
        alt: 'awad.id og-image',
        width: 1200,
        height: 630,
      },
      {
        url: metaImage,
        alt: 'awad.id og-image',
        width: 1600,
        height: 900,
      },
    ],
    site_name: 'awad.id',
  },
  twitter: {
    handle: '@handle',
    site: '@site',
    cardType: 'summary_large_image',
  },
};

export default defaultSEOConfig;
