import Image from 'next/image';
import type { BlogPost } from '../types';

interface BlogPostLayoutProps {
  post: BlogPost;
  header: React.ReactNode;
  footer: React.ReactNode;
  siteUrl: string;
  publisherName: string;
}

export function BlogPostLayout({
  post,
  header,
  footer,
  siteUrl,
  publisherName,
}: BlogPostLayoutProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      '@type': 'Organization',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: publisherName,
      url: siteUrl,
    },
    image: post.image ? `${siteUrl}${post.image}` : undefined,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${post.slug}`,
    },
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          'linear-gradient(to bottom, #030014 0px, #FAFAF9 140px, #FAFAF9 100%)',
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {header}

      <main className="mx-auto max-w-3xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
        <article>
          <header className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-[2.5rem] lg:leading-[1.2]">
              {post.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span>{post.author}</span>
              <span aria-hidden="true">&middot;</span>
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              <span aria-hidden="true">&middot;</span>
              <span>{post.readingTime} min read</span>
            </div>
          </header>

          {post.image && (
            <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-2xl shadow-lg">
              <Image
                src={post.image}
                alt={post.imageAlt ?? post.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          )}

          <div
            className="blog-prose"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>

      {footer}
    </div>
  );
}
