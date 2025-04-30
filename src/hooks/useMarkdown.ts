import { useMemo } from 'react';
import { EditorState } from '../types/editor';
import { PostMetadata, SerializeOptions, MarkdownOutput } from '../types/markdown';
import { generateMarkdownOutput } from '../utils/markdown';
import { exportToMarkdownFile, copyMarkdownToClipboard } from '../utils/exporters';

/**
 * Custom hook to handle markdown conversion and export
 */
export function useMarkdown(
  editorState: EditorState,
  metadata?: PostMetadata
) {
  // Generate markdown content
  const markdownOutput = useMemo<MarkdownOutput>(() => {
    return generateMarkdownOutput(editorState, metadata, {
      includeFormatting: true,
      includeFrontMatter: !!metadata
    });
  }, [editorState, metadata]);
  
  // Export functionality
  const exportMarkdown = (
    filename: string = 'blog-post',
    options: SerializeOptions = {}
  ) => {
    return exportToMarkdownFile(editorState, filename, metadata, options);
  };
  
  // Copy to clipboard
  const copyMarkdown = async (options: SerializeOptions = {}): Promise<boolean> => {
    return copyMarkdownToClipboard(editorState, metadata, options);
  };
  
  // Get raw markdown content
  const getMarkdownContent = (options: SerializeOptions = {}): string => {
    const output = generateMarkdownOutput(editorState, metadata, options);
    return output.content;
  };
  
  // Get stats
  const { wordCount, readingTime } = markdownOutput;
  
  return {
    markdownContent: markdownOutput.content,
    wordCount,
    readingTime,
    exportMarkdown,
    copyMarkdown,
    getMarkdownContent,
  };
}

/**
 * Simple function to convert markdown headings to a table of contents
 */
export function markdownToTableOfContents(markdown: string): string {
  const headingRegex = /^(#+)\s+(.+)$/gm;
  let match;
  let toc = '';
  
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const title = match[2].trim();
    const anchor = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    
    // Add indentation based on heading level
    const indent = '  '.repeat(level - 1);
    toc += `${indent}- [${title}](#${anchor})\n`;
  }
  
  return toc;
}

/**
 * Parse frontmatter from markdown text
 */
export function parseFrontMatter(markdown: string): PostMetadata | null {
  const frontMatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = markdown.match(frontMatterRegex);
  
  if (!match) return null;
  
  const frontMatter = match[1];
  const metadata: PostMetadata = {};
  
  // Parse each line
  frontMatter.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length) {
      const value = valueParts.join(':').trim();
      
      // Handle arrays (values in the format [item1, item2, ...])
      if (value.startsWith('[') && value.endsWith(']')) {
        const arrayValues = value
          .slice(1, -1)
          .split(',')
          .map(item => item.trim());
        
        metadata[key.trim()] = arrayValues;
      } else {
        metadata[key.trim()] = value;
      }
    }
  });
  
  return metadata;
}