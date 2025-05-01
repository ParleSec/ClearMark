import { Editor, Element as SlateElement, Transforms } from 'slate';
import { CustomEditor, CustomElement } from '../../../types/editor';
import { MarkdownElementType } from '../../../types/markdown';

/**
 * Plugin to enhance heading behavior in the editor
 */
export const withHeadings = (editor: CustomEditor): CustomEditor => {
  const { normalizeNode } = editor;

  // Enhance node normalization for headings
  editor.normalizeNode = entry => {
    const [node, path] = entry;

    // Handle heading nodes to ensure they have proper structure
    if (SlateElement.isElement(node) && 
        ((node as any).type === MarkdownElementType.HeadingOne ||
         (node as any).type === MarkdownElementType.HeadingTwo ||
         (node as any).type === MarkdownElementType.HeadingThree)) {
      
      // Ensure headings have at least one text child
      if (node.children.length === 0) {
        Transforms.insertNodes(
          editor,
          { text: '' },
          { at: [...path, 0] }
        );
      }
    }

    // Call the original normalizeNode to handle other cases
    normalizeNode(entry);
  };

  return editor;
};

/**
 * Toggle heading format
 */
export const toggleHeading = (
  editor: CustomEditor, 
  level: 1 | 2 | 3
): void => {
  let headingType: MarkdownElementType;
  
  switch (level) {
    case 1:
      headingType = MarkdownElementType.HeadingOne;
      break;
    case 2:
      headingType = MarkdownElementType.HeadingTwo;
      break;
    case 3:
      headingType = MarkdownElementType.HeadingThree;
      break;
    default:
      headingType = MarkdownElementType.HeadingOne;
  }
  
  const isActive = isHeadingActive(editor, headingType);
  
  Transforms.setNodes(
    editor,
    { type: isActive ? 'paragraph' : headingType } as Partial<CustomElement>,
    { match: n => Editor.isBlock(editor, n as any) }
  );
};

/**
 * Check if a heading format is active
 */
export const isHeadingActive = (
  editor: CustomEditor, 
  headingType: MarkdownElementType
): boolean => {
  const [match] = Editor.nodes(editor, {
    match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && (n as any).type === headingType,
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