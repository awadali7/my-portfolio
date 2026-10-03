import { useCallback, useEffect, useState } from 'react';

export type BlogView = 'grid' | 'list';

const STORAGE_KEY = 'blog-view';

/**
 * Grid or list, remembered per browser. Always starts as grid on the server
 * and the first client render, then switches to the saved choice, so the
 * server HTML and the first client render always match.
 */
const useBlogView = () => {
  const [view, setViewState] = useState<BlogView>('grid');

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === 'grid' || saved === 'list') setViewState(saved);
    } catch {
      // Storage can be blocked; the default view still works.
    }
  }, []);

  const setView = useCallback((next: BlogView) => {
    setViewState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not remembered, but the switch itself still happens.
    }
  }, []);

  return [view, setView] as const;
};

export default useBlogView;
