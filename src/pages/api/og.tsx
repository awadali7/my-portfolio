import type { NextRequest } from 'next/server';
import { ImageResponse } from 'next/server';

import { BackendError } from '@/services/backend';
import { getBlogPost } from '@/services/blog';

/**
 * A 1200x630 social card for posts without a cover image. Runs at the edge
 * and is cached for a week; the page's og:image adds a version parameter that
 * changes with the post, so a retitled post gets a fresh card.
 *
 * Allowed in robots.txt despite living under /api, because X and LinkedIn
 * won't fetch an image that robots.txt blocks.
 */
export const config = { runtime: 'edge' };

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const truncate = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

export default async function handler(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug') ?? '';
  if (!SLUG.test(slug)) return new Response('Not found', { status: 404 });

  let post;
  try {
    post = await getBlogPost(slug);
  } catch (error) {
    const notFound = error instanceof BackendError && error.status === 404;
    return new Response(notFound ? 'Not found' : 'Bad gateway', {
      status: notFound ? 404 : 502,
      headers: { 'cache-control': 'no-store' },
    });
  }

  const title = truncate(post.title, 110);

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          backgroundColor: '#121212',
          backgroundImage:
            'radial-gradient(circle at 88% 12%, rgba(45, 212, 191, 0.28), transparent 42%)',
          color: '#fafafa',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 26,
            color: '#a3a3a3',
          }}
        >
          <span>awadali.com/blog</span>
          {post.category ? (
            <span
              style={{
                display: 'flex',
                border: '2px solid #2dd4bf',
                borderRadius: 999,
                padding: '6px 22px',
                fontSize: 24,
                color: '#5eead4',
              }}
            >
              {post.category.name}
            </span>
          ) : null}
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: title.length > 70 ? 56 : 68,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 28,
            color: '#d4d4d4',
          }}
        >
          <span>Awad Ali</span>
          <span>{post.readingMinutes} min read</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'cache-control':
          'public, max-age=3600, s-maxage=604800, stale-while-revalidate=86400',
      },
    },
  );
}
