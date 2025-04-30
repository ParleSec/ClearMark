import { BaseEditor, Descendant, Node, Path, Point, Range } from 'slate';
import { ReactEditor } from 'slate-react';
import { HistoryEditor } from 'slate-history';
import React from 'react';

// Custom element types that our editor supports
export type ElementType = 
  | 'paragraph'
  | 'heading-one'
  | 'heading-two'
  | 'heading-three'
  | 'block-quote'
  | 'bulleted-list'
  | 'numbered-list'
  | 'list-item'
  | 'code-block'
  | 'image'
  | 'link'
  | 'table';

// Custom elements
export type ParagraphElement = {
  type: 'paragraph';
  children: Descendant[];
};

export type HeadingOneElement = {
  type: 'heading-one';
  children: Descendant[];
};

export type HeadingTwoElement = {
  type: 'heading-two';
  children: Descendant[];
};

export type HeadingThreeElement = {
  type: 'heading-three';
  children: Descendant[];
};

export type BlockQuoteElement = {
  type: 'block-quote';
  children: Descendant[];
};

export type BulletedListElement = {
  type: 'bulleted-list';
  children: Descendant[];
};

export type NumberedListElement = {
  type: 'numbered-list';
  children: Descendant[];
};

export type ListItemElement = {
  type: 'list-item';
  children: Descendant[];
};

export type CodeBlockElement = {
  type: 'code-block';
  children: Descendant[];
};

export type ImageElement = {
  type: 'image';
  url: string;
  alt?: string;
  size?: 'small' | 'medium' | 'large' | 'full';
  alignment?: 'left' | 'center' | 'right';
  children: Descendant[];
};

export type LinkElement = {
  type: 'link';
  url: string;
  children: Descendant[];
};

export type TableElement = {
  type: 'table';
  children: Descendant[];
};

// Union of all element types
export type CustomElement =
  | ParagraphElement
  | HeadingOneElement
  | HeadingTwoElement
  | HeadingThreeElement
  | BlockQuoteElement
  | BulletedListElement
  | NumberedListElement
  | ListItemElement
  | CodeBlockElement
  | ImageElement
  | LinkElement
  | TableElement;

// Custom text formatting
export type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
};

// Extended editor interface with custom methods
export interface CustomEditor extends BaseEditor, ReactEditor, HistoryEditor {
  // Void element checking
  isVoid: (element: CustomElement) => boolean;
  
  // Inline element checking
  isInline: (element: CustomElement) => boolean;
  
  // Data insertion handling
  insertData: (data: DataTransfer) => void;
  
  // Keyboard deletion handling
  deleteBackward: (unit: 'character' | 'word' | 'line' | 'block') => void;
  
  // Keyboard event handling
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  
  // Additional methods that might be added by plugins
  insertNode: (node: Node) => void;
  
  // Check if selection is collapsed
  isCollapsed: (selection: Range) => boolean;
  
  // Wrap nodes in an element
  // (inherited from BaseEditor, do not redeclare to avoid type conflicts)
  
  // Selection handling
  collapse: (options?: { edge?: 'anchor' | 'focus' | 'start' | 'end' }) => void;
}

// Location type alias for convenience
type Location = Path | Point | Range;

// Extend Slate's type declarations
declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

// Editor state type
export type EditorState = Descendant[];

// Default initial editor content
export const DEFAULT_EDITOR_CONTENT: EditorState = [
  {
    type: 'paragraph',
    children: [{ text: 'Start writing your blog post here...' }],
  },
];