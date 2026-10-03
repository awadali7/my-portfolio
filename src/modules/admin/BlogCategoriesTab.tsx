import { FormEvent, useState } from 'react';
import { FiCheck, FiEdit2, FiPlus, FiTrash2, FiX } from 'react-icons/fi';

import { slugify } from '@/common/helpers/blog';
import useAdminFetch from '@/common/hooks/useAdminFetch';
import cn from '@/common/libs/cn';
import type { AdminBlogCategoryProps } from '@/common/types/blog';
import type { AdminProfileProps } from '@/common/types/emi';

import BlogShell from './components/BlogShell';
import CardPattern from './components/CardPattern';

type BlogCategoriesTabProps = {
  admin: AdminProfileProps;
  initialCategories: AdminBlogCategoryProps[];
};

type Draft = { name: string; slug: string; description: string };

const EMPTY: Draft = { name: '', slug: '', description: '' };

const inputClass =
  'rounded-lg border border-neutral-300 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700';

const byName = (a: AdminBlogCategoryProps, b: AdminBlogCategoryProps) =>
  a.name.localeCompare(b.name);

const BlogCategoriesTab = ({
  admin,
  initialCategories,
}: BlogCategoriesTabProps) => {
  const call = useAdminFetch();
  const [categories, setCategories] = useState(
    [...initialCategories].sort(byName),
  );
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Draft>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const run = async (action: () => Promise<void>) => {
    setIsBusy(true);
    setError(null);
    try {
      await action();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : 'Something went wrong',
      );
    } finally {
      setIsBusy(false);
    }
  };

  const handleAdd = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim()) return setError('Give the category a name');
    return run(async () => {
      const created = await call<AdminBlogCategoryProps>(
        '/api/admin/blog/categories',
        { method: 'POST', body: JSON.stringify(draft) },
      );
      // Create and update responses carry no count; a new one has no posts.
      setCategories((current) =>
        [...current, { ...created, postCount: 0 }].sort(byName),
      );
      setDraft(EMPTY);
      setIsAdding(false);
    });
  };

  const handleUpdate = (category: AdminBlogCategoryProps) => {
    if (!editing.name.trim()) return setError('Give the category a name');
    if (
      editing.slug !== category.slug &&
      !window.confirm(
        `Change the address to /blog/category/${editing.slug}? Links to the old address will stop working.`,
      )
    ) {
      return;
    }
    return run(async () => {
      const updated = await call<AdminBlogCategoryProps>(
        `/api/admin/blog/categories/${category.id}`,
        { method: 'PUT', body: JSON.stringify(editing) },
      );
      setCategories((current) =>
        current
          .map((item) =>
            item.id === updated.id
              ? { ...updated, postCount: item.postCount }
              : item,
          )
          .sort(byName),
      );
      setEditingId(null);
    });
  };

  const handleDelete = (category: AdminBlogCategoryProps) => {
    const posts =
      category.postCount === 1
        ? 'Its 1 post stays'
        : `Its ${category.postCount} posts stay`;
    if (
      !window.confirm(
        `Delete "${category.name}"? ${posts} and becomes uncategorised.`,
      )
    ) {
      return;
    }
    return run(async () => {
      await call(`/api/admin/blog/categories/${category.id}`, {
        method: 'DELETE',
      });
      setCategories((current) =>
        current.filter((item) => item.id !== category.id),
      );
    });
  };

  return (
    <BlogShell
      admin={admin}
      title='Categories'
      actions={
        <button
          type='button'
          onClick={() => {
            setIsAdding(true);
            setDraft(EMPTY);
            setError(null);
          }}
          className='flex items-center gap-1.5 rounded-lg bg-neutral-800 px-3 py-1.5 text-sm font-medium text-neutral-50 hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900'
        >
          <FiPlus size={14} /> Add category
        </button>
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

        {isAdding && (
          <form
            onSubmit={handleAdd}
            className='relative space-y-3 overflow-hidden rounded-xl border border-neutral-300 p-4 dark:border-neutral-800 dark:bg-neutral-900/40'
          >
            <CardPattern />
            <div className='grid gap-3 sm:grid-cols-2'>
              <input
                value={draft.name}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    name: event.target.value,
                    slug: slugify(event.target.value, 60),
                  })
                }
                placeholder='Name, e.g. Next.js'
                aria-label='Category name'
                autoFocus
                maxLength={60}
                className={inputClass}
              />
              <input
                value={draft.slug}
                onChange={(event) =>
                  setDraft({ ...draft, slug: slugify(event.target.value, 60) })
                }
                placeholder='Address, e.g. nextjs'
                aria-label='Category address'
                maxLength={60}
                className={inputClass}
              />
            </div>
            <textarea
              value={draft.description}
              onChange={(event) =>
                setDraft({ ...draft, description: event.target.value })
              }
              placeholder='One or two sentences for the category page and search results'
              aria-label='Category description'
              maxLength={300}
              rows={2}
              className={cn('w-full resize-y', inputClass)}
            />
            <div className='flex gap-2'>
              <button
                type='submit'
                disabled={isBusy}
                className='rounded-lg bg-neutral-800 px-3 py-1.5 text-sm font-medium text-neutral-50 disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900'
              >
                Save
              </button>
              <button
                type='button'
                onClick={() => setIsAdding(false)}
                className='rounded-lg border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700'
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {categories.length === 0 && !isAdding ? (
          <p className='py-8 text-center text-sm text-neutral-500'>
            No categories yet. Posts can stay uncategorised.
          </p>
        ) : (
          <ul className='space-y-2'>
            {categories.map((category) => (
              <li
                key={category.id}
                className='rounded-xl border border-neutral-300 p-4 dark:border-neutral-800 dark:bg-neutral-900/40'
              >
                {editingId === category.id ? (
                  <div className='space-y-3'>
                    <div className='grid gap-3 sm:grid-cols-2'>
                      <input
                        value={editing.name}
                        onChange={(event) =>
                          setEditing({ ...editing, name: event.target.value })
                        }
                        aria-label='Category name'
                        maxLength={60}
                        className={inputClass}
                      />
                      <input
                        value={editing.slug}
                        onChange={(event) =>
                          setEditing({
                            ...editing,
                            slug: slugify(event.target.value, 60),
                          })
                        }
                        aria-label='Category address'
                        maxLength={60}
                        className={inputClass}
                      />
                    </div>
                    <textarea
                      value={editing.description}
                      onChange={(event) =>
                        setEditing({
                          ...editing,
                          description: event.target.value,
                        })
                      }
                      aria-label='Category description'
                      maxLength={300}
                      rows={2}
                      className={cn('w-full resize-y', inputClass)}
                    />
                    <div className='flex gap-2'>
                      <button
                        type='button'
                        onClick={() => handleUpdate(category)}
                        disabled={isBusy}
                        className='flex items-center gap-1.5 rounded-lg bg-neutral-800 px-3 py-1.5 text-sm font-medium text-neutral-50 disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900'
                      >
                        <FiCheck size={14} /> Save
                      </button>
                      <button
                        type='button'
                        onClick={() => setEditingId(null)}
                        className='flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700'
                      >
                        <FiX size={14} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0'>
                      <p className='font-medium'>
                        {category.name}{' '}
                        <span className='text-xs font-normal tabular-nums text-neutral-500'>
                          {category.postCount}{' '}
                          {category.postCount === 1 ? 'post' : 'posts'}
                        </span>
                      </p>
                      <p className='truncate text-xs text-neutral-500'>
                        /blog/category/{category.slug}
                      </p>
                      {category.description && (
                        <p className='mt-1 text-sm text-neutral-600 dark:text-neutral-400'>
                          {category.description}
                        </p>
                      )}
                    </div>
                    <div className='flex shrink-0 gap-1'>
                      <button
                        type='button'
                        onClick={() => {
                          setEditingId(category.id);
                          setEditing({
                            name: category.name,
                            slug: category.slug,
                            description: category.description ?? '',
                          });
                          setError(null);
                        }}
                        aria-label={`Edit ${category.name}`}
                        className='rounded p-1.5 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        type='button'
                        onClick={() => handleDelete(category)}
                        disabled={isBusy}
                        aria-label={`Delete ${category.name}`}
                        className='rounded p-1.5 text-neutral-500 hover:text-red-500 disabled:opacity-50'
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        <p className='text-xs text-neutral-500'>
          A category shows on the blog once it has a published post. Deleting
          one keeps its posts and leaves them uncategorised.
        </p>
      </div>
    </BlogShell>
  );
};

export default BlogCategoriesTab;
