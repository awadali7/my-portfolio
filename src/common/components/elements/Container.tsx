import { ReactNode } from 'react';

import cn from '@/common/libs/cn';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  [propName: string]: ReactNode | string | undefined;
}

/**
 * `mt-20` clears the fixed site header on mobile; pages without that header
 * (the admin console) pass `mt-0`.
 *
 * Classes go through cn() so a passed class actually wins — plain string
 * concatenation left both `mt-20` and `mt-0` on the element and let stylesheet
 * order decide, which is why playground needed `!mt-0` to force it.
 */
const Container = ({ children, className = '', ...others }: ContainerProps) => {
  return (
    <div className={cn('mb-10 mt-20 p-8 lg:mt-0', className)} {...others}>
      {children}
    </div>
  );
};

export default Container;
