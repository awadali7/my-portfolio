import type {
  AdminBlogCategoryProps,
  AdminBlogPostProps,
  AdminBlogPostRowProps,
  BlogCategoryInputProps,
  BlogCategoryProps,
  BlogFeedItemProps,
  BlogImageUploadProps,
  BlogPostInputProps,
  BlogPostListProps,
  BlogPostProps,
  BlogSitemapProps,
} from '@/common/types/blog';

import { request, sendRaw, toQueryString } from './backend';

/*
 * awad-backend's blog endpoints. Public reads (/blog/*) send no credentials;
 * admin calls (/admin/blog/*) need the bearer token from the session cookie.
 */

export const BLOG_PAGE_SIZE = 6;

export type BlogPostsQuery = {
  page?: number;
  pageSize?: number;
  category?: string;
  tag?: string;
  q?: string;
};

/* ------------------------------------------------------------------ public */

export const getBlogPosts = ({
  page = 1,
  pageSize = BLOG_PAGE_SIZE,
  category,
  tag,
  q,
}: BlogPostsQuery = {}) =>
  request<BlogPostListProps>(
    `/blog/posts${toQueryString({ page, pageSize, category, tag, q })}`,
  );

export const getBlogPost = (slug: string) =>
  request<BlogPostProps>(`/blog/posts/${encodeURIComponent(slug)}`);

export const getBlogCategories = () =>
  request<BlogCategoryProps[]>('/blog/categories');

export const getBlogSitemap = () => request<BlogSitemapProps>('/blog/sitemap');

/** The newest published posts with their bodies, for the RSS feed. */
export const getBlogFeed = () => request<BlogFeedItemProps[]>('/blog/feed');

/* ------------------------------------------------------------------- admin */

export const getAdminBlogPosts = (token: string) =>
  request<AdminBlogPostRowProps[]>('/admin/blog/posts', { token });

export const getAdminBlogPost = (token: string, id: string) =>
  request<AdminBlogPostProps>(`/admin/blog/posts/${encodeURIComponent(id)}`, {
    token,
  });

export const createBlogPost = (token: string, body: BlogPostInputProps) =>
  request<AdminBlogPostProps>('/admin/blog/posts', {
    method: 'POST',
    token,
    body,
  });

export const updateBlogPost = (
  token: string,
  id: string,
  body: BlogPostInputProps,
) =>
  request<AdminBlogPostProps>(`/admin/blog/posts/${encodeURIComponent(id)}`, {
    method: 'PUT',
    token,
    body,
  });

export const publishBlogPost = (token: string, id: string) =>
  request<AdminBlogPostProps>(
    `/admin/blog/posts/${encodeURIComponent(id)}/publish`,
    { method: 'POST', token },
  );

export const unpublishBlogPost = (token: string, id: string) =>
  request<AdminBlogPostProps>(
    `/admin/blog/posts/${encodeURIComponent(id)}/unpublish`,
    { method: 'POST', token },
  );

export const deleteBlogPost = (token: string, id: string) =>
  request<void>(`/admin/blog/posts/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    token,
  });

export const getAdminBlogCategories = (token: string) =>
  request<AdminBlogCategoryProps[]>('/admin/blog/categories', { token });

export const createBlogCategory = (
  token: string,
  body: BlogCategoryInputProps,
) =>
  request<AdminBlogCategoryProps>('/admin/blog/categories', {
    method: 'POST',
    token,
    body,
  });

export const updateBlogCategory = (
  token: string,
  id: string,
  body: BlogCategoryInputProps,
) =>
  request<AdminBlogCategoryProps>(
    `/admin/blog/categories/${encodeURIComponent(id)}`,
    { method: 'PUT', token, body },
  );

export const deleteBlogCategory = (token: string, id: string) =>
  request<void>(`/admin/blog/categories/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    token,
  });

/** Forwards a multipart image upload, boundary and all, to the backend. */
export const uploadBlogImage = (
  token: string,
  body: Buffer,
  contentType: string,
) =>
  sendRaw<BlogImageUploadProps>('/admin/blog/uploads', {
    token,
    body,
    contentType,
  });
