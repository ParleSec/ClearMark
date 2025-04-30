import { Node, Text } from 'slate';
import { 
  CustomElement, 
  CustomText, 
  EditorState 
} from '../types/editor';
import { 
  ElementToMarkdown, 
  LeafToMarkdown, 
  MarkdownOutput, 
  PostMetadata, 
  SerializeOptions 
} from '../types/markdown';

/**
 * Converts editor state to markdown text
 * @param nodes The editor state to convert
 * @param options Serialization options
 * @returns Markdown string
 */
export const serializeToMarkdown = (
  nodes: EditorState, 
  options: SerializeOptions = { includeFormatting: true }
): string => {
  return nodes
    .map(node => serializeNode(node, options))
    .join('\n\n');
};

/**
 * Converts a single node to markdown
 */
const serializeNode = (node: Node, options: SerializeOptions): string => {
  // Text node handling
  if (Text.isText(node)) {
    return serializeLeaf(node as CustomText, options.includeFormatting);
  }

  // Get child content
  const children = node.children
    .map(child => serializeNode(child, options))
    .join('');

  // Convert element based on type
  const element = node as CustomElement;
  return elementToMarkdown[element.type]?.(element, children) || children;
};

/**
 * Map of element types to markdown conversion functions
 */
const elementToMarkdown: ElementToMarkdown = {
  paragraph: (_, children) => children,
  
  'heading-one': (_, children) => `# ${children}`,
  
  'heading-two': (_, children) => `## ${children}`,
  
  'heading-three': (_, children) => `### ${children}`,
  
  'block-quote': (_, children) => `> ${children}`,
  
  'bulleted-list': (node, _) => 
    node.children
      .map((item: any) => `- ${serializeNode(item, { includeFormatting: true })}`)
      .join('\n'),
  
  'numbered-list': (node, _) => 
    node.children
      .map((item: any, i: number) => `${i + 1}. ${serializeNode(item, { includeFormatting: true })}`)
      .join('\n'),
  
  'list-item': (_, children) => children,
  
  'code-block': (_, children) => `\`\`\`\n${children}\n\`\`\``,
  
  'image': (node) => `![${node.alt || ''}](${node.url})`,
  
  'link': (node, children) => `[${children}](${node.url})`,

  'table': (node, children) => children,
};

/**
 * Converts a text leaf to markdown with formatting
 */
const serializeLeaf = (leaf: CustomText, includeFormatting: boolean = true): string => {
  let text = leaf.text;
  
  if (!includeFormatting) return text;
  
  // Apply formatting in specific order (code needs to be applied before bold/italic)
  if (leaf.code) {
    text = leafToMarkdown.code(text);
  }
  
  if (leaf.bold) {
    text = leafToMarkdown.bold(text);
  }
  
  if (leaf.italic) {
    text = leafToMarkdown.italic(text);
  }
  
  return text;
};

/**
 * Map of leaf formatting to markdown conversion functions
 */
const leafToMarkdown: LeafToMarkdown = {
  bold: (text) => `**${text}**`,
  italic: (text) => `*${text}*`,
  code: (text) => `\`${text}\``,
};

/**
 * Generate front matter from post metadata
 */
export const generateFrontMatter = (metadata: PostMetadata): string => {
  let frontMatter = '---\n';
  
  Object.entries(metadata).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        frontMatter += `${key}: [${value.join(', ')}]\n`;
      } else {
        frontMatter += `${key}: ${value}\n`;
      }
    }
  });
  
  frontMatter += '---\n\n';
  return frontMatter;
};

/**
 * Generate complete markdown output with optional front matter
 */
export const generateMarkdownOutput = (
  nodes: EditorState,
  metadata?: PostMetadata,
  options: SerializeOptions = { includeFormatting: true, includeFrontMatter: true }
): MarkdownOutput => {
  const markdownContent = serializeToMarkdown(nodes, options);
  const contentWithFrontMatter = options.includeFrontMatter && metadata 
    ? `${generateFrontMatter(metadata)}${markdownContent}`
    : markdownContent;
  
  // Calculate word count
  const text = nodes.map(n => Node.string(n)).join('\n');
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  
  // Calculate reading time (average 200 words per minute)
  const readingTime = Math.ceil(wordCount / 200);
  
  return {
    content: contentWithFrontMatter,
    wordCount,
    readingTime
  };
};