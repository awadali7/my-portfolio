import Link from 'next/link';
import { FiBookOpen } from 'react-icons/fi';

import Container from '@/common/components/elements/Container';
import EmptyState from '@/common/components/elements/EmptyState';
import PageHeading from '@/common/components/elements/PageHeading';
import Pagination from '@/common/components/elements/Pagination';
import SectionHeading from '@/common/components/elements/SectionHeading';
import { BLOG_INTRO } from '@/common/constant/blog';
import useBlogView from '@/common/hooks/useBlogView';
import type { BlogCategoryProps, BlogPostListProps } from '@/common/types/blog';

import BlogCard from './BlogCard';
import BlogListCard from './BlogListCard';
import BlogToolbar from './BlogToolbar';
import FeaturedPost from './FeaturedPost';
import FeedLink from './FeedLink';

type BlogListingProps = {
  /** Null when the backend couldn't be reached. */
  posts: BlogPostListProps | null;
  categories: BlogCategoryProps[];
  activeCategory: BlogCategoryProps | null;
  page: number;
  q: string;
  tag: string;
};

const BlogListing = ({
  posts,
  categories,
  activeCategory,
  page,
  q,
  tag,
}: BlogListingProps) => {
  const [view, setView] = useBlogView();

  const basePath = activeCategory
    ? `/blog/category/${activeCategory.slug}`
    : '/blog';

  // Page 1 has no ?page=1, so each listing has exactly one address.
  const pageHref = (target: number) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (tag) params.set('tag', tag);
    if (target > 1) params.set('page', String(target));
    const search = params.toString();
    return search ? `${basePath}?${search}` : basePath;
  };

  let title = 'Blog';
  let description = BLOG_INTRO;
  let emptyMessage = 'No posts yet. Check back soon.';
  if (activeCategory) {
    title = activeCategory.name;
    description =
      activeCategory.description || `Articles about ${activeCategory.name}.`;
  }
  if (tag) {
    title = `#${tag}`;
    description = `Posts tagged ${tag}.`;
    emptyMessage = `No posts are tagged ${tag} yet.`;
  }
  if (q) {
    title = 'Search results';
    description = `Posts matching “${q}”.`;
    emptyMessage = `No posts match “${q}”.`;
  }

  // The blog's first page leads with its newest post as a hero, and the
  // grid continues from the next one, so no post appears twice.
  const isFrontPage = !activeCategory && !q && !tag && page === 1;
  const featured = isFrontPage && posts ? posts.items[0] : undefined;
  const listItems = posts ? posts.items.slice(featured ? 1 : 0) : [];
  // Under the "Latest articles" heading the cards are h3; without it, h2.
  const cardHeading = featured ? 'h3' : 'h2';

  return (
    <Container>
      <FeedLink />
      <PageHeading title={title} description={description} />

      {featured && <FeaturedPost post={featured} />}

      <section aria-label='Articles'>
        {featured && listItems.length > 0 && (
          <SectionHeading
            title='Latest articles'
            icon={<FiBookOpen size={20} />}
            className='mb-4'
          />
        )}

        <BlogToolbar
          categories={categories}
          activeSlug={activeCategory?.slug ?? null}
          isAllActive={!activeCategory && !q && !tag}
          q={q}
          view={view}
          onViewChange={setView}
        />

        {(q || tag) && (
          <p className='mb-4 text-sm'>
            <Link
              href='/blog'
              className='text-teal-600 underline-offset-2 hover:underline dark:text-teal-400'
            >
              Show all posts
            </Link>
          </p>
        )}

        {posts === null ? (
          <p
            role='alert'
            className='rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200'
          >
            Posts can&apos;t be loaded right now. Please try again in a minute.
          </p>
        ) : posts.items.length === 0 ? (
          <EmptyState message={emptyMessage} />
        ) : listItems.length === 0 ? null : view === 'list' ? (
          <div className='space-y-4'>
            {listItems.map((post) => (
              <BlogListCard
                key={post.id}
                post={post}
                headingLevel={cardHeading}
              />
            ))}
          </div>
        ) : (
          <div className='grid gap-6 sm:grid-cols-2'>
            {listItems.map((post, index) => (
              <BlogCard
                key={post.id}
                post={post}
                headingLevel={cardHeading}
                priority={!featured && page === 1 && index < 3}
              />
            ))}
          </div>
        )}

        {posts && (
          <Pagination
            totalPages={posts.totalPages}
            currentPage={page}
            getHref={pageHref}
          />
        )}
      </section>
    </Container>
  );
};

export default BlogListing;
