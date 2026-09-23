import { GetServerSideProps, NextPage } from 'next';
import { NextSeo } from 'next-seo';

import Container from '@/common/components/elements/Container';
import { readAdminToken } from '@/common/libs/admin-session';
import type {
  AdminProfileProps,
  EmiProps,
  IncomeProps,
} from '@/common/types/emi';
import EmiTracker from '@/modules/admin';
import { getAdminProfile, getEmis, getIncome } from '@/services/emi';

type AdminPageProps = {
  admin: AdminProfileProps;
  emis: EmiProps[];
  income: IncomeProps | null;
};

const AdminPage: NextPage<AdminPageProps> = ({ admin, emis, income }) => (
  <>
    <NextSeo title='EMI Tracker' noindex nofollow />
    <Container>
      <EmiTracker admin={admin} initialEmis={emis} income={income} />
    </Container>
  </>
);

const TO_LOGIN = {
  redirect: { destination: '/admin/login', permanent: false },
} as const;

/**
 * Server-rendered behind the session cookie: the console never flashes before
 * the auth check, and the backend token never reaches the browser.
 */
export const getServerSideProps: GetServerSideProps<AdminPageProps> = async ({
  req,
}) => {
  const token = readAdminToken(req);
  if (!token) return TO_LOGIN;

  try {
    const [admin, emis] = await Promise.all([
      getAdminProfile(token),
      getEmis(token),
    ]);

    // Income is a nice-to-have on this page — a failure here shouldn't cost
    // the operator the whole tracker.
    const income = await getIncome(token).catch(() => null);

    return {
      props: {
        admin: JSON.parse(JSON.stringify(admin)) as AdminProfileProps,
        emis,
        income: income
          ? { userSalary: income.userSalary, spouseSalary: income.spouseSalary }
          : null,
      },
    };
  } catch {
    return TO_LOGIN;
  }
};

export default AdminPage;
