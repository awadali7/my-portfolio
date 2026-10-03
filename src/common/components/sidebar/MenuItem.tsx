import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useState } from 'react';
import { BsArrowRightShort as ExternalLinkIcon } from 'react-icons/bs';

import { MenuContext } from '@/common/context/MenuContext';
import { MenuItemProps } from '@/common/types/menu';

const MenuItem = ({
  title,
  href,
  icon,
  onClick,
  className = '',
  children,
  hideIcon = false,
  isActive,
}: MenuItemProps) => {
  const { hideNavbar } = useContext(MenuContext);
  const [isHovered, setIsHovered] = useState(false);
  const isExternalUrl = href?.includes('http');
  const isHashLink = href === '#';
  const router = useRouter();

  // A section stays lit on its sub-pages (/blog/[slug] lights Blog). Home is
  // excluded, or "/" would match every page.
  const isActiveRoute =
    isActive ??
    (router.pathname === href ||
      (href !== '/' && router.pathname.startsWith(`${href}/`)));

  const activeClasses = `flex items-center gap-2 py-2 pl-4 pr-2.5 text-neutral-700 dark:text-neutral-400 hover:text-neutral-900 hover:dark:text-neutral-300 rounded-lg group ${
    isActiveRoute
      ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:!text-neutral-200'
      : 'hover:dark:lg:bg-neutral-800 hover:dark:!text-neutral-300 hover:lg:bg-neutral-200 hover:lg:rounded-lg lg:transition-all lg:duration-300'
  }`;

  const handleClick = () => {
    hideNavbar();
    if (onClick) onClick();
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const elementProps = {
    className: `${activeClasses} ${className}`,
    onClick: handleClick,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  };

  const itemComponent = () => {
    return (
      <div {...elementProps}>
        {!hideIcon && (
          <div
            className={clsx(
              'transition-all duration-300 group-hover:-rotate-12',
              isActiveRoute && 'animate-pulse',
            )}
          >
            {icon}
          </div>
        )}
        <div className='ml-0.5 flex-grow'>{title}</div>
        {children && <>{children}</>}
        {isActiveRoute && (
          <ExternalLinkIcon size={22} className='animate-pulse text-gray-500' />
        )}
        {isExternalUrl && isHovered && (
          <ExternalLinkIcon
            size={22}
            className='-rotate-45 text-gray-500 lg:transition-all lg:duration-300'
          />
        )}
      </div>
    );
  };

  return isHashLink ? (
    <div className='cursor-pointer'>{itemComponent()}</div>
  ) : (
    <Link
      href={href}
      target={isExternalUrl ? '_blank' : ''}
      onClick={handleClick}
    >
      {itemComponent()}
    </Link>
  );
};

export default MenuItem;
