import { NextPage } from 'next';
import { NextSeo } from 'next-seo';
import React from 'react';

import Container from '@/common/components/elements/Container';
import Playground from '@/modules/playground';

const PAGE_TITLE = 'JavaScript Playground';
const PAGE_DESCRIPTION =
  'An interactive JavaScript playground to write, run, and experiment with code snippets directly in the browser.';

const playground: NextPage = () => {
  return (
    <>
      <NextSeo
        title={`${PAGE_TITLE} - Awad Ali`}
        description={PAGE_DESCRIPTION}
      />
      <Container className='!mt-0 pt-20 md:pt-0' data-aos='fade-up'>
        <Playground id='playground' isHeading />
      </Container>
    </>
  );
};

export default playground;
