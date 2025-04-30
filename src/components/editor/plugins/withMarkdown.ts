import { 
    Editor as SlateEditor, 
    Transforms, 
    Range, 
    Point, 
    Element as SlateElement 
  } from 'slate';
  import { CustomEditor, CustomElement } from '../../../types/editor';
  
  /**
   * Plugin to add markdown-specific behavior to the editor
   */
  export const withMarkdown = (editor: CustomEditor): CustomEditor => {
    const { insertText, deleteBackward } = editor;
  
    // Handle special markdown syntax while typing
    editor.insertText = (text) => {
      const { selection } = editor;
  
      // Only apply markdown transforms when we have a valid selection
      if (selection && Range.isCollapsed(selection)) {
        const { anchor } = selection;
        const block = SlateEditor.above(editor, {
          match: (n: any) => SlateEditor.isBlock(editor, n),
        });
        
        const path = block ? block[1] : [];
        const start = SlateEditor.start(editor, path);
        const lineRange = { anchor, focus: start };
        const lineText = SlateEditor.string(editor, lineRange);
        
        // Handle heading syntax (# followed by space)
        if (text === ' ' && lineText === '#') {
          Transforms.delete(editor, {
            at: lineRange,
          });
          Transforms.setNodes(editor, { type: 'heading-one' } as Partial<CustomElement>, {
            match: (n: any) => SlateEditor.isBlock(editor, n),
          });
          return;
        }
  
        if (text === ' ' && lineText === '##') {
          Transforms.delete(editor, {
            at: lineRange,
          });
          Transforms.setNodes(editor, { type: 'heading-two' } as Partial<CustomElement>, {
            match: (n: any) => SlateEditor.isBlock(editor, n),
          });
          return;
        }
  
        if (text === ' ' && lineText === '###') {
          Transforms.delete(editor, {
            at: lineRange,
          });
          Transforms.setNodes(editor, { type: 'heading-three' } as Partial<CustomElement>, {
            match: (n: any) => SlateEditor.isBlock(editor, n),
          });
          return;
        }
        
        // Handle blockquote syntax (> followed by space)
        if (text === ' ' && lineText === '>') {
          Transforms.delete(editor, {
            at: lineRange,
          });
          Transforms.setNodes(editor, { type: 'block-quote' } as Partial<CustomElement>, {
            match: (n: any) => SlateEditor.isBlock(editor, n),
          });
          return;
        }
        
        // Handle list syntax (- or * followed by space)
        if (text === ' ' && (lineText === '-' || lineText === '*')) {
          Transforms.delete(editor, {
            at: lineRange,
          });
          Transforms.setNodes(editor, { type: 'list-item' } as Partial<CustomElement>, {
            match: (n: any) => SlateEditor.isBlock(editor, n),
          });
          
          // Check if we're in a list already or need to create a new one
          const list = SlateEditor.above(editor, {
            match: (n: any) => {
              return !SlateEditor.isEditor(n) && 
                     SlateElement.isElement(n) && 
                     (n as CustomElement).type === 'bulleted-list';
            },
          });
          
          // If not already in a list, wrap in list
          if (!list) {
            Transforms.wrapNodes(editor, { 
              type: 'bulleted-list', 
              children: [] 
            } as CustomElement);
          }
          return;
        }
        
        // Handle numbered list (1. followed by space)
        if (text === ' ' && /^\d+\.$/.test(lineText)) {
          Transforms.delete(editor, {
            at: lineRange,
          });
          Transforms.setNodes(editor, { type: 'list-item' } as Partial<CustomElement>, {
            match: (n: any) => SlateEditor.isBlock(editor, n),
          });
          
          // Check if we're in a list already or need to create a new one
          const list = SlateEditor.above(editor, {
            match: (n: any) => {
              return !SlateEditor.isEditor(n) && 
                     SlateElement.isElement(n) && 
                     (n as CustomElement).type === 'numbered-list';
            },
          });
          
          // If not already in a list, wrap in list
          if (!list) {
            Transforms.wrapNodes(editor, { 
              type: 'numbered-list', 
              children: [] 
            } as CustomElement);
          }
          return;
        }
        
        // Handle code block (``` followed by any character or Enter)
        if ((text === '`' && lineText === '``') || (text === '\n' && lineText === '```')) {
          if (text === '`') {
            // First delete the existing backticks
            Transforms.delete(editor, {
              at: lineRange,
            });
          }
          
          // Insert code block
          Transforms.setNodes(editor, { type: 'code-block' } as Partial<CustomElement>, {
            match: (n: any) => SlateEditor.isBlock(editor, n),
          });
          
          if (text === '\n') {
            // Insert a new line
            insertText('\n');
          }
          return;
        }
      }
  
      // For all other cases, use default behavior
      insertText(text);
    };
  
    // Handle special cases when deleting backward
    editor.deleteBackward = unit => {
      const { selection } = editor;
      
      if (selection && Range.isCollapsed(selection)) {
        const match = SlateEditor.above(editor, {
          match: (n: any) => SlateEditor.isBlock(editor, n),
        });
        
        if (match) {
          const [node, path] = match;
          const start = SlateEditor.start(editor, path);
          
          // If at the start of a special block, convert back to normal paragraph
          if (Point.equals(selection.anchor, start) && 
              SlateElement.isElement(node) && 
              (node as CustomElement).type !== 'paragraph') {
            Transforms.setNodes(editor, { type: 'paragraph' } as Partial<CustomElement>, {
              match: (n: any) => SlateEditor.isBlock(editor, n),
            });
            return;
          }
        }
      }
      
      // Default deletion
      deleteBackward(unit);
    };
  
    return editor;
  };