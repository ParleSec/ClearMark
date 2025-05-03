import { Editor, Element, Transforms } from 'slate';
import { CustomEditor, CustomElement } from '../../../types/editor';
import { MarkdownElementType } from '../../../types/markdown';

/**
 * Plugin to enhance heading behavior in the editor
 */
export const withHeadings = (editor: CustomEditor): CustomEditor => {
  const { isInline, isVoid, normalizeNode } = editor;

  editor.isInline = (element) => {
    return element.type === 'link' ? true : isInline(element);
  };

  editor.isVoid = (element) => {
    return element.type === 'image' ? true : isVoid(element);
  };

  // Enhance node normalization for headings
  editor.normalizeNode = ([node, path]) => {
    if (Element.isElement(node) && 
        ((node as any).type === MarkdownElementType.Heading1 ||
         (node as any).type === MarkdownElementType.Heading2 ||
         (node as any).type === MarkdownElementType.Heading3)) {
      if (node.children.length === 0) {
        Transforms.insertNodes(editor, { text: '' }, { at: path });
        return;
      }
    }
    normalizeNode([node, path]);
  };

  return editor;
};

/**
 * Toggle heading format
 */
export const toggleHeading = (editor: CustomEditor, level: number): void => {
  const [match] = Editor.nodes(editor, {
    match: n => Element.isElement(n) && 
      ((n as any).type === MarkdownElementType.Heading1 ||
       (n as any).type === MarkdownElementType.Heading2 ||
       (n as any).type === MarkdownElementType.Heading3),
  });

  let headingType = MarkdownElementType.Paragraph;

  switch (level) {
    case 1:
      headingType = MarkdownElementType.Heading1;
      break;
    case 2:
      headingType = MarkdownElementType.Heading2;
      break;
    case 3:
      headingType = MarkdownElementType.Heading3;
      break;
    default:
      headingType = MarkdownElementType.Heading1;
  }

  if (match) {
    Transforms.unwrapNodes(editor, {
      match: n => Element.isElement(n) && 
        ((n as any).type === MarkdownElementType.Heading1 ||
         (n as any).type === MarkdownElementType.Heading2 ||
         (n as any).type === MarkdownElementType.Heading3),
    });
  } else {
    Transforms.setNodes(editor, { type: headingType } as Partial<CustomElement>);
  }
};

/**
 * Check if a heading format is active
 */
export const isHeadingActive = (
  editor: CustomEditor, 
  headingType: MarkdownElementType
): boolean => {
  const [match] = Editor.nodes(editor, {
    match: n => !Editor.isEditor(n) && Element.isElement(n) && (n as any).type === headingType,
  });
  
  return !!match;
};

/**
 * Convert text to heading based on markdown-style shortcuts
 * Called when user types # followed by space
 */
export const convertTextToHeading = (
  editor: CustomEditor, 
  text: string
): boolean => {
  // Get current selection
  const { selection } = editor;
  if (!selection || !selection.anchor) return false;
  
  // Get current line before cursor
  const block = Editor.above(editor, {
    match: n => Editor.isBlock(editor, n as any),
  });
  
  if (!block) return false;
  
  const [, path] = block;
  const start = Editor.start(editor, path);
  const lineRange = { anchor: selection.anchor, focus: start };
  const lineText = Editor.string(editor, lineRange) + text;
  
  // Check for heading syntax
  if (lineText === '# ') {
    // Delete the markdown syntax
    Transforms.delete(editor, {
      at: lineRange,
    });
    
    // Convert to heading
    toggleHeading(editor, 1);
    return true;
  } else if (lineText === '## ') {
    Transforms.delete(editor, {
      at: lineRange,
    });
    
    toggleHeading(editor, 2);
    return true;
  } else if (lineText === '### ') {
    Transforms.delete(editor, {
      at: lineRange,
    });
    
    toggleHeading(editor, 3);
    return true;
  }
  
  return false;
};