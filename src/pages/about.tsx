import { NextPage } from 'next';
import { NextSeo } from 'next-seo';

import Container from '@/common/components/elements/Container';
import PageHeading from '@/common/components/elements/PageHeading';
import About from '@/modules/about';

const PAGE_TITLE = 'About';
const PAGE_DESCRIPTION =
  'Awad Ali – full stack software engineer from Kochi, Kerala. My story, career at SFO Technologies, Arwa World and Steyp, skills and education.';

const AboutPage: NextPage = () => {
  return (
    <>
      <NextSeo
        title={`${PAGE_TITLE} - Awad Ali`}
        description={PAGE_DESCRIPTION}
      />
      <Container data-aos='fade-up'>
        <PageHeading title={PAGE_TITLE} description={PAGE_DESCRIPTION} />
        <About />
      </Container>
    </>
  );
};

export default AboutPage;
