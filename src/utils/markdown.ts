import { Node, Text, Element as SlateElement } from 'slate';
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
  SerializeOptions,
  MarkdownElementType
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

  'table': (node: CustomElement, _) => {
    // Instead of relying on children string, directly process the table structure
    const rows = node.children
      .filter((row): row is CustomElement => 
        SlateElement.isElement(row) && row.type === MarkdownElementType.TableRow
      )
      .map(row => {
        // Process each cell in the row
        const cells = row.children
          .filter((cell): cell is CustomElement =>
            SlateElement.isElement(cell) && cell.type === MarkdownElementType.TableCell
          )
          .map(cell => {
            // Get the cell's text content
            const content = cell.children
              .filter(Text.isText)
              .map(n => n.text)
              .join('')
              .trim();
            return content;
          });
        
        // Format row with proper separators
        return '| ' + cells.join(' | ') + ' |';
      });

    if (rows.length === 0) return '';

    // Create separator based on first row's cell count
    const firstRow = node.children.find((row): row is CustomElement => 
      SlateElement.isElement(row) && row.type === MarkdownElementType.TableRow
    );
    const columnCount = firstRow?.children?.length || 0;
    const separator = '| ' + Array(columnCount).fill('---').join(' | ') + ' |';

    // Combine with proper newlines
    return rows[0] + '\n' + separator + '\n' + rows.slice(1).join('\n');
  },

  'table-row': (_, children) => children, // Pass through to table handler

  'table-cell': (_, children) => children.trim(), // Pass through to table handler
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