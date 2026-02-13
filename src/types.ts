export interface BlogPostMeta {
  title: string;
  description: string;
  slug: string;
  date: string;
  author: string;
  readingTime: number;
  keywords: string[];
  image?: string;
  imageAlt?: string;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

export interface BlogKitConfig {
  /** Absolute path to the content/blog directory */
  contentDir: string;
  /** Default author name when frontmatter omits it */
  defaultAuthor?: string;
}
