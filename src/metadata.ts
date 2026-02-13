import type { BlogPost } from './types';

/** Generate Next.js-compatible metadata for a single blog post page. */
export function createPostMetadata(post: BlogPost, siteUrl: string) {
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${siteUrl}/blog/${post.slug}`,
      type: 'article' as const,
      publishedTime: post.date,
      authors: [post.author],
      images: post.image
        ? [{ url: `${siteUrl}${post.image}`, alt: post.imageAlt ?? post.title }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: post.title,
      description: post.description,
      images: post.image ? [`${siteUrl}${post.image}`] : undefined,
    },
    alternates: {
      canonical: `${siteUrl}/blog/${post.slug}`,
    },
  };
}

/** Generate Next.js-compatible metadata for the blog listing page. */
export function createBlogListingMetadata(config: {
  siteName: string;
  siteUrl: string;
  description?: string;
}) {
  return {
    title: 'Blog',
    description: config.description,
    alternates: {
      canonical: `${config.siteUrl}/blog`,
    },
    openGraph: {
      title: `${config.siteName} Blog`,
      description: config.description,
      url: `${config.siteUrl}/blog`,
      type: 'website' as const,
    },
  };
}
