import Head from 'next/head';

import { BLOG_NAME } from '@/common/constant/blog';
import { absoluteUrl } from '@/common/libs/seo';

/** Lets feed readers and browsers discover the RSS feed from any blog page. */
const FeedLink = () => (
  <Head>
    <link
      key='blog-feed'
      rel='alternate'
      type='application/rss+xml'
      title={BLOG_NAME}
      href={absoluteUrl('/blog/feed.xml')}
    />
  </Head>
);

export default FeedLink;
