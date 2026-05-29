import { NextPage } from 'next';
import { NextSeo } from 'next-seo';

import Container from '@/common/components/elements/Container';
import PageHeading from '@/common/components/elements/PageHeading';
import Dashboard from '@/modules/dashboard';

const PAGE_TITLE = 'Dashboard';
const PAGE_DESCRIPTION =
  'A personal dashboard tracking my coding activity, GitHub contributions, and music taste.';

const DashboardPage: NextPage = () => {
  return (
    <>
      <NextSeo title={`${PAGE_TITLE} - Awad Ali`} />
      <Container data-aos='fade-up'>
        <PageHeading title={PAGE_TITLE} description={PAGE_DESCRIPTION} />
        <Dashboard />
      </Container>
    </>
  );
};

export default DashboardPage;
