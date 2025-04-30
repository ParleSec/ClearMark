import { Editor, Transforms, Range, Node, Path, Element } from 'slate';
import { ReactEditor } from 'slate-react';
import { 
  CustomEditor, 
  CustomElement, 
  ImageElement, 
  LinkElement 
} from '../types/editor';
import { MarkdownFormat, MarkdownElementType } from '../types/markdown';

/**
 * Check if format is active on the current selection
 */
export const isFormatActive = (
  editor: CustomEditor, 
  format: MarkdownFormat | string, 
  isBlock = false
): boolean => {
  if (isBlock) {
    const [match] = Editor.nodes(editor, {
      match: (n) => !Editor.isEditor(n) && Element.isElement(n) && (n as any).type === format,
    });
    return !!match;
  }
  
  const marks = Editor.marks(editor);
  return marks ? marks[format as keyof typeof marks] === true : false;
};

/**
 * Toggle a block format
 */
export const toggleBlock = (
  editor: CustomEditor, 
  format: MarkdownElementType
): void => {
  const isActive = isFormatActive(editor, format, true);
  
  Transforms.setNodes(
    editor,
    { type: isActive ? 'paragraph' : format } as Partial<CustomElement>,
    {
      match: (n) => Editor.isBlock(editor, n as any),
    }
  );
};

/**
 * Toggle a text format mark
 */
export const toggleMark = (
  editor: CustomEditor, 
  format: MarkdownFormat
): void => {
  const isActive = isFormatActive(editor, format);
  
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

/**
 * Insert an image element
 */
export const insertImage = (
  editor: CustomEditor, 
  url: string, 
  alt: string = ''
): void => {
  const image: ImageElement = {
    type: 'image',
    url,
    alt,
    children: [{ text: '' }],
  };
  
  Transforms.insertNodes(editor, image);
  
  // Move selection after the image
  try {
    Transforms.move(editor, { distance: 1 });
  } catch (e) {
    // If we can't move, insert a paragraph
    Transforms.insertNodes(
      editor,
      {
        type: 'paragraph',
        children: [{ text: '' }],
      } as CustomElement
    );
  }
};

/**
 * Insert a link
 */
export const insertLink = (
  editor: CustomEditor, 
  url: string, 
  text?: string
): void => {
  if (!url) return;
  
  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  
  if (isCollapsed) {
    // Insert new link
    const link: LinkElement = {
      type: 'link',
      url,
      children: [{ text: text || url }],
    };
    
    Transforms.insertNodes(editor, link);
  } else {
    // Wrap selection in link
    Transforms.wrapNodes(
      editor,
      { type: 'link', url, children: [] } as LinkElement,
      { split: true }
    );
  }
};

/**
 * Determine if string could be an image URL
 */
export const isImageUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Check for URL format
  if (
    !url.startsWith('http://') && 
    !url.startsWith('https://') && 
    !url.startsWith('data:image/')
  ) {
    return false;
  }
  
  // Check for image extensions
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
  const hasImageExtension = imageExtensions.some(ext => 
    url.toLowerCase().endsWith(ext)
  );
  
  return url.startsWith('data:image/') || hasImageExtension;
};

/**
 * Helper to determine correct React key for Slate nodes
 */
export const getNodeKey = (node: Node, path: Path): string => {
  return path.join(',');
};