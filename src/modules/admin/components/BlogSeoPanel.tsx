import { BLOG_LIMITS, BLOG_TITLE_SUFFIX } from '@/common/helpers/blog';
import cn from '@/common/libs/cn';

type SeoFields = {
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
};

type BlogSeoPanelProps = {
  form: SeoFields;
  onChange: (
    key: 'seoTitle' | 'seoDescription' | 'canonicalUrl',
    value: string,
  ) => void;
  warnings: string[];
  inputClass: string;
};

const Counter = ({ count, ok }: { count: number; ok: boolean }) => (
  <span
    className={cn(
      'text-xs tabular-nums',
      ok ? 'text-neutral-500' : 'text-amber-600 dark:text-amber-400',
    )}
  >
    {count}
  </span>
);

/**
 * How the post will look in Google and when shared, with the optional
 * overrides and the pre-publish checklist. Nothing here blocks publishing.
 */
const BlogSeoPanel = ({
  form,
  onChange,
  warnings,
  inputClass,
}: BlogSeoPanelProps) => {
  const titleTag = `${form.seoTitle.trim() || form.title.trim() || 'Untitled post'}${BLOG_TITLE_SUFFIX}`;
  const description = form.seoDescription.trim() || form.excerpt.trim();
  const descriptionOk =
    description.length >= BLOG_LIMITS.descriptionMin &&
    description.length <= BLOG_LIMITS.descriptionMax;

  return (
    <section className='space-y-4 rounded-xl border border-neutral-300 p-4 dark:border-neutral-800 dark:bg-neutral-900/40'>
      <h2 className='text-sm font-medium'>Search and sharing</h2>

      <div>
        <div className='flex items-center justify-between'>
          <label
            htmlFor='seo-title'
            className='text-xs text-neutral-600 dark:text-neutral-400'
          >
            SEO title
          </label>
          <Counter
            count={titleTag.length}
            ok={titleTag.length <= BLOG_LIMITS.titleTag}
          />
        </div>
        <input
          id='seo-title'
          value={form.seoTitle}
          onChange={(event) => onChange('seoTitle', event.target.value)}
          maxLength={70}
          placeholder='Leave empty to use the post title'
          className={cn('mt-1 w-full', inputClass)}
        />
      </div>

      <div>
        <div className='flex items-center justify-between'>
          <label
            htmlFor='seo-description'
            className='text-xs text-neutral-600 dark:text-neutral-400'
          >
            Meta description
          </label>
          <Counter count={description.length} ok={descriptionOk} />
        </div>
        <textarea
          id='seo-description'
          value={form.seoDescription}
          onChange={(event) => onChange('seoDescription', event.target.value)}
          maxLength={200}
          rows={3}
          placeholder='Leave empty to use the excerpt'
          className={cn('mt-1 w-full resize-y', inputClass)}
        />
      </div>

      <div>
        <label
          htmlFor='canonical-url'
          className='text-xs text-neutral-600 dark:text-neutral-400'
        >
          Canonical address
        </label>
        <input
          id='canonical-url'
          type='url'
          value={form.canonicalUrl}
          onChange={(event) => onChange('canonicalUrl', event.target.value)}
          placeholder='Only if this post first appeared on another site'
          className={cn('mt-1 w-full', inputClass)}
        />
      </div>

      <div className='rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950'>
        <p className='text-xs text-neutral-500'>Google result</p>
        <p className='mt-1 truncate text-xs text-emerald-700 dark:text-emerald-400'>
          www.awadali.com › blog › {form.slug || 'your-slug'}
        </p>
        <p className='truncate text-base text-blue-700 dark:text-blue-400'>
          {titleTag}
        </p>
        <p className='line-clamp-2 text-xs text-neutral-600 dark:text-neutral-400'>
          {description || 'Add an excerpt to give this post a description.'}
        </p>
      </div>

      <div className='overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800'>
        <p className='px-3 pt-2 text-xs text-neutral-500'>Social card</p>
        <div className='mt-2 aspect-video bg-neutral-900'>
          {form.coverImageUrl.trim() ? (
            // eslint-disable-next-line @next/next/no-img-element -- a preview of any pasted link, not a page image
            <img
              src={form.coverImageUrl.trim()}
              alt=''
              className='h-full w-full object-cover'
            />
          ) : (
            <div className='flex h-full flex-col justify-between p-4 text-neutral-50'>
              <span className='text-xs text-neutral-400'>awadali.com/blog</span>
              <span className='line-clamp-3 text-lg leading-snug'>
                {form.title.trim() || 'Untitled post'}
              </span>
              <span className='text-xs text-neutral-300'>
                Generated card, used when there is no cover
              </span>
            </div>
          )}
        </div>
      </div>

      {warnings.length > 0 ? (
        <div className='rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200'>
          <p className='font-medium'>Worth fixing before you publish</p>
          <ul className='mt-1 list-disc space-y-1 pl-4'>
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className='rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300'>
          Title, description and images look good for search.
        </p>
      )}
    </section>
  );
};

export default BlogSeoPanel;
