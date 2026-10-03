import { ReactNode } from 'react';

export type MenuItemProps = {
  title: string;
  href: string;
  icon: JSX.Element;
  isShow?: boolean;
  isExternal: boolean;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
  eventName?: string;
  hideIcon?: boolean;
  type?: string;
  /** Overrides the address match, e.g. for the admin console's own rules. */
  isActive?: boolean;
};
