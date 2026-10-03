import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  FiExternalLink,
  FiEye,
  FiLock,
  FiTrash2,
  FiUpload,
  FiX,
} from 'react-icons/fi';

import {
  BLOG_LIMITS,
  formatBlogDate,
  getPublishWarnings,
  parseTags,
  readingMinutes,
  slugify,
} from '@/common/helpers/blog';
import useAdminFetch from '@/common/hooks/useAdminFetch';
import {
  ACCEPTED_IMAGE_TYPES,
  uploadImageFile,
} from '@/common/libs/blog-image-upload';
import cn from '@/common/libs/cn';
import type {
  AdminBlogCategoryProps,
  AdminBlogPostProps,
} from '@/common/types/blog';
import type { AdminProfileProps } from '@/common/types/emi';

import BlogSeoPanel from './components/BlogSeoPanel';
import BlogShell from './components/BlogShell';
import MarkdownEditor from './components/MarkdownEditor';
import PostStatusBadge from './components/PostStatusBadge';

type BlogEditorTabProps = {
  admin: AdminProfileProps;
  /** Null when writing a new post. */
  post: AdminBlogPostProps | null;
  categories: AdminBlogCategoryProps[];
  /** Titles of every other post, for the duplicate-title warning. */
  otherTitles: string[];
};

type FormState = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  coverImageAlt: string;
  categoryId: string;
  tags: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
};

type Busy = 'save' | 'publish' | 'unpublish' | 'delete' | null;

const toForm = (post: AdminBlogPostProps | null): FormState => ({
  title: post?.title ?? '',
  slug: post?.slug ?? '',
  excerpt: post?.excerpt ?? '',
  content: post?.content ?? '',
  coverImageUrl: post?.coverImageUrl ?? '',
  coverImageAlt: post?.coverImageAlt ?? '',
  categoryId: post?.categoryId ?? '',
  tags: post?.tags.join(', ') ?? '',
  seoTitle: post?.seoTitle ?? '',
  seoDescription: post?.seoDescription ?? '',
  canonicalUrl: post?.canonicalUrl ?? '',
});

/** The API route trims and turns empty strings into nulls. */
const toPayload = (form: FormState) => ({
  ...form,
  tags: parseTags(form.tags),
});

const inputClass =
  'rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700';
const labelClass = 'text-xs text-neutral-600 dark:text-neutral-400';

