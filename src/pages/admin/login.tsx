import { GetServerSideProps, NextPage } from 'next';
import { NextSeo } from 'next-seo';

import Container from '@/common/components/elements/Container';
import { readAdminToken } from '@/common/libs/admin-session';
import LoginForm from '@/modules/admin/components/LoginForm';
import MyyeePwa from '@/modules/admin/components/MyyeePwa';
import { getAdminProfile } from '@/services/emi';

const AdminLoginPage: NextPage = () => (
  <>
    <NextSeo title='Admin' noindex nofollow />
    <MyyeePwa />
    <Container className='mt-0'>
      <LoginForm />
    </Container>
  </>
);

/** Already signed in? Skip the form. */
export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const token = readAdminToken(req);

  if (token) {
    try {
      await getAdminProfile(token);
      return { redirect: { destination: '/admin', permanent: false } };
    } catch {
      // Expired or rejected — fall through and show the form.
    }
  }

  return { props: {} };
};

export default AdminLoginPage;
