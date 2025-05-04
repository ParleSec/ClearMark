// Enum of supported markdown element types
export enum MarkdownElementType {
    Paragraph = 'paragraph',
    Heading1 = 'heading-one',
    Heading2 = 'heading-two',
    Heading3 = 'heading-three',
    BlockQuote = 'block-quote',
    BulletedList = 'bulleted-list',
    NumberedList = 'numbered-list',
    ListItem = 'list-item',
    CodeBlock = 'code-block',
    Image = 'image',
    Link = 'link',
    Table = 'table',
    TableRow = 'table-row',
    TableCell = 'table-cell',
    Diagram = 'diagram',
    DiagramCode = 'diagram-code'
  }
  
  // Enum of supported markdown formatting options
  export enum MarkdownFormat {
    Bold = 'bold',
    Italic = 'italic',
    Code = 'code',
    Underline = 'underline'
  }
  
  // Interface for serialization options
  export interface SerializeOptions {
    includeFrontMatter?: boolean;
    includeFormatting?: boolean;
  }
  
  // Interface for markdown output
  export interface MarkdownOutput {
    content: string;
    wordCount: number;
    readingTime: number;
  }
  
  // Types for Markdown transformations
  export interface ElementToMarkdown {
    [key: string]: (node: any, children: string) => string;
  }
  
  export interface LeafToMarkdown {
    [key: string]: (text: string) => string;
  }
  
  // Interface for metadata
  export interface PostMetadata {
    title: string;
    description: string;
    tags: string[];
    date: string;
    author?: string;
    [key: string]: any;
  }