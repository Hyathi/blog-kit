/**
 * Custom rehype plugin for the blog-kit package.
 *
 * Detects content patterns in the HTML AST produced by the agentic blogging
 * pipeline and adds CSS classes so the frontend can style them distinctly:
 *
 *  - Key Takeaways box   → blockquote.key-takeaways
 *  - Callout boxes        → blockquote.callout.callout--{variant}
 *  - Table of Contents    → h2.toc-heading + ul.toc
 *  - Citeable snippets    → p.citeable-snippet (first bold paragraph after H2)
 *
 * This plugin runs AFTER rehype-sanitize in the unified pipeline, so the
 * classes it adds are never stripped.
 */

import { visit } from 'unist-util-visit';
import { toString } from 'hast-util-to-string';
import type { Root, Element, ElementContent } from 'hast';

function addClass(node: Element, ...classNames: string[]) {
  const existing = node.properties?.className;
  const current: string[] = Array.isArray(existing)
    ? (existing as string[])
    : typeof existing === 'string'
      ? [existing]
      : [];
  node.properties = { ...node.properties, className: [...current, ...classNames] };
}

const CALLOUT_PATTERNS: { match: RegExp; cls: string }[] = [
  { match: /^Key insight:/i, cls: 'callout--insight' },
  { match: /^Bottom line:/i, cls: 'callout--bottom-line' },
  { match: /^By the numbers:/i, cls: 'callout--stat' },
  { match: /^Pro tip:/i, cls: 'callout--tip' },
];

export default function rehypeBlogElements() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      // ── Blockquote patterns ──────────────────────────────────────
      if (node.tagName === 'blockquote') {
        const text = toString(node).trim();

        // Key Takeaways box
        if (text.startsWith('Key Takeaways')) {
          addClass(node, 'key-takeaways');
          return;
        }

        // Callout variants
        for (const { match, cls } of CALLOUT_PATTERNS) {
          if (match.test(text)) {
            addClass(node, 'callout', cls);
            return;
          }
        }
      }

      // ── Table of Contents ────────────────────────────────────────
      if (
        node.tagName === 'h2' &&
        toString(node).trim().toLowerCase() === 'contents' &&
        parent &&
        typeof index === 'number'
      ) {
        addClass(node, 'toc-heading');

        // Mark the immediately following <ul> as the TOC list
        for (let i = index + 1; i < (parent.children as ElementContent[]).length; i++) {
          const sibling = parent.children[i];
          if (sibling.type === 'text' && !sibling.value.trim()) continue; // skip whitespace
          if (sibling.type === 'element' && sibling.tagName === 'ul') {
            addClass(sibling, 'toc');
          }
          break; // only check the first non-whitespace sibling
        }
      }

      // ── Citeable snippet (first bold paragraph after H2) ────────
      if (
        node.tagName === 'h2' &&
        parent &&
        typeof index === 'number'
      ) {
        // Walk forward to find the next <p> sibling
        for (let i = index + 1; i < (parent.children as ElementContent[]).length; i++) {
          const sibling = parent.children[i];
          if (sibling.type === 'text' && !sibling.value.trim()) continue;
          if (sibling.type === 'element' && sibling.tagName === 'p') {
            // Check if the paragraph's first child is <strong>
            const firstChild = sibling.children?.[0];
            if (
              firstChild &&
              firstChild.type === 'element' &&
              firstChild.tagName === 'strong'
            ) {
              addClass(sibling, 'citeable-snippet');
            }
          }
          break;
        }
      }
    });
  };
}
