import { Editor, Transforms, Element as SlateElement } from 'slate';
import { ReactEditor } from 'slate-react';
import { DiagramElement, CustomEditor } from '../../../types/editor';

export const withDiagrams = (editor: CustomEditor) => {
  const { isVoid, insertBreak } = editor;

  // Mark diagram elements as void nodes
  editor.isVoid = element => {
    return (element as any).type === 'diagram' ? true : isVoid(element);
  };

  // Handle insertion of diagrams
  editor.insertDiagram = (code: string, type: string = 'mermaid') => {
    const diagram: DiagramElement = {
      type: 'diagram',
      diagramType: type,
      code,
      children: [{ text: '' }]
    };

    Transforms.insertNodes(editor, diagram);
  };

  // Handle enter key within diagram code blocks
  editor.insertBreak = () => {
    const [node] = Editor.nodes(editor, {
      match: n => 
        !Editor.isEditor(n) && 
        SlateElement.isElement(n) && 
        (n as any).type === 'diagram-code',
    });

    if (node) {
      // Insert actual line break within diagram code blocks
      Transforms.insertText(editor, '\n');
      return;
    }

    // Default behavior for other elements
    insertBreak();
  };

  return editor;
};

// Helper function to check if diagram is active
export const isDiagramActive = (editor: CustomEditor): boolean => {
  const [match] = Editor.nodes(editor, {
    match: n => 
      !Editor.isEditor(n) && 
      SlateElement.isElement(n) && 
      (n as any).type === 'diagram',
  });
  
  return !!match;
};

// Insert a new diagram with default template
export const insertDiagram = (editor: CustomEditor, template: string = '', type: string = 'mermaid'): void => {
  const defaultTemplate = template || `graph TD
    A[Start] --> B[Process]
    B --> C[End]`;
  
  editor.insertDiagram(defaultTemplate, type);
  
  // Insert a paragraph after the diagram so user can continue typing
  Transforms.insertNodes(editor, {
    type: 'paragraph',
    children: [{ text: '' }]
  });
  
  // Move the cursor to the new paragraph
  Transforms.move(editor, { distance: 1, unit: 'line' });
}; 