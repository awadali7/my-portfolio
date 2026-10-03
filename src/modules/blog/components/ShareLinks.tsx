import { useEffect, useState } from 'react';
import { BsLinkedin, BsTwitter } from 'react-icons/bs';
import { FiCheck, FiLink } from 'react-icons/fi';

type ShareLinksProps = {
  url: string;
  title: string;
};

const buttonClass =
  'flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-300 text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800';

const ShareLinks = ({ url, title }: ShareLinksProps) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return;
    const timeout = setTimeout(() => setIsCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [isCopied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
    } catch {
      // Clipboard access can be blocked; the address bar still has the link.
    }
  };

  const encodedUrl = encodeURIComponent(url);

  return (
    <div className='flex items-center gap-2'>
      <span className='mr-1 text-sm text-neutral-500'>Share</span>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(title)}`}
        target='_blank'
        rel='noopener noreferrer'
        aria-label='Share on X'
        className={buttonClass}
      >
        <BsTwitter size={15} aria-hidden='true' />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target='_blank'
        rel='noopener noreferrer'
        aria-label='Share on LinkedIn'
        className={buttonClass}
      >
        <BsLinkedin size={15} aria-hidden='true' />
      </a>
      <button
        type='button'
        onClick={handleCopy}
        aria-label='Copy link'
        className={buttonClass}
      >
        {isCopied ? (
          <FiCheck size={15} aria-hidden='true' className='text-emerald-600' />
        ) : (
          <FiLink size={15} aria-hidden='true' />
        )}
      </button>
      <span aria-live='polite' className='sr-only'>
        {isCopied ? 'Link copied' : ''}
      </span>
    </div>
  );
};

export default ShareLinks;
