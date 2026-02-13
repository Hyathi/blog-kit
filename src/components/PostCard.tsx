import Link from 'next/link';
import Image from 'next/image';
import type { BlogPostMeta } from '../types';

export function PostCard({ post }: { post: BlogPostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-purple-300 hover:shadow-md"
    >
      {post.image && (
        <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-xl">
          <Image
            src={post.image}
            alt={post.imageAlt ?? post.title}
            fill
            className="object-cover transition-transform group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      <time dateTime={post.date} className="text-sm text-gray-500">
        {new Date(post.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </time>
      <h2 className="mt-2 text-xl font-semibold text-gray-900 group-hover:text-purple-700">
        {post.title}
      </h2>
      <p className="mt-2 line-clamp-2 text-gray-600">{post.description}</p>
      <div className="mt-4 flex items-center gap-3 text-sm text-gray-500">
        <span>{post.author}</span>
        <span aria-hidden="true">&middot;</span>
        <span>{post.readingTime} min read</span>
      </div>
    </Link>
  );
}
