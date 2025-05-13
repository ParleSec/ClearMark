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
  [MarkdownElementType.Paragraph]: (_, children) => children,
  
  [MarkdownElementType.Heading1]: (_, children) => `# ${children}`,
  
  [MarkdownElementType.Heading2]: (_, children) => `## ${children}`,
  
  [MarkdownElementType.Heading3]: (_, children) => `### ${children}`,
  
  [MarkdownElementType.BlockQuote]: (_, children) => `> ${children}`,
  
  [MarkdownElementType.BulletedList]: (node, _) => 
    node.children
      .map((item: any) => `- ${serializeNode(item, { includeFormatting: true })}`)
      .join('\n'),
  
  [MarkdownElementType.NumberedList]: (node, _) => 
    node.children
      .map((item: any, i: number) => `${i + 1}. ${serializeNode(item, { includeFormatting: true })}`)
      .join('\n'),
  
  [MarkdownElementType.ListItem]: (_, children) => children,
  
  [MarkdownElementType.CodeBlock]: (_, children) => `\`\`\`\n${children}\n\`\`\``,
  
  [MarkdownElementType.Image]: (node) => {
    const { url, alt, size, alignment, filter, brightness, contrast, saturation, blur, grayscale } = node;
    const hasExtendedProps = size || alignment || filter || 
                           (brightness && brightness !== 100) || 
                           (contrast && contrast !== 100) || 
                           (saturation && saturation !== 100) || 
                           (blur && blur > 0) || 
                           grayscale;
    
    // For basic images, use standard markdown syntax
    if (!hasExtendedProps) {
      return `![${alt || ''}](${url})`;
    }
    
    // For enhanced images, use HTML with inline styling to preserve features
    let imgHtml = `<img src="${url}" alt="${alt || ''}"`;
    
    // Add size class
    if (size) {
      switch (size) {
        case 'small': imgHtml += ' width="25%"'; break;
        case 'medium': imgHtml += ' width="50%"'; break;
        case 'large': imgHtml += ' width="75%"'; break;
        case 'full': imgHtml += ' width="100%"'; break;
      }
    }
    
    // Start style attribute
    imgHtml += ' style="';
    
    // Add alignment as CSS properties
    if (alignment) {
      imgHtml += 'display: block;';
      switch (alignment) {
        case 'left': imgHtml += 'margin-right: auto;'; break;
        case 'center': imgHtml += 'margin-left: auto; margin-right: auto;'; break;
        case 'right': imgHtml += 'margin-left: auto;'; break;
      }
    }
    
    // Add filter and adjustments as CSS filters
    let filterProps = [];
    if (brightness && brightness !== 100) filterProps.push(`brightness(${brightness / 100})`);
    if (contrast && contrast !== 100) filterProps.push(`contrast(${contrast / 100})`);
    if (saturation && saturation !== 100) filterProps.push(`saturate(${saturation / 100})`);
    if (blur && blur > 0) filterProps.push(`blur(${blur / 10}px)`);
    if (grayscale) filterProps.push('grayscale(1)');
    
    // Add preset filters
    if (filter) {
      switch (filter) {
        case 'warm': filterProps.push('sepia(0.3)'); break;
        case 'cool': filterProps.push('hue-rotate(30deg)'); break;
        case 'vivid': filterProps.push('saturate(1.5)'); break;
        case 'muted': filterProps.push('saturate(0.7)'); break;
        case 'vintage': filterProps.push('sepia(0.5) hue-rotate(-30deg)'); break;
      }
    }
    
    if (filterProps.length > 0) {
      imgHtml += `filter: ${filterProps.join(' ')};`;
    }
    
    // Close style and tag
    imgHtml += '">';
    
    return imgHtml;
  },
  
  [MarkdownElementType.Link]: (node, children) => `[${children}](${node.url})`,

  [MarkdownElementType.Diagram]: (node) => `\`\`\`${node.diagramType}\n${node.code}\n\`\`\``,

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