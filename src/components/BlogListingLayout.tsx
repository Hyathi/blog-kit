import type { BlogPostMeta } from '../types';
import { PostCard } from './PostCard';

interface BlogListingLayoutProps {
  posts: BlogPostMeta[];
  header: React.ReactNode;
  footer: React.ReactNode;
  title?: string;
  description?: string;
}

export function BlogListingLayout({
  posts,
  header,
  footer,
  title = 'Blog',
  description,
}: BlogListingLayoutProps) {
  return (
    <div
      className="min-h-screen"
      style={{
        background:
          'linear-gradient(to bottom, #030014 0px, #FAFAF9 140px, #FAFAF9 100%)',
      }}
    >
      {header}
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-40 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-600">{description}</p>
        )}

        {posts.length === 0 ? (
          <p className="mt-16 text-center text-gray-500">
            No posts yet. Check back soon!
          </p>
        ) : (
          <div className="mt-14 grid gap-10 sm:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </main>
      {footer}
    </div>
  );
}
