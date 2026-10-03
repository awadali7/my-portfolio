import { FiBookOpen } from 'react-icons/fi';

import SectionHeading from '@/common/components/elements/SectionHeading';
import type { BlogPostSummaryProps } from '@/common/types/blog';

import BlogCard from './BlogCard';

const RelatedPosts = ({ posts }: { posts: BlogPostSummaryProps[] }) => {
  if (posts.length === 0) return null;

  return (
    <section aria-label='Read next' className='mt-16'>
      <SectionHeading
        title='Read next'
        icon={<FiBookOpen size={20} />}
        className='mb-6'
      />
      <div className='grid gap-6 sm:grid-cols-2 xl:grid-cols-3'>
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} headingLevel='h3' size='sm' />
        ))}
      </div>
    </section>
  );
};

export default RelatedPosts;
