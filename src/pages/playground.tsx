import { NextPage } from 'next';
import { NextSeo } from 'next-seo';
import React from 'react';

import Container from '@/common/components/elements/Container';
import { PAGE_SEO } from '@/common/constant/seo';
import { buildSeo } from '@/common/libs/seo';
import Playground from '@/modules/playground';

const playground: NextPage = () => {
  return (
    <>
      <NextSeo {...buildSeo(PAGE_SEO.playground)} />
      <Container className='!mt-0 pt-20 md:pt-0' data-aos='fade-up'>
        <Playground id='playground' isHeading />
      </Container>
    </>
  );
};

export default playground;
