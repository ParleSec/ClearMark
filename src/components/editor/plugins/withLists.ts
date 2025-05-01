import { Editor, Element as SlateElement, Node, Transforms, Path } from 'slate';
import { CustomEditor, CustomElement } from '../../../types/editor';
import { MarkdownElementType } from '../../../types/markdown';

/**
 * Plugin to enhance list handling in the editor
 */
export const withLists = (editor: CustomEditor): CustomEditor => {
  const { deleteBackward, normalizeNode } = editor;
  
  // Enhance delete behavior for lists
  editor.deleteBackward = unit => {
    const { selection } = editor;
    
    if (selection && selection.anchor.offset === 0) {
      const [match] = Editor.nodes(editor, {
        match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && 
                   ((n as any).type === 'list-item'),
      });
      
      if (match) {
        const [, path] = match;
        
        if (Editor.isStart(editor, selection.anchor, path)) {
          // If at start of list item, unwrap it from the list
          Transforms.unwrapNodes(editor, {
            match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && 
                      ((n as any).type === 'bulleted-list' || (n as any).type === 'numbered-list'),
            split: true,
          });
          
          // Convert list item to paragraph
          Transforms.setNodes(editor, 
            { type: 'paragraph' } as Partial<CustomElement>,
            { match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && (n as any).type === 'list-item' }
          );
          
          return;
        }
      }
    }
    
    // Default behavior
    deleteBackward(unit);
  };
  
  // Enhance node normalization for lists
  editor.normalizeNode = entry => {
    const [node, path] = entry;
    
    if (SlateElement.isElement(node) && 
        ((node as any).type === 'bulleted-list' || (node as any).type === 'numbered-list')) {
      
      // Ensure list has only list-item children
      for (const [childNode, childPath] of Node.children(editor, path)) {
        if (SlateElement.isElement(childNode) && (childNode as any).type !== 'list-item') {
          // Convert non-list-item children to list-items
          Transforms.setNodes(
            editor,
            { type: 'list-item' } as Partial<CustomElement>,
            { at: childPath }
          );
        }
      }
    }
    
    // Call the original normalizeNode
    normalizeNode(entry);
  };
  
  return editor;
};

/**
 * Toggle list format with enhanced handling for nested lists
 */
export const toggleList = (
  editor: CustomEditor, 
  format: MarkdownElementType.BulletedList | MarkdownElementType.NumberedList
): void => {
  const isList = isListActive(editor, format);
  
  // Unwrap any existing lists first
  Transforms.unwrapNodes(editor, {
    match: n => 
      !Editor.isEditor(n) && 
      SlateElement.isElement(n) && 
      ((n as any).type === MarkdownElementType.BulletedList || (n as any).type === MarkdownElementType.NumberedList),
    split: true,
  });
  
  // If turning on list, convert paragraphs/list-items to list-items and wrap in list
  if (!isList) {
    Transforms.setNodes(editor, { 
      type: 'list-item' 
    } as Partial<CustomElement>);
    
    Transforms.wrapNodes(editor, { 
      type: format, 
      children: [] 
    } as CustomElement);
  } else {
    // If turning off list, convert list-items to paragraphs
    Transforms.setNodes(editor, { 
      type: 'paragraph' 
    } as Partial<CustomElement>, {
      match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && (n as any).type === 'list-item' 
    });
  }
};

/**
 * Check if a list format is active
 */
export const isListActive = (
  editor: CustomEditor, 
  format: MarkdownElementType.BulletedList | MarkdownElementType.NumberedList
): boolean => {
  const [match] = Editor.nodes(editor, {
    match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && (n as any).type === format,
  });
  
  return !!match;
};