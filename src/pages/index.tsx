import { NextPage } from 'next';
import { NextSeo } from 'next-seo';

import Container from '@/common/components/elements/Container';
import { PAGE_SEO } from '@/common/constant/seo';
import { buildSeo } from '@/common/libs/seo';
import Home from '@/modules/home';

const HomePage: NextPage = () => {
  return (
    <>
      <NextSeo {...buildSeo(PAGE_SEO.home)} />
      <Container data-aos='fade-up'>
        <Home />
      </Container>
    </>
  );
};

export default HomePage;
