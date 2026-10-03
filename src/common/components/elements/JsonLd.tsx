import Head from 'next/head';

import { serializeJsonLd } from '@/common/libs/structured-data';

type JsonLdProps = {
  /** Keeps next/head from emitting the same block twice. */
  id: string;
  data: object;
};

const JsonLd = ({ id, data }: JsonLdProps) => (
  <Head>
    <script
      key={`jsonld-${id}`}
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  </Head>
);

export default JsonLd;
