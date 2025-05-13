import { EditorState } from '../types/editor';
import { PostMetadata, SerializeOptions } from '../types/markdown';
import { generateMarkdownOutput } from './markdown';

/**
 * Export editor content as markdown file
 */
export const exportToMarkdownFile = (
  editorState: EditorState,
  filename: string = 'blog-post',
  metadata?: PostMetadata,
  options: SerializeOptions = { includeFrontMatter: true, includeFormatting: true }
): void => {
  const { content } = generateMarkdownOutput(editorState, metadata, options);
  
  // Sanitize filename and ensure it has .md extension
  let sanitizedFilename = filename.replace(/[/\\?%*:|"<>]/g, '-').trim();
  if (!sanitizedFilename) {
    sanitizedFilename = 'blog-post';
  }
  
  // Add .md extension if not already present
  if (!sanitizedFilename.toLowerCase().endsWith('.md')) {
    sanitizedFilename += '.md';
  }
  
  // Create blob and download
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = sanitizedFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  URL.revokeObjectURL(url);
};

/**
 * Copy markdown content to clipboard
 */
export const copyMarkdownToClipboard = async (
  editorState: EditorState,
  metadata?: PostMetadata,
  options: SerializeOptions = { includeFrontMatter: true, includeFormatting: true }
): Promise<boolean> => {
  try {
    const { content } = generateMarkdownOutput(editorState, metadata, options);
    await navigator.clipboard.writeText(content);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Export editor content as HTML
 * (basic implementation - can be extended with proper HTML generation)
 */
export const exportToHtml = (
  editorState: EditorState,
  title: string = 'Blog Post'
): string => {
  // This is a simplified HTML output - could be enhanced with proper HTML rendering
  const { content } = generateMarkdownOutput(editorState, undefined, { includeFormatting: true });
  
  // Process content to preserve any HTML tags already in the markdown (particularly for our enhanced images)
  const htmlContent = content
    // First, temporarily protect any existing HTML tags in the markdown
    .replace(/<img[^>]*>/g, match => `<!--HTML_PRESERVE_${btoa(match)}-->`)
    
    // Standard markdown conversions
    .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
    .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
    .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    // Only convert standard markdown images, not our enhanced ones that are already in HTML
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.*?)$/gm, '<li>$1</li>')
    .replace(/<\/li>\n<li>/g, '</li><li>')
    .replace(/(?:^<li>.*<\/li>$)/gm, '<ul>$&</ul>')
    .replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>')
    .replace(/\n\n/g, '<br><br>')
    
    // Restore preserved HTML tags
    .replace(/<!--HTML_PRESERVE_(.*?)-->/g, (_, encoded) => atob(encoded));
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1048px;
      margin: 0 auto;
      padding: 1rem;
    }
    img { max-width: 100%; }
    blockquote {
      border-left: 4px solid #ddd;
      padding-left: 1rem;
      font-style: italic;
      color: #555;
    }
    code {
      background-color: #f5f5f5;
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
      font-family: monospace;
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;
};