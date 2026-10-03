import { ReactNode } from 'react';

import type { AdminProfileProps } from '@/common/types/emi';

import AdminShell from './AdminShell';
import MoneyChat from './MoneyChat';

type MoneyShellProps = {
  admin: AdminProfileProps;
  children: ReactNode;
  /** Optional controls (month switcher, Add button) shown beside the heading. */
  actions?: ReactNode;
  title: string;
  description?: string;
  /** Month in view, passed to the assistant so "this month" resolves right. */
  cycle?: string;
};

/** A Money page: the console frame plus the money assistant. */
const MoneyShell = ({
  admin,
  children,
  actions,
  title,
  cycle,
}: MoneyShellProps) => (
  <AdminShell
    admin={admin}
    title={title}
    actions={actions}
    extras={<MoneyChat cycle={cycle} />}
  >
    {children}
  </AdminShell>
);

export default MoneyShell;
