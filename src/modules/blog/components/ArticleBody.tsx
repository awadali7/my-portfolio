import {
  Children,
  createContext,
  isValidElement,
  ReactNode,
  useContext,
  useMemo,
} from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import type {
  CodeProps,
  HeadingProps,
  TableDataCellProps,
  TableHeaderCellProps,
} from 'react-markdown/lib/ast-to-react';
import remarkGfm from 'remark-gfm';

import { CodeBlockBase } from '@/common/components/elements/CodeBlock';
import { SITE_URL } from '@/common/constant/site';
import { extractHeadings, slugify } from '@/common/helpers/blog';
import type { BlogHeadingProps } from '@/common/types/blog';

/** Heading ids keyed by source line, from the same pass as the table of contents. */
const HeadingIdsContext = createContext<Record<number, string>>({});

const textOf = (children: ReactNode): string =>
  Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        return String(child);
      }
      if (isValidElement<{ children?: ReactNode }>(child)) {
        return textOf(child.props.children);
      }
      return '';
    })
    .join('');

const useHeadingId = ({ node, children }: HeadingProps) => {
  const ids = useContext(HeadingIdsContext);
  const line = node.position?.start.line;
  // Setext headings and headings inside lists aren't in the table of
  // contents, but still get an anchor from their text.
  return (line && ids[line]) || slugify(textOf(children)) || undefined;
};

const headingClass =
  'scroll-mt-24 font-semibold leading-snug text-neutral-900 dark:text-neutral-100';

/* The page title is the only H1, so a `#` heading in the body becomes an H2. */
const H2 = (props: HeadingProps) => (
  <h2 id={useHeadingId(props)} className={`mt-12 text-2xl ${headingClass}`}>
    {props.children}
  </h2>
);

const H3 = (props: HeadingProps) => (
  <h3 id={useHeadingId(props)} className={`mt-10 text-xl ${headingClass}`}>
    {props.children}
  </h3>
);

const H4 = (props: HeadingProps) => (
  <h4 id={useHeadingId(props)} className={`mt-8 text-lg ${headingClass}`}>
    {props.children}
  </h4>
);

const isExternal = (href?: string) =>
  !!href &&
  /^https?:\/\//.test(href) &&
  !href.startsWith(SITE_URL) &&
  !href.startsWith('https://awadali.com');

const COMPONENTS: Components = {
  h1: H2,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H4,
  h6: H4,
  // A paragraph holding an image becomes a div, because the image renders as
  // a <figure>, which is not allowed inside <p>.
  p: ({ node, children }) =>
    node.children.some(
      (child) => child.type === 'element' && child.tagName === 'img',
    ) ? (
      <div className='my-6'>{children}</div>
    ) : (
      <p className='my-5'>{children}</p>
    ),
  a: ({ href, children }) =>
    isExternal(href) ? (
      <a
        href={href}
        target='_blank'
        rel='noopener noreferrer'
        className='text-teal-600 underline underline-offset-2 hover:text-teal-500 dark:text-teal-400'
      >
        {children}
      </a>
    ) : (
      <a
        href={href}
        className='text-teal-600 underline underline-offset-2 hover:text-teal-500 dark:text-teal-400'
      >
        {children}
      </a>
    ),
  img: ({ src, alt, title }) => (
    <figure className='my-8'>
      {/* eslint-disable-next-line @next/next/no-img-element -- markdown images have no known size, so next/image can't lay them out */}
      <img
        src={src}
        alt={alt ?? ''}
        loading='lazy'
        decoding='async'
        className='mx-auto h-auto max-w-full rounded-lg border border-neutral-200 dark:border-neutral-800'
      />
      {title && (
        <figcaption className='mt-3 text-center text-sm text-neutral-500'>
          {title}
        </figcaption>
      )}
    </figure>
  ),
  // The code component draws its own frame, so <pre> only gets in the way.
  pre: ({ children }) => <>{children}</>,
  code: ({ node, inline, className, children, ...props }: CodeProps) =>
    inline ? (
      <code className='rounded-md bg-neutral-200 px-1.5 py-0.5 font-mono text-sm text-sky-700 dark:bg-neutral-800 dark:text-sky-300'>
        {children}
      </code>
    ) : (
      <div className='my-6 text-sm leading-6'>
        <CodeBlockBase
          node={node}
          inline={false}
          className={className}
          defaultLanguage='text'
          showLanguage
          {...props}
        >
          {children}
        </CodeBlockBase>
      </div>
    ),
  blockquote: ({ children }) => (
    <blockquote className='my-6 rounded-r-lg border-l-4 border-teal-500 bg-neutral-100 px-5 py-1 text-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300'>
      {children}
    </blockquote>
  ),
  ul: ({ children, className }) => (
    <ul className={`my-5 list-disc space-y-2 pl-6 ${className ?? ''}`}>
      {children}
    </ul>
  ),
  ol: ({ children, className }) => (
    <ol className={`my-5 list-decimal space-y-2 pl-6 ${className ?? ''}`}>
      {children}
    </ol>
  ),
  hr: () => <hr className='my-10 border-neutral-200 dark:border-neutral-800' />,
  table: ({ children }) => (
    <div className='my-6 overflow-x-auto'>
      <table className='w-full border-collapse text-left text-sm'>
        {children}
      </table>
    </div>
  ),
  th: ({ style, children }: TableHeaderCellProps) => (
    <th
      style={style}
      className='border-b border-neutral-300 px-3 py-2 font-medium dark:border-neutral-700'
    >
      {children}
    </th>
  ),
  td: ({ style, children }: TableDataCellProps) => (
    <td
      style={style}
      className='border-b border-neutral-200 px-3 py-2 align-top dark:border-neutral-800'
    >
      {children}
    </td>
  ),
};

type ArticleBodyProps = {
  content: string;
  /** Pass the headings already extracted for the table of contents. */
  headings?: BlogHeadingProps[];
};

/** A post body: the same renderer for the public page and the editor preview. */
const ArticleBody = ({ content, headings }: ArticleBodyProps) => {
  const ids = useMemo(
    () =>
      Object.fromEntries(
        (headings ?? extractHeadings(content)).map((heading) => [
          heading.line,
          heading.id,
        ]),
      ),
    [content, headings],
  );

  return (
    <HeadingIdsContext.Provider value={ids}>
      <div className='text-base leading-8 text-neutral-700 dark:text-neutral-300 sm:text-lg'>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
          {content}
        </ReactMarkdown>
      </div>
    </HeadingIdsContext.Provider>
  );
};

export default ArticleBody;
