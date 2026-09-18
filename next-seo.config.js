const canonicalUrl = 'https://www.awadali.com';
const metaImage = `${canonicalUrl}/images/awad-ali.jpeg`;
const metaTitle =
  'Awad Ali – Full Stack Software Engineer & Next.js Developer, Kerala';
const metaDescription =
  'Awad Ali is a full stack software engineer at SFO Technologies in Kochi, Kerala, building fast, scalable web apps with Next.js, React, Node.js and .NET.';

const defaultSEOConfig = {
  defaultTitle: metaTitle,
  description: metaDescription,
  canonical: canonicalUrl,
  openGraph: {
    canonical: canonicalUrl,
    title: metaTitle,
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
  additionalMetaTags: [
    {
      name: 'keywords',
      content:
        'Awad Ali, software engineer Kerala, software engineer Kochi, full stack developer Kerala, Next.js developer Kerala, React developer Kochi, SFO Technologies software engineer',
    },
  ],
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
  jobTitle: 'Full Stack Software Engineer',
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
    'Full Stack Development',
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
