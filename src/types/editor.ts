import { BaseEditor, BaseElement as SlateBaseElement, Descendant, Path, Point, Range } from 'slate';
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
  | 'table'
  | 'table-row'
  | 'table-cell'
  | 'diagram'
  | 'diagram-code';

// Custom elements
export interface CustomText {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  underline?: boolean;
}

// Extended editor interface with custom methods
export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor & {
  insertDiagram: (code: string, type?: string) => void;
};

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

export interface BaseElement extends SlateBaseElement {
  type: string;
  align?: 'left' | 'center' | 'right';
  children: (CustomText | CustomElement)[];
}

export interface ParagraphElement extends BaseElement {
  type: 'paragraph';
}

export interface HeadingElement extends BaseElement {
  type: 'heading-one' | 'heading-two' | 'heading-three';
}

export interface BlockQuoteElement extends BaseElement {
  type: 'block-quote';
}

export interface ListElement extends BaseElement {
  type: 'bulleted-list' | 'numbered-list';
}

export interface ListItemElement extends BaseElement {
  type: 'list-item';
}

export interface ImageElement extends BaseElement {
  type: 'image';
  url: string;
  alt?: string;
}

export interface LinkElement extends BaseElement {
  type: 'link';
  url: string;
}

export interface TableElement extends BaseElement {
  type: 'table';
}

export interface TableRowElement extends BaseElement {
  type: 'table-row';
}

export interface TableCellElement extends BaseElement {
  type: 'table-cell';
}

export interface DiagramElement extends BaseElement {
  type: 'diagram';
  diagramType: string;
  code: string;
}

export type CustomElement =
  | ParagraphElement
  | HeadingElement
  | BlockQuoteElement
  | ListElement
  | ListItemElement
  | ImageElement
  | LinkElement
  | TableElement
  | TableRowElement
  | TableCellElement
  | DiagramElement;