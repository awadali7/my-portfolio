import { DefaultSeoProps } from 'next-seo';

import {
  DEFAULT_OG_IMAGE,
  SITE_LOCALE,
  SITE_NAME,
  SITE_URL,
  TWITTER_HANDLE,
} from './site';
import { absoluteUrl } from '../libs/seo';
import { ProjectItemProps } from '../types/projects';
import { PageSeoProps } from '../types/seo';

type StaticPageKey =
  | 'home'
  | 'about'
  | 'contact'
  | 'projects'
  | 'dashboard'
  | 'playground'
  | 'notFound';

// Single source of truth for static routes. Titles and descriptions must be
// unique across the site (enforced in src/__tests__/seo/seo.test.ts).
export const PAGE_SEO: Record<StaticPageKey, PageSeoProps> = {
  home: {
    path: '/',
    title: 'Awad Ali — Freelance Next.js & React Developer | Dubai & Europe',
    description:
      'Full-stack developer with 4+ years building Next.js, React and Node.js applications. I work with startups and companies across the UAE, the Gulf and Europe. GMT+5:30 — full overlap with Gulf and European hours.',
  },
  about: {
    path: '/about',
    title: 'About Awad Ali — Full-Stack Next.js & Node.js Developer',
    description:
      '4+ years building web products with Next.js, React and Node.js — from leading an 11-engineer team at Steyp to CTO at Arwa World, delivering for clients in Dubai.',
  },
  contact: {
    path: '/contact',
    title: 'Hire Awad Ali — Start Your Next.js or React Project',
    description:
      'Book a 30-minute call or send a message about your Next.js, React or Node.js project. I work on GMT+5:30, overlapping Gulf and European business hours.',
  },
  projects: {
    path: '/projects',
    title: 'Case Studies — Next.js & React Projects by Awad Ali',
    description:
      'Case studies of Next.js, React and Node.js builds: corporate websites for GCC companies Lazulite and Al Faris Group, the Steyp e-learning platform and DiagTools.',
  },
  dashboard: {
    path: '/dashboard',
    title: 'Developer Dashboard — GitHub Activity | Awad Ali',
    description:
      'My GitHub contribution calendar, pulled live from the GitHub API, alongside a summary of my LinkedIn profile.',
  },
  playground: {
    path: '/playground',
    title: 'JavaScript Playground — Run Code in the Browser | Awad Ali',
    description:
      'An interactive JavaScript playground to write, run, and experiment with code snippets directly in the browser.',
  },
  notFound: {
    path: '/404',
    title: 'Page Not Found | Awad Ali',
    description:
      "This page doesn't exist. Head back to the homepage, browse my projects, or get in touch about your project.",
    noindex: true,
  },
};

export const getProjectPageSeo = (project: ProjectItemProps): PageSeoProps => ({
  path: `/projects/${project.slug}`,
  title: `${project.title} Case Study | Awad Ali`,
  description: project.description,
});

// No canonical, og:url or description here on purpose: a site-wide default
// would leak onto every page that doesn't override it. The fallback image has
// no width/height for the same reason: they'd be attached to page images.
export const DEFAULT_SEO: DefaultSeoProps = {
  defaultTitle: SITE_NAME,
  openGraph: {
    type: 'website',
    locale: SITE_LOCALE,
    siteName: SITE_NAME,
    images: [
      {
        url: absoluteUrl(DEFAULT_OG_IMAGE.url),
        alt: DEFAULT_OG_IMAGE.alt,
      },
    ],
  },
  twitter: {
    handle: TWITTER_HANDLE,
    site: TWITTER_HANDLE,
    cardType: 'summary_large_image',
  },
};

// Moved unchanged from next-seo.config.js. Rebuilt as typed schema in Task 4.
export const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Awad Ali',
  url: SITE_URL,
  image: absoluteUrl(DEFAULT_OG_IMAGE.url),
  jobTitle: 'Full Stack Software Engineer',
  description:
    'Awad Ali is a full stack software engineer at SFO Technologies in Kochi, Kerala, building fast, scalable web apps with Next.js, React, Node.js and .NET.',
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
