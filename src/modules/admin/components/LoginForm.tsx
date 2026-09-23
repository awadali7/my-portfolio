import { useRouter } from 'next/router';
import { FormEvent, useState } from 'react';
import { FiLock, FiUser } from 'react-icons/fi';

const LoginForm = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setError(
          response.status === 429
            ? 'Too many attempts. Wait a minute and try again.'
            : body.message || 'Could not sign in',
        );
        return;
      }

      // replace(), not push() — the login page shouldn't sit in history behind
      // the console for the back button to land on.
      await router.replace('/admin');
    } catch {
      setError('Could not reach the server');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='flex min-h-[70vh] items-center justify-center'>
      <form
        onSubmit={handleSubmit}
        className='w-full max-w-sm space-y-5 rounded-xl border border-neutral-300 p-7 dark:border-neutral-800 dark:bg-neutral-900/40'
      >
        <div className='space-y-1'>
          <h1 className='text-xl font-medium'>Admin sign in</h1>
          <p className='text-sm text-neutral-600 dark:text-neutral-400'>
            Private console. Household EMI tracking.
          </p>
        </div>

        <label className='block space-y-1.5'>
          <span className='text-sm text-neutral-600 dark:text-neutral-400'>
            Username
          </span>
          <div className='flex items-center gap-2 rounded-lg border border-neutral-300 px-3 dark:border-neutral-700'>
            <FiUser className='text-neutral-500' />
            <input
              type='text'
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete='username'
              autoFocus
              required
              className='w-full bg-transparent py-2.5 text-sm outline-none'
            />
          </div>
        </label>

        <label className='block space-y-1.5'>
          <span className='text-sm text-neutral-600 dark:text-neutral-400'>
            Password
          </span>
          <div className='flex items-center gap-2 rounded-lg border border-neutral-300 px-3 dark:border-neutral-700'>
            <FiLock className='text-neutral-500' />
            <input
              type='password'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete='current-password'
              required
              className='w-full bg-transparent py-2.5 text-sm outline-none'
            />
          </div>
        </label>

        {error && (
          <p
            role='alert'
            className='rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500'
          >
            {error}
          </p>
        )}

        <button
          type='submit'
          disabled={isSubmitting}
          className='w-full rounded-lg bg-neutral-800 py-2.5 text-sm font-medium text-neutral-50 transition-colors hover:bg-neutral-700 disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white'
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
