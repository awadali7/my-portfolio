import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  FiEdit2,
  FiExternalLink,
  FiEye,
  FiPlus,
  FiSearch,
  FiTrash2,
} from 'react-icons/fi';

import { formatBlogDate } from '@/common/helpers/blog';
import useAdminFetch from '@/common/hooks/useAdminFetch';
import cn from '@/common/libs/cn';
import type {
  AdminBlogPostRowProps,
  BlogPostStatus,
} from '@/common/types/blog';
import type { AdminProfileProps } from '@/common/types/emi';

import BlogShell from './components/BlogShell';
import CardPattern from './components/CardPattern';
import PostStatusBadge from './components/PostStatusBadge';

type BlogPostsTabProps = {
  admin: AdminProfileProps;
  initialPosts: AdminBlogPostRowProps[];
};

type Filter = 'all' | BlogPostStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'published', label: 'Published' },
  { key: 'draft', label: 'Drafts' },
];

const iconButton =
  'flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-200';

const BlogPostsTab = ({ admin, initialPosts }: BlogPostsTabProps) => {
  const call = useAdminFetch();
  const [posts, setPosts] = useState(initialPosts);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      all: posts.length,
      published: posts.filter((post) => post.status === 'published').length,
      draft: posts.filter((post) => post.status === 'draft').length,
    }),
    [posts],
  );

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return posts.filter(
      (post) =>
        (filter === 'all' || post.status === filter) &&
        (!term ||
          post.title.toLowerCase().includes(term) ||
          post.slug.includes(term) ||
          post.tags.some((tag) => tag.includes(term))),
    );
  }, [posts, filter, search]);

  const handleDelete = async (post: AdminBlogPostRowProps) => {
    if (!window.confirm(`Delete "${post.title}"? This can't be undone.`)) {
      return;
    }
    setDeletingId(post.id);
    setError(null);
    try {
      await call(`/api/admin/blog/posts/${post.id}`, { method: 'DELETE' });
      setPosts((current) => current.filter((item) => item.id !== post.id));
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : 'Could not delete',
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <BlogShell
      admin={admin}
      title='Posts'
      actions={
        <Link
          href='/admin/blog/new'
          className='flex items-center gap-1.5 rounded-lg bg-neutral-800 px-3 py-1.5 text-sm font-medium text-neutral-50 hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900'
        >
          <FiPlus size={14} /> New post
        </Link>
      }
    >
      <div className='space-y-4'>
        {error && (
          <p
            role='alert'
            className='rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500'
          >
            {error}
          </p>
        )}

        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div className='flex gap-1' role='group' aria-label='Filter posts'>
            {FILTERS.map((item) => (
              <button
                key={item.key}
                type='button'
                onClick={() => setFilter(item.key)}
                aria-pressed={filter === item.key}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm transition-colors',
                  filter === item.key
                    ? 'bg-neutral-200 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
                    : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800/60',
                )}
              >
                {item.label}{' '}
                <span className='tabular-nums text-neutral-400'>
                  {counts[item.key]}
                </span>
              </button>
            ))}
          </div>
          <div className='relative w-full sm:w-64'>
            <FiSearch
              size={14}
              aria-hidden='true'
              className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400'
            />
            <input
              type='search'
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder='Search title, address or tag'
              aria-label='Search posts'
              className='w-full rounded-lg border border-neutral-300 bg-transparent py-1.5 pl-9 pr-3 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700'
            />
          </div>
        </div>

        {posts.length === 0 ? (
          <div className='relative overflow-hidden rounded-xl border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700'>
            <CardPattern />
            <p className='font-medium'>No posts yet</p>
            <p className='mt-1 text-sm text-neutral-500'>
              Write the first one. It stays a draft until you publish it.
            </p>
            <Link
              href='/admin/blog/new'
              className='mt-4 inline-flex items-center gap-1.5 rounded-lg bg-neutral-800 px-3 py-1.5 text-sm font-medium text-neutral-50 dark:bg-neutral-100 dark:text-neutral-900'
            >
              <FiPlus size={14} /> New post
            </Link>
          </div>
        ) : visible.length === 0 ? (
          <p className='py-8 text-center text-sm text-neutral-500'>
            No posts match.
          </p>
        ) : (
          <ul className='space-y-2'>
            {visible.map((post) => (
              <li
                key={post.id}
                className='flex flex-col gap-3 rounded-xl border border-neutral-300 p-4 dark:border-neutral-800 dark:bg-neutral-900/40 sm:flex-row sm:items-center sm:justify-between'
              >
                <div className='min-w-0'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <PostStatusBadge status={post.status} />
                    {post.category && (
                      <span className='text-xs text-neutral-500'>
                        {post.category.name}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/admin/blog/${post.id}`}
                    className='mt-1.5 block truncate font-medium hover:underline'
                  >
                    {post.title}
                  </Link>
                  <p className='mt-0.5 text-xs text-neutral-500'>
                    {post.publishedAt
                      ? `Published ${formatBlogDate(post.publishedAt)}`
                      : 'Never published'}
                    {` · Edited ${formatBlogDate(post.updatedAt)} · ${post.readingMinutes} min read`}
                    {post.author &&
                      ` · ${post.author.name ?? post.author.username}`}
                  </p>
                </div>

                <div className='flex shrink-0 items-center gap-1'>
                  <Link
                    href={`/admin/blog/${post.id}`}
                    aria-label={`Edit ${post.title}`}
                    className={iconButton}
                  >
                    <FiEdit2 size={14} />
                  </Link>
                  <a
                    href={`/admin/blog/${post.id}/preview`}
                    target='_blank'
                    rel='noreferrer'
                    aria-label={`Preview ${post.title}`}
                    className={iconButton}
                  >
                    <FiEye size={14} />
                  </a>
                  {post.status === 'published' && (
                    <a
                      href={`/blog/${post.slug}`}
                      target='_blank'
                      rel='noreferrer'
                      aria-label={`View ${post.title} on the blog`}
                      className={iconButton}
                    >
                      <FiExternalLink size={14} />
                    </a>
                  )}
                  <button
                    type='button'
                    onClick={() => handleDelete(post)}
                    disabled={deletingId === post.id}
                    aria-label={`Delete ${post.title}`}
                    className={cn(
                      iconButton,
                      'hover:text-red-500 disabled:opacity-50',
                    )}
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </BlogShell>
  );
};

export default BlogPostsTab;
