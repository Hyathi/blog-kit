import Image from 'next/image';
import Link from 'next/link';
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
  // Use rich schema from schema.json if available, otherwise generate basic Article schema
  const articleSchema = post.schema ?? [
    {
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
    },
  ];

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${siteUrl}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `${siteUrl}/blog/${post.slug}`,
      },
    ],
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          'linear-gradient(to bottom, #030014 0px, #FAFAF9 140px, #FAFAF9 100%)',
      }}
    >
      {/* Inject all schema blocks (Article, FAQPage, speakable, etc.) */}
      {articleSchema.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {header}

      <main className="mx-auto max-w-3xl px-4 pb-24 pt-40 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="transition-colors hover:text-gray-900">Home</Link>
            </li>
            <li aria-hidden="true" className="text-gray-300">/</li>
            <li>
              <Link href="/blog" className="transition-colors hover:text-gray-900">Blog</Link>
            </li>
            <li aria-hidden="true" className="text-gray-300">/</li>
            <li className="truncate text-gray-400" title={post.title}>
              {post.title}
            </li>
          </ol>
        </nav>

        <article>
          {/* Hero image first — prominent at the top */}
          {post.image && (
            <div className="relative mb-8 aspect-[2/1] overflow-hidden rounded-2xl shadow-lg">
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

          <header className="mb-12">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-[2.5rem] lg:leading-[1.2]">
              {post.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-gray-500">
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
