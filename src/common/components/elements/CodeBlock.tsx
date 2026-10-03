import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import {
  HiCheckCircle as CheckIcon,
  HiOutlineClipboardCopy as CopyIcon,
} from 'react-icons/hi';
import { CodeProps } from 'react-markdown/lib/ast-to-react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import bash from 'react-syntax-highlighter/dist/cjs/languages/prism/bash';
import css from 'react-syntax-highlighter/dist/cjs/languages/prism/css';
import diff from 'react-syntax-highlighter/dist/cjs/languages/prism/diff';
import javascript from 'react-syntax-highlighter/dist/cjs/languages/prism/javascript';
import json from 'react-syntax-highlighter/dist/cjs/languages/prism/json';
import jsx from 'react-syntax-highlighter/dist/cjs/languages/prism/jsx';
import markdown from 'react-syntax-highlighter/dist/cjs/languages/prism/markdown';
import python from 'react-syntax-highlighter/dist/cjs/languages/prism/python';
import sql from 'react-syntax-highlighter/dist/cjs/languages/prism/sql';
import tsx from 'react-syntax-highlighter/dist/cjs/languages/prism/tsx';
import typescript from 'react-syntax-highlighter/dist/cjs/languages/prism/typescript';
import yaml from 'react-syntax-highlighter/dist/cjs/languages/prism/yaml';
import { a11yDark as themeColor } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { useCopyToClipboard } from 'usehooks-ts';

// Aliases map the names people write after ``` onto a registered grammar.
const LANGUAGES = {
  javascript,
  js: javascript,
  typescript,
  ts: typescript,
  tsx,
  jsx,
  css,
  diff,
  bash,
  sh: bash,
  shell: bash,
  json,
  python,
  py: python,
  sql,
  yaml,
  yml: yaml,
  markdown,
  md: markdown,
};

Object.entries(LANGUAGES).forEach(([name, grammar]) =>
  SyntaxHighlighter.registerLanguage(name, grammar),
);

type CodeBlockProps = CodeProps & {
  /** Used when the fence names no language. */
  defaultLanguage?: string;
  /** Show the fence's language above the code. */
  showLanguage?: boolean;
};

/**
 * Renders on the server as well as the client. The blog uses this directly so
 * code is in the page's HTML; the default export below stays client-only for
 * the existing Learn pages.
 */
export const CodeBlockBase = ({
  className = '',
  children,
  inline,
  defaultLanguage = 'javascript',
  showLanguage = false,
  node: _node,
  ...props
}: CodeBlockProps) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);
  // eslint-disable-next-line unused-imports/no-unused-vars
  const [value, copy] = useCopyToClipboard();
  const match = /language-(\w+)/.exec(className || '');

  const handleCopy = (code: string) => {
    copy(code);
    setIsCopied(true);
  };

  useEffect(() => {
    if (isCopied) {
      const timeout = setTimeout(() => {
        setIsCopied(false);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [isCopied]);

  return (
    <>
      {!inline ? (
        <div className='relative'>
          {showLanguage && match && (
            <span className='absolute left-4 top-2 select-none font-mono text-xs uppercase tracking-wide text-neutral-400'>
              {match[1]}
            </span>
          )}
          <button
            className='absolute right-3 top-3 rounded-lg border border-neutral-700 p-2 hover:bg-neutral-800'
            type='button'
            aria-label='Copy to Clipboard'
            onClick={() => handleCopy(children.toString())}
            data-umami-event='Click Copy Code'
          >
            {!isCopied ? (
              <CopyIcon size={18} className='text-neutral-400' />
            ) : (
              <CheckIcon size={18} className='text-green-600' />
            )}
          </button>

          <SyntaxHighlighter
            {...props}
            style={themeColor}
            customStyle={{
              padding: '20px',
              paddingTop: showLanguage && match ? '36px' : '20px',
              fontSize: '14px',
              borderRadius: '8px',
              paddingRight: '50px',
            }}
            PreTag='div'
            language={match ? match[1] : defaultLanguage}
            wrapLongLines={true}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className='rounded-md bg-neutral-200 px-2 py-1 text-[14px] font-light text-sky-600 dark:bg-neutral-700 dark:text-sky-300'>
          {children}
        </code>
      )}
    </>
  );
};

const LoadingPlaceholder = () => <div className='mb-12 mt-12 h-36 w-full' />;

export default dynamic(() => Promise.resolve(CodeBlockBase), {
  ssr: false,
  loading: LoadingPlaceholder,
});
