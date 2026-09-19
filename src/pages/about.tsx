import { NextPage } from 'next';
import { NextSeo } from 'next-seo';

import Container from '@/common/components/elements/Container';
import PageHeading from '@/common/components/elements/PageHeading';
import { PAGE_SEO } from '@/common/constant/seo';
import { buildSeo } from '@/common/libs/seo';
import About from '@/modules/about';

const PAGE_TITLE = 'About';
// Visible subtitle only. The meta description lives in PAGE_SEO.about and
// intentionally leaves the location out.
const PAGE_DESCRIPTION =
  'Awad Ali – full stack software engineer from Kochi, Kerala. My story, career at SFO Technologies, Arwa World and Steyp, skills and education.';

const AboutPage: NextPage = () => {
  return (
    <>
      <NextSeo {...buildSeo(PAGE_SEO.about)} />
      <Container data-aos='fade-up'>
        <PageHeading title={PAGE_TITLE} description={PAGE_DESCRIPTION} />
        <About />
      </Container>
    </>
  );
};

export default AboutPage;
