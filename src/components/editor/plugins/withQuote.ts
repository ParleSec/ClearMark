import { Editor, Element as SlateElement, Transforms } from 'slate';
import { CustomEditor, CustomElement } from '../../../types/editor';
import { MarkdownElementType } from '../../../types/markdown';

/**
 * Plugin to enhance blockquote behavior in the editor
 */
export const withQuote = (editor: CustomEditor): CustomEditor => {
  const { deleteBackward, normalizeNode } = editor;
  
  // Enhanced backspace handling for blockquotes
  editor.deleteBackward = unit => {
    const { selection } = editor;
    
    if (selection && selection.anchor.offset === 0) {
      const [match] = Editor.nodes(editor, {
        match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && 
                   (n as any).type === MarkdownElementType.BlockQuote,
      });
      
      if (match) {
        const [, path] = match;
        
        if (Editor.isStart(editor, selection.anchor, path)) {
          // If at start of blockquote, convert to paragraph
          Transforms.setNodes(
            editor,
            { type: 'paragraph' } as Partial<CustomElement>,
            { at: path }
          );
          return;
        }
      }
    }
    
    // Default behavior
    deleteBackward(unit);
  };
  
  // Enhance node normalization for blockquotes
  editor.normalizeNode = entry => {
    const [node, path] = entry;
    
    if (SlateElement.isElement(node) && (node as any).type === MarkdownElementType.BlockQuote) {
      // Ensure blockquotes have at least one text child
      if (node.children.length === 0) {
        Transforms.insertNodes(
          editor,
          { text: '' },
          { at: [...path, 0] }
        );
      }
    }
    
    // Call the original normalizeNode
    normalizeNode(entry);
  };
  
  return editor;
};

/**
 * Toggle blockquote format
 */
export const toggleQuote = (editor: CustomEditor): void => {
  const isActive = isQuoteActive(editor);
  
  Transforms.setNodes(
    editor,
    { type: isActive ? 'paragraph' : MarkdownElementType.BlockQuote } as Partial<CustomElement>,
    { match: n => Editor.isBlock(editor, n as any) }
  );
};

/**
 * Check if blockquote format is active
 */
export const isQuoteActive = (editor: CustomEditor): boolean => {
  const [match] = Editor.nodes(editor, {
    match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && 
               (n as any).type === MarkdownElementType.BlockQuote,
  });
  
  return !!match;
};

/**
 * Convert text to blockquote based on markdown-style shortcuts
 * Called when user types > followed by space
 */
export const convertTextToQuote = (
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
  
  // Check for blockquote syntax
  if (lineText === '> ') {
    // Delete the markdown syntax
    Transforms.delete(editor, {
      at: lineRange,
    });
    
    // Convert to blockquote
    toggleQuote(editor);
    return true;
  }
  
  return false;
};