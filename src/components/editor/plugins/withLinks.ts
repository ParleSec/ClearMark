import { Editor, Element, Transforms, Range, NodeEntry, Node } from 'slate';
import { ReactEditor } from 'slate-react';
import { CustomEditor, LinkElement } from '../../../types/editor';

/**
 * Plugin to handle link elements in the editor
 */
export const withLinks = (editor: CustomEditor): CustomEditor => {
  const { insertData, isInline } = editor;

  // Mark link elements as inline
  editor.isInline = element => {
    return element.type === 'link' ? true : isInline(element);
  };

  // Handle pasting links or link text
  editor.insertData = data => {
    const text = data.getData('text/plain');
    
    // Check if pasted text is a URL
    if (isUrl(text)) {
      // If selection is expanded, wrap it in a link
      if (editor.selection && !Range.isCollapsed(editor.selection)) {
        wrapLink(editor, text);
      } 
      // Otherwise insert a new link
      else {
        insertLink(editor, text);
      }
    } 
    // Default handling for other content
    else {
      insertData(data);
      
      // After insertion, check for URLs in the inserted text
      // and convert them to links if found
      if (editor.selection) {
        const [currentNode] = Editor.nodes(editor, {
          match: n => Text.isText(n),
          at: editor.selection,
        });
        
        if (currentNode) {
          const [node, path] = currentNode;
          const nodeText = Node.string(node);
          const urls = findUrls(nodeText);
          
          if (urls.length > 0) {
            // For each URL, convert to link
            urls.forEach(url => {
              // Find the range of the URL in the text
              const start = nodeText.indexOf(url);
              if (start >= 0) {
                const end = start + url.length;
                
                // Create a Range for the URL
                const urlRange = {
                  anchor: { path, offset: start },
                  focus: { path, offset: end },
                };
                
                // Select the URL text
                Transforms.select(editor, urlRange);
                
                // Convert to link
                wrapLink(editor, url);
              }
            });
            
            // Restore cursor to end of insertion
            Transforms.select(editor, editor.selection);
          }
        }
      }
    }
  };

  return editor;
};

/**
 * Insert a new link at the current selection
 */
export const insertLink = (editor: CustomEditor, url: string, text?: string): void => {
  if (editor.selection) {
    // Create link node
    const link: LinkElement = {
      type: 'link',
      url,
      children: [{ text: text || url }],
    };
    
    Transforms.insertNodes(editor, link);
    Transforms.move(editor);
  }
};

/**
 * Wrap the current selection in a link
 */
export const wrapLink = (editor: CustomEditor, url: string): void => {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
  }
  
  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  
  // If selection is collapsed, insert the URL as link text
  if (isCollapsed) {
    Transforms.insertNodes(editor, {
      type: 'link',
      url,
      children: [{ text: url }],
    });
  } 
  // Otherwise wrap the selection with a link
  else {
    Transforms.wrapNodes(
      editor,
      { type: 'link', url, children: [] },
      { split: true }
    );
    Transforms.collapse(editor, { edge: 'end' });
  }
};

/**
 * Unwrap any links in the current selection
 */
export const unwrapLink = (editor: CustomEditor): void => {
  Transforms.unwrapNodes(editor, {
    match: n => !Editor.isEditor(n) && Element.isElement(n) && n.type === 'link',
  });
};

/**
 * Check if the current selection has a link
 */
export const isLinkActive = (editor: CustomEditor): boolean => {
  const [link] = Editor.nodes(editor, {
    match: n => !Editor.isEditor(n) && Element.isElement(n) && n.type === 'link',
  });
  return !!link;
};

/**
 * Basic URL validation
 */
export const isUrl = (text: string): boolean => {
  try {
    new URL(text);
    return true;
  } catch {
    return false;
  }
};

/**
 * Find all URLs in a string
 */
export const findUrls = (text: string): string[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
};

// Add Text namespace for TypeScript
const Text = {
  isText(node: any): boolean {
    return node && typeof node.text === 'string';
  },
};