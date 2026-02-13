import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import type { Schema } from 'hast-util-sanitize';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeStringify from 'rehype-stringify';
import rehypeBlogElements from './rehype-blog-elements';
import type { BlogKitConfig, BlogPost, BlogPostMeta } from './types';

const sanitizeSchema: Schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a ?? []), ['className', 'anchor']],
    code: [...(defaultSchema.attributes?.code ?? []), ['className']],
    th: [...(defaultSchema.attributes?.th ?? []), ['style']],
    td: [...(defaultSchema.attributes?.td ?? []), ['style']],
    blockquote: [...(defaultSchema.attributes?.blockquote ?? []), ['className']],
    ul: [...(defaultSchema.attributes?.ul ?? []), ['className']],
    p: [...(defaultSchema.attributes?.p ?? []), ['className']],
    h2: [...(defaultSchema.attributes?.h2 ?? []), ['className']],
  },
  protocols: {
    ...defaultSchema.protocols,
    src: [...(defaultSchema.protocols?.src ?? []), ''],
  },
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    'section',
  ],
};

async function markdownToHtml(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypeBlogElements)
    .use(rehypeStringify)
    .process(markdown);

  return String(result);
}

function normalizePostDate(value: unknown, filePath: string): string {
  const raw = typeof value === 'string' ? value.trim() : String(value ?? '').trim();
  const parsed = new Date(raw);
  if (raw && !Number.isNaN(parsed.getTime())) return raw;

  // Fallback: file mtime (stable, valid ISO date string)
  return fs.statSync(filePath).mtime.toISOString().slice(0, 10);
}

function parseFrontmatter(
  filePath: string,
  defaultAuthor: string,
): { meta: BlogPostMeta; content: string } {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const stats = readingTime(content);

  return {
    meta: {
      title: data.title,
      description: data.description,
      slug: data.slug,
      date: normalizePostDate(data.date, filePath),
      author: data.author ?? defaultAuthor,
      readingTime: Math.ceil(stats.minutes),
      keywords: data.keywords ?? [],
      image: data.image,
      imageAlt: data.imageAlt,
    },
    content,
  };
}

/**
 * Create a blog engine instance bound to a specific content directory.
 *
 * ```ts
 * import path from 'path';
 * import { createBlogEngine } from '@hyathi/blog-kit';
 *
 * export const blog = createBlogEngine({
 *   contentDir: path.join(process.cwd(), 'content', 'blog'),
 *   defaultAuthor: 'My Team',
 * });
 * ```
 */
export function createBlogEngine(config: BlogKitConfig) {
  const { contentDir, defaultAuthor = 'Team' } = config;

  function getAllPostSlugs(): string[] {
    if (!fs.existsSync(contentDir)) return [];
    return fs.readdirSync(contentDir).filter((name) => {
      const fullPath = path.join(contentDir, name, 'index.md');
      return fs.existsSync(fullPath);
    });
  }

  function getAllPostsMeta(): BlogPostMeta[] {
    const slugs = getAllPostSlugs();
    const posts = slugs.map((slug) => {
      const filePath = path.join(contentDir, slug, 'index.md');
      const { meta } = parseFrontmatter(filePath, defaultAuthor);
      return meta;
    });

    return posts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }

  async function getPostBySlug(slug: string): Promise<BlogPost | null> {
    const filePath = path.join(contentDir, slug, 'index.md');
    if (!fs.existsSync(filePath)) return null;

    const { meta, content } = parseFrontmatter(filePath, defaultAuthor);
    const html = await markdownToHtml(content);

    // Load rich schema if present
    const schemaPath = path.join(contentDir, slug, 'schema.json');
    let schema: Record<string, unknown>[] | undefined;
    if (fs.existsSync(schemaPath)) {
      try {
        const raw = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
        schema = Array.isArray(raw) ? raw : [raw];
      } catch {
        // Ignore malformed schema — fall back to auto-generated
      }
    }

    return { ...meta, content: html, schema };
  }

  return { getAllPostSlugs, getAllPostsMeta, getPostBySlug };
}