const BlogEditorTab = ({
  admin,
  post,
  categories,
  otherTitles,
}: BlogEditorTabProps) => {
  const router = useRouter();
  const call = useAdminFetch();
  const [saved, setSaved] = useState<AdminBlogPostProps | null>(post);
  const [form, setForm] = useState<FormState>(() => toForm(post));
  const [baseline, setBaseline] = useState(() => JSON.stringify(toForm(post)));
  // An existing post keeps its slug; a new one follows its title until edited.
  const [isSlugEdited, setIsSlugEdited] = useState(Boolean(post));
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const coverAltRef = useRef<HTMLInputElement>(null);

  const isDirty = JSON.stringify(form) !== baseline;
  const isPublished = saved?.status === 'published';
  // Once readers could have linked to it, the address never changes.
  const isSlugLocked = Boolean(saved?.publishedAt);

  const warnings = useMemo(
    () =>
      getPublishWarnings(
        {
          title: form.title,
          excerpt: form.excerpt,
          content: form.content,
          coverImageUrl: form.coverImageUrl,
          coverImageAlt: form.coverImageAlt,
          seoTitle: form.seoTitle,
          seoDescription: form.seoDescription,
        },
        otherTitles,
      ),
    [form, otherTitles],
  );

  // Ask before leaving with unsaved edits, whether by link, back or reload.
  const isDirtyRef = useRef(isDirty);
  const allowLeaveRef = useRef(false);
  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirtyRef.current || allowLeaveRef.current) return;
      event.preventDefault();
      event.returnValue = '';
    };
    const onRouteChangeStart = () => {
      if (!isDirtyRef.current || allowLeaveRef.current) return;
      if (window.confirm('You have unsaved changes. Leave without saving?')) {
        return;
      }
      router.events.emit('routeChangeError');
      // Throwing is how the pages router lets a page cancel a navigation.
      throw new Error('Navigation cancelled to keep unsaved changes');
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    router.events.on('routeChangeStart', onRouteChangeStart);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      router.events.off('routeChangeStart', onRouteChangeStart);
    };
  }, [router.events]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === 'title' && !isSlugEdited && !isSlugLocked) {
        next.slug = slugify(String(value), BLOG_LIMITS.slug);
      }
      return next;
    });

  const accept = (result: AdminBlogPostProps) => {
    const nextForm = toForm(result);
    setSaved(result);
    setForm(nextForm);
    setBaseline(JSON.stringify(nextForm));
    setIsSlugEdited(true);
  };

  /** Creates the post on its first save, updates it afterwards. */
  const persist = async () => {
    const body = JSON.stringify(toPayload(form));
    const result = saved
      ? await call<AdminBlogPostProps>(`/api/admin/blog/posts/${saved.id}`, {
          method: 'PUT',
          body,
        })
      : await call<AdminBlogPostProps>('/api/admin/blog/posts', {
          method: 'POST',
          body,
        });
    accept(result);
    return result;
  };

  /** A brand-new post moves to its own address once it exists. */
  const openSaved = async (id: string) => {
    if (post) return;
    allowLeaveRef.current = true;
    await router.replace(`/admin/blog/${id}`);
  };

  const run = async (
    kind: Exclude<Busy, null>,
    action: () => Promise<void>,
  ) => {
    setBusy(kind);
    setError(null);
    setNotice(null);
    try {
      await action();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : 'Something went wrong',
      );
    } finally {
      setBusy(null);
    }
  };

  const handleSave = (event?: FormEvent) => {
    event?.preventDefault();
    return run('save', async () => {
      const result = await persist();
      setNotice(
        result.status === 'published'
          ? 'Saved. The live page is updated.'
          : 'Draft saved.',
      );
      await openSaved(result.id);
    });
  };

  const handlePublish = () =>
    run('publish', async () => {
      const current = isDirty || !saved ? await persist() : saved;
      const result = await call<AdminBlogPostProps>(
        `/api/admin/blog/posts/${current.id}/publish`,
        { method: 'POST' },
      );
      accept(result);
      setNotice('Published. The post is live.');
      await openSaved(result.id);
    });

  const handleUnpublish = () =>
    run('unpublish', async () => {
      if (!saved) return;
      if (
        !window.confirm(
          'Unpublish this post? Its page will return 404 until you publish it again.',
        )
      ) {
        return;
      }
      const result = await call<AdminBlogPostProps>(
        `/api/admin/blog/posts/${saved.id}/unpublish`,
        { method: 'POST' },
      );
      // Keep any unsaved edits in the form; only the status changed.
      setSaved(result);
      setNotice('Unpublished. The post is a draft again.');
    });

  const handleDelete = () =>
    run('delete', async () => {
      if (!saved) return;
      if (!window.confirm(`Delete "${saved.title}"? This can't be undone.`)) {
        return;
      }
      await call(`/api/admin/blog/posts/${saved.id}`, { method: 'DELETE' });
      allowLeaveRef.current = true;
      await router.push('/admin/blog');
    });

  /** Uploads to the server and fills in the cover link; asks for alt text next. */
  const handleCoverFile = async (file: File | undefined) => {
    if (!file) return;
    setIsCoverUploading(true);
    setCoverError(null);
    try {
      const { url } = await uploadImageFile(file);
      update('coverImageUrl', url);
      if (!form.coverImageAlt.trim()) coverAltRef.current?.focus();
    } catch (uploadError) {
      setCoverError(
        uploadError instanceof Error
          ? uploadError.message
          : 'The upload failed',
      );
    } finally {
      setIsCoverUploading(false);
    }
  };

  const isBusy = busy !== null;
  const minutes = readingMinutes(form.content);

  return (
    <BlogShell
      admin={admin}
      title={post ? 'Edit post' : 'New post'}
      actions={
        <div className='flex flex-wrap items-center gap-2'>
          {saved && <PostStatusBadge status={saved.status} />}
          {saved && (
            <a
              href={`/admin/blog/${saved.id}/preview`}
              target='_blank'
              rel='noreferrer'
              aria-disabled={isDirty}
              title={
                isDirty
                  ? 'Save first to preview your latest changes'
                  : undefined
              }
              className={cn(
                'flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700',
                isDirty && 'pointer-events-none opacity-50',
              )}
            >
              <FiEye size={14} /> Preview
            </a>
          )}
          {isPublished && saved && (
            <a
              href={`/blog/${saved.slug}`}
              target='_blank'
              rel='noreferrer'
              className='flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700'
            >
              <FiExternalLink size={14} /> View live
            </a>
          )}
          {isPublished ? (
            <button
              type='button'
              onClick={handleUnpublish}
              disabled={isBusy}
              className='rounded-lg border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-neutral-700'
            >
              {busy === 'unpublish' ? 'Unpublishing…' : 'Unpublish'}
            </button>
          ) : (
            <button
              type='button'
              onClick={() => handleSave()}
              disabled={isBusy}
              className='rounded-lg border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-neutral-700'
            >
              {busy === 'save' ? 'Saving…' : 'Save draft'}
            </button>
          )}
          <button
            type='button'
            onClick={isPublished ? () => handleSave() : handlePublish}
            disabled={isBusy || (isPublished && !isDirty)}
            className='rounded-lg bg-neutral-800 px-3 py-1.5 text-sm font-medium text-neutral-50 hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900'
          >
            {isPublished
              ? busy === 'save'
                ? 'Updating…'
                : 'Update'
              : busy === 'publish'
                ? 'Publishing…'
                : 'Publish'}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSave} className='space-y-5' noValidate>
        {error && (
          <p
            role='alert'
            className='rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500'
          >
            {error}
          </p>
        )}
        {notice && (
          <p
            role='status'
            className='rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300'
          >
            {notice}
          </p>
        )}

        <div className='grid gap-5 lg:grid-cols-3'>
          <div className='min-w-0 space-y-4 lg:col-span-2'>
            <div>
              <label htmlFor='post-title' className={labelClass}>
                Title
              </label>
              <input
                id='post-title'
                value={form.title}
                onChange={(event) => update('title', event.target.value)}
                maxLength={150}
                placeholder='What is this post about?'
                className={cn('mt-1 w-full text-lg font-medium', inputClass)}
              />
            </div>

            <div>
              <label htmlFor='post-slug' className={labelClass}>
                Address
              </label>
              <div className='mt-1 flex items-center gap-2'>
                <span className='shrink-0 text-sm text-neutral-500'>
                  /blog/
                </span>
                <input
                  id='post-slug'
                  value={form.slug}
                  onChange={(event) => {
                    setIsSlugEdited(true);
                    update(
                      'slug',
                      slugify(event.target.value, BLOG_LIMITS.slug),
                    );
                  }}
                  readOnly={isSlugLocked}
                  maxLength={BLOG_LIMITS.slug}
                  className={cn(
                    'min-w-0 flex-1',
                    inputClass,
                    isSlugLocked && 'cursor-not-allowed opacity-60',
                  )}
                />
                {isSlugLocked && (
                  <FiLock
                    size={14}
                    aria-hidden='true'
                    className='text-neutral-500'
                  />
                )}
              </div>
              {isSlugLocked && (
                <p className='mt-1 text-xs text-neutral-500'>
                  Locked after publishing so links to this post never break.
                </p>
              )}
            </div>

            <div>
              <div className='flex items-center justify-between'>
                <label htmlFor='post-excerpt' className={labelClass}>
                  Excerpt
                </label>
                <span className='text-xs tabular-nums text-neutral-500'>
                  {form.excerpt.length} / {BLOG_LIMITS.excerpt}
                </span>
              </div>
              <textarea
                id='post-excerpt'
                value={form.excerpt}
                onChange={(event) => update('excerpt', event.target.value)}
                maxLength={BLOG_LIMITS.excerpt}
                rows={3}
                placeholder='One or two sentences shown on cards and in search results'
                className={cn('mt-1 w-full resize-y', inputClass)}
              />
            </div>

            <MarkdownEditor
              value={form.content}
              onChange={(value) => update('content', value)}
              maxLength={BLOG_LIMITS.content}
            />
          </div>

          <div className='min-w-0 space-y-4'>
            <section className='space-y-1 rounded-xl border border-neutral-300 p-4 text-sm dark:border-neutral-800 dark:bg-neutral-900/40'>
              <h2 className='font-medium'>Status</h2>
              <p className='text-neutral-600 dark:text-neutral-400'>
                {saved?.publishedAt
                  ? `${isPublished ? 'Published' : 'First published'} ${formatBlogDate(saved.publishedAt)}`
                  : saved
                    ? 'Draft, never published'
                    : 'Not saved yet'}
              </p>
              {saved?.contentUpdatedAt && (
                <p className='text-neutral-600 dark:text-neutral-400'>
                  Updated {formatBlogDate(saved.contentUpdatedAt)}
                </p>
              )}
              <p className='text-neutral-600 dark:text-neutral-400'>
                About {minutes} min read
              </p>
              {isDirty && (
                <p className='text-amber-600 dark:text-amber-400'>
                  Unsaved changes
                </p>
              )}
            </section>

            <section className='space-y-3 rounded-xl border border-neutral-300 p-4 dark:border-neutral-800 dark:bg-neutral-900/40'>
              <div>
                <div className='flex items-center justify-between'>
                  <label htmlFor='post-category' className={labelClass}>
                    Category
                  </label>
                  <Link
                    href='/admin/blog/categories'
                    className='text-xs text-neutral-500 underline-offset-2 hover:underline'
                  >
                    Manage
                  </Link>
                </div>
                <select
                  id='post-category'
                  value={form.categoryId}
                  onChange={(event) => update('categoryId', event.target.value)}
                  className={cn('mt-1 w-full', inputClass)}
                >
                  <option value=''>No category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor='post-tags' className={labelClass}>
                  Tags
                </label>
                <input
                  id='post-tags'
                  value={form.tags}
                  onChange={(event) => update('tags', event.target.value)}
                  placeholder='nextjs, react, performance'
                  className={cn('mt-1 w-full', inputClass)}
                />
                {parseTags(form.tags).length > 0 && (
                  <p className='mt-1 text-xs text-neutral-500'>
                    {parseTags(form.tags)
                      .map((tag) => `#${tag}`)
                      .join(' ')}
                  </p>
                )}
              </div>
            </section>

            <section className='space-y-3 rounded-xl border border-neutral-300 p-4 dark:border-neutral-800 dark:bg-neutral-900/40'>
              <h2 className='text-sm font-medium'>Cover image</h2>
              <div>
                <label htmlFor='cover-url' className={labelClass}>
                  Image link
                </label>
                <div className='mt-1 flex gap-2'>
                  <input
                    id='cover-url'
                    type='url'
                    value={form.coverImageUrl}
                    onChange={(event) =>
                      update('coverImageUrl', event.target.value)
                    }
                    placeholder='Upload, or paste a link'
                    className={cn('min-w-0 flex-1', inputClass)}
                  />
                  <button
                    type='button'
                    onClick={() => coverInputRef.current?.click()}
                    disabled={isCoverUploading}
                    className='flex shrink-0 items-center gap-1.5 rounded-lg border border-neutral-300 px-3 text-sm disabled:opacity-60 dark:border-neutral-700'
                  >
                    <FiUpload size={14} aria-hidden='true' />
                    {isCoverUploading ? 'Uploading…' : 'Upload'}
                  </button>
                  <input
                    ref={coverInputRef}
                    type='file'
                    accept={ACCEPTED_IMAGE_TYPES}
                    hidden
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = '';
                      void handleCoverFile(file);
                    }}
                  />
                </div>
                <p className='mt-1 text-xs text-neutral-500'>
                  1200 × 630 works best. Large photos are shrunk before upload.
                </p>
                {coverError && (
                  <p role='alert' className='mt-1 text-xs text-red-500'>
                    {coverError}
                  </p>
                )}
                {form.coverImageUrl.trim() && (
                  <div className='relative mt-3 overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800'>
                    {/* eslint-disable-next-line @next/next/no-img-element -- a preview of whatever link is in the field */}
                    <img
                      src={form.coverImageUrl.trim()}
                      alt=''
                      className='aspect-video w-full object-cover'
                    />
                    <button
                      type='button'
                      onClick={() => update('coverImageUrl', '')}
                      aria-label='Remove cover image'
                      className='absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80'
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label htmlFor='cover-alt' className={labelClass}>
                  Alt text
                </label>
                <input
                  id='cover-alt'
                  ref={coverAltRef}
                  value={form.coverImageAlt}
                  onChange={(event) =>
                    update('coverImageAlt', event.target.value)
                  }
                  maxLength={200}
                  placeholder='Describe the image for screen readers'
                  className={cn('mt-1 w-full', inputClass)}
                />
              </div>
            </section>

            <BlogSeoPanel
              form={form}
              onChange={(key, value) => update(key, value)}
              warnings={warnings}
              inputClass={inputClass}
            />

            {saved && (
              <button
                type='button'
                onClick={handleDelete}
                disabled={isBusy}
                className='flex items-center gap-1.5 text-sm text-red-500 underline-offset-2 hover:underline disabled:opacity-50'
              >
                <FiTrash2 size={14} />
                {busy === 'delete' ? 'Deleting…' : 'Delete this post'}
              </button>
            )}
          </div>
        </div>
      </form>
    </BlogShell>
  );
};

export default BlogEditorTab;
