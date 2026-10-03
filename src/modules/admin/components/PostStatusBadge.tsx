import type { BlogPostStatus } from '@/common/types/blog';

const STYLES: Record<BlogPostStatus, string> = {
  draft:
    'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  published:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
};

const LABELS: Record<BlogPostStatus, string> = {
  draft: 'Draft',
  published: 'Published',
};

const PostStatusBadge = ({ status }: { status: BlogPostStatus }) => (
  <span
    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}
  >
    {LABELS[status]}
  </span>
);

export default PostStatusBadge;
