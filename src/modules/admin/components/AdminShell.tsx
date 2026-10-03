import { ReactNode } from 'react';

import Container from '@/common/components/elements/Container';
import type { AdminProfileProps } from '@/common/types/emi';

import AdminSidebar from './AdminSidebar';
import MyyeePwa from './MyyeePwa';

export type { AdminNavTab } from './adminNav';
export { findActiveTab } from './adminNav';

type AdminShellProps = {
  admin: AdminProfileProps;
  title: string;
  /** Optional controls (month switcher, Add button) shown beside the heading. */
  actions?: ReactNode;
  /** Section-only extras rendered after the page, e.g. the money assistant. */
  extras?: ReactNode;
  children: ReactNode;
};

/**
 * The console frame shared by the Money and Blog sections. It mirrors the
 * site's own layout (a fifth-width sidebar beside the content column) so the
 * console and the portfolio look like one product, while keeping the
 * console's own navigation instead of the public site's menu.
 */
const AdminShell = ({
  admin,
  title,
  actions,
  extras,
  children,
}: AdminShellProps) => (
  <div className='flex flex-col lg:flex-row lg:gap-2 lg:py-4 xl:pb-8'>
    <MyyeePwa />
    <header className='lg:w-1/5'>
      <AdminSidebar admin={admin} />
    </header>

    {/* Same width rule as the site's content column. */}
    <div className='max-w-[915px] transition-all duration-300 lg:w-4/5'>
      <Container>
        <div className='mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-dashed border-neutral-600 pb-6'>
          <h1 className='text-2xl font-medium'>{title}</h1>
          {actions}
        </div>
        {children}
      </Container>
    </div>

    {extras}
  </div>
);

export default AdminShell;
