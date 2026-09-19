import { NextPage } from 'next';
import { NextSeo } from 'next-seo';

import Container from '@/common/components/elements/Container';
import PageHeading from '@/common/components/elements/PageHeading';
import { PAGE_SEO } from '@/common/constant/seo';
import { buildSeo } from '@/common/libs/seo';
import Dashboard from '@/modules/dashboard';

const PAGE_TITLE = 'Dashboard';

const DashboardPage: NextPage = () => {
  return (
    <>
      <NextSeo {...buildSeo(PAGE_SEO.dashboard)} />
      <Container data-aos='fade-up'>
        <PageHeading
          title={PAGE_TITLE}
          description={PAGE_SEO.dashboard.description}
        />
        <Dashboard />
      </Container>
    </>
  );
};

export default DashboardPage;
