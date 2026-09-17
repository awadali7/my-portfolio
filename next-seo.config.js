const canonicalUrl = 'https://www.awadali.com';
const metaImage = `${canonicalUrl}/images/awad-ali.jpeg`;
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
        alt: 'awadali.com og-image',
        width: 576,
        height: 576,
      },
    ],
    site_name: 'awadali.com',
  },
  twitter: {
    handle: '@awadali91206435',
    site: '@awadali91206435',
    cardType: 'summary_large_image',
  },
};

export const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Awad Ali',
  url: canonicalUrl,
  image: metaImage,
  jobTitle: 'Software Engineer',
  description: metaDescription,
  email: 'mailtoawadali@gmail.com',
  worksFor: {
    '@type': 'Organization',
    name: 'SFO Technologies',
    url: 'https://www.sfotechnologies.com/',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Kochi',
    addressRegion: 'Kerala',
    addressCountry: 'IN',
  },
  sameAs: [
    'https://www.linkedin.com/in/awad-ali7/',
    'https://twitter.com/awadali91206435',
    'https://github.com/awadali7',
    'https://www.instagram.com/awadail.in',
  ],
  knowsAbout: [
    'JavaScript',
    'TypeScript',
    'React',
    'Next.js',
    'Node.js',
    'Django',
    '.NET',
  ],
};

export default defaultSEOConfig;
