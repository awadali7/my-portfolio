import { ReactNode } from 'react';

import type { AdminProfileProps } from '@/common/types/emi';

import AdminShell from './AdminShell';

type BlogShellProps = {
  admin: AdminProfileProps;
  title: string;
  actions?: ReactNode;
  children: ReactNode;
};

/** A Blog page: the console frame. The money assistant stays in Money. */
const BlogShell = ({ admin, title, actions, children }: BlogShellProps) => (
  <AdminShell admin={admin} title={title} actions={actions}>
    {children}
  </AdminShell>
);

export default BlogShell;
