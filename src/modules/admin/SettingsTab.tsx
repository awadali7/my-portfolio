import { useRouter } from 'next/router';
import { FormEvent, useState } from 'react';
import { FiCheck, FiEdit2, FiPlus, FiTrash2, FiX } from 'react-icons/fi';

import type { AdminProfileProps } from '@/common/types/emi';
import type { CategoryKind, CategoryProps } from '@/common/types/money';

import CardPattern from './components/CardPattern';
import MoneyShell from './components/MoneyShell';

type SettingsTabProps = {
  admin: AdminProfileProps;
  initialCategories: CategoryProps[];
};

const GROUPS: { kind: CategoryKind; title: string; hint: string }[] = [
  { kind: 'emi', title: 'EMI categories', hint: 'Loans, chits, rent, cards' },
  {
    kind: 'income',
    title: 'Income categories',
    hint: 'Salary, freelance, rent received',
  },
  {
    kind: 'expense',
    title: 'Expense categories',
    hint: 'Groceries, fuel, eating out',
  },
];

const SettingsTab = ({ admin, initialCategories }: SettingsTabProps) => {
  const router = useRouter();
  const [categories, setCategories] =
    useState<CategoryProps[]>(initialCategories);
  const [adding, setAdding] = useState<CategoryKind | null>(null);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const call = async (url: string, init: RequestInit) => {
    const response = await fetch(url, {
      headers: { 'content-type': 'application/json' },
      ...init,
    });
    if (response.status === 401) {
      await router.replace('/admin/login');
      throw new Error('Session expired');
    }
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.message || `Request failed (${response.status})`);
    }
    return response.status === 204 ? null : await response.json();
  };

  const handleAdd = async (event: FormEvent, kind: CategoryKind) => {
    event.preventDefault();
    if (!newName.trim()) return setError('Give it a name');

    setIsBusy(true);
    setError(null);
    try {
      const created = (await call('/api/admin/categories', {
        method: 'POST',
        body: JSON.stringify({ kind, name: newName.trim() }),
      })) as CategoryProps;
      setCategories((previous) => [...previous, created]);
      setNewName('');
      setAdding(null);
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : 'Could not add');
    } finally {
      setIsBusy(false);
    }
  };

  const handleRename = async (category: CategoryProps) => {
    if (!editingName.trim() || editingName.trim() === category.name) {
      setEditingId(null);
      return;
    }

    setIsBusy(true);
    setError(null);
    try {
      const updated = (await call(`/api/admin/categories/${category.id}`, {
        method: 'PUT',
        body: JSON.stringify({ kind: category.kind, name: editingName.trim() }),
      })) as CategoryProps;
      setCategories((previous) =>
        previous.map((item) => (item.id === updated.id ? updated : item)),
      );
      setEditingId(null);
    } catch (renameError) {
      setError(
        renameError instanceof Error ? renameError.message : 'Could not rename',
      );
    } finally {
      setIsBusy(false);
    }
  };

  const handleDelete = async (category: CategoryProps) => {
    if (
      !window.confirm(
        `Delete "${category.name}"? Records already filed under it keep the name.`,
      )
    ) {
      return;
    }

    setIsBusy(true);
    setError(null);
    try {
      await call(`/api/admin/categories/${category.id}`, { method: 'DELETE' });
      setCategories((previous) =>
        previous.filter((item) => item.id !== category.id),
      );
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : 'Could not delete',
      );
    } finally {
      setIsBusy(false);
    }
  };

  const inputClass =
    'rounded-lg border border-neutral-300 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700';

  return (
    <MoneyShell
      admin={admin}
      title='Settings'
      description='Category lists used by the EMI, Income and Expense tabs.'
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

        <div className='grid gap-4 lg:grid-cols-3'>
          {GROUPS.map((group) => {
            const rows = categories
              .filter((category) => category.kind === group.kind)
              .sort((a, b) => a.name.localeCompare(b.name));

            return (
              <section
                key={group.kind}
                className='relative overflow-hidden rounded-xl border border-neutral-300 p-4 dark:border-neutral-800 dark:bg-neutral-900/40'
              >
                <CardPattern />
                <h2 className='text-sm font-medium'>{group.title}</h2>
                <p className='mt-0.5 text-xs text-neutral-500'>{group.hint}</p>

                <ul className='mt-3 divide-y divide-neutral-200 dark:divide-neutral-800'>
                  {rows.length === 0 && (
                    <li className='py-2 text-sm text-neutral-500'>None yet</li>
                  )}
                  {rows.map((category) => (
                    <li
                      key={category.id}
                      className='flex items-center justify-between gap-2 py-1.5'
                    >
                      {editingId === category.id ? (
                        <>
                          <input
                            value={editingName}
                            onChange={(event) =>
                              setEditingName(event.target.value)
                            }
                            autoFocus
                            className={`min-w-0 flex-1 ${inputClass}`}
                          />
                          <button
                            type='button'
                            onClick={() => handleRename(category)}
                            disabled={isBusy}
                            aria-label='Save name'
                            className='rounded p-1 text-emerald-600 disabled:opacity-50'
                          >
                            <FiCheck size={14} />
                          </button>
                          <button
                            type='button'
                            onClick={() => setEditingId(null)}
                            aria-label='Cancel rename'
                            className='rounded p-1 text-neutral-500'
                          >
                            <FiX size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className='min-w-0 flex-1 truncate text-sm'>
                            {category.name}
                          </span>
                          <button
                            type='button'
                            onClick={() => {
                              setEditingId(category.id);
                              setEditingName(category.name);
                            }}
                            aria-label={`Rename ${category.name}`}
                            className='rounded p-1 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                          >
                            <FiEdit2 size={13} />
                          </button>
                          <button
                            type='button'
                            onClick={() => handleDelete(category)}
                            disabled={isBusy}
                            aria-label={`Delete ${category.name}`}
                            className='rounded p-1 text-neutral-500 hover:text-red-500 disabled:opacity-50'
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </>
                      )}
                    </li>
                  ))}
                </ul>

                {adding === group.kind ? (
                  <form
                    onSubmit={(event) => handleAdd(event, group.kind)}
                    className='mt-3 flex gap-2'
                  >
                    <input
                      value={newName}
                      onChange={(event) => setNewName(event.target.value)}
                      placeholder='New category'
                      autoFocus
                      className={`min-w-0 flex-1 ${inputClass}`}
                    />
                    <button
                      type='submit'
                      disabled={isBusy}
                      aria-label='Save category'
                      className='rounded-lg bg-neutral-800 px-2.5 text-xs text-neutral-50 disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900'
                    >
                      <FiCheck size={14} />
                    </button>
                    <button
                      type='button'
                      onClick={() => {
                        setAdding(null);
                        setNewName('');
                      }}
                      aria-label='Cancel'
                      className='rounded-lg border border-neutral-300 px-2.5 text-xs dark:border-neutral-700'
                    >
                      <FiX size={14} />
                    </button>
                  </form>
                ) : (
                  <button
                    type='button'
                    onClick={() => {
                      setAdding(group.kind);
                      setNewName('');
                      setError(null);
                    }}
                    className='mt-3 flex items-center gap-1.5 text-xs text-neutral-600 underline-offset-2 hover:underline dark:text-neutral-400'
                  >
                    <FiPlus size={13} /> Add category
                  </button>
                )}
              </section>
            );
          })}
        </div>

        <p className='text-xs text-neutral-500'>
          Renaming a category also updates every record already filed under it.
          Deleting one leaves existing records with their current label.
        </p>
      </div>
    </MoneyShell>
  );
};

export default SettingsTab;
