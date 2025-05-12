import { Editor, Transforms, Element as SlateElement, Path, Node } from 'slate';
import { DiagramElement, CustomEditor } from '../../../types/editor';

/**
 * A simplified plugin to handle diagrams in the editor
 */
export const withDiagrams = (editor: CustomEditor) => {
  const { isVoid, insertBreak, deleteBackward } = editor;

  // Mark diagram elements as void nodes
  editor.isVoid = (element: any) => {
    return element.type === 'diagram' ? true : isVoid(element);
  };

  // Insert a diagram
  editor.insertDiagram = (code: string, type = 'flowchart') => {
    const diagram: DiagramElement = {
      type: 'diagram',
      diagramType: type,
      code,
      children: [{ text: '' }]
    };

    Transforms.insertNodes(editor, diagram as Node);
    
    // Insert a paragraph after the diagram so user can continue typing
    Transforms.insertNodes(editor, {
      type: 'paragraph',
      children: [{ text: '' }]
    } as Node);
    
    // Try to move cursor to new paragraph
    try {
      Transforms.move(editor, { distance: 1 });
    } catch (e) {
      console.warn('Could not move cursor after diagram insertion');
    }
  };
  
  // Update an existing diagram
  editor.updateDiagram = (path: Path, code: string, type: string | null = null) => {
    try {
      const updateParams: Partial<DiagramElement> = { code };
      
      if (type) {
        updateParams.diagramType = type;
      }
      
      Transforms.setNodes(
        editor,
        updateParams,
        { at: path }
      );
    } catch (error) {
      console.error('Error updating diagram:', error);
    }
  };
  
  // Enhanced navigation around diagrams
  editor.insertBreak = () => {
    const { selection } = editor;
    
    if (selection) {
      const [node] = Editor.nodes(editor, {
        match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'diagram',
        mode: 'lowest'
      }) || [];
      
      if (node) {
        // If we're on a diagram, insert break after it instead of trying to split it
        insertBreak();
        return;
      }
    }
    
    // Default behavior
    insertBreak();
  };

  return editor;
};

/**
 * Check if a diagram is selected or cursor is in/near a diagram
 */
export const isDiagramActive = (editor: CustomEditor) => {
  if (!editor.selection) return false;
  
  const [diagram] = Editor.nodes(editor, {
    match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'diagram',
    mode: 'lowest'
  }) || [];
  
  return !!diagram;
};

/**
 * Get the currently selected diagram's data
 */
export const getSelectedDiagram = (editor: CustomEditor) => {
  if (!editor.selection) return null;
  
  const [diagram] = Editor.nodes(editor, {
    match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'diagram',
    mode: 'lowest'
  }) || [];
  
  if (diagram) {
    const [node, path] = diagram;
    return { node, path };
  }
  
  return null;
};

/**
 * Insert a new diagram
 */
export const insertDiagram = (editor: CustomEditor, code = '', type = 'flowchart') => {
  // Make sure we have valid code and type
  const diagramCode = code || getDefaultTemplate(type);
  
  // Insert the diagram with both code and type
  editor.insertDiagram(diagramCode, type);
};

/**
 * Get a default template based on diagram type
 */
export const getDefaultTemplate = (type: string) => {
  switch (type) {
    case 'flowchart':
      return `flowchart LR
  Start([Start]) --> Process[Do Something] --> End([End])`;
    
    case 'sequence':
      return `sequenceDiagram
  Person A->>Person B: Hello!
  Person B-->>Person A: Hi there!`;
    
    case 'pie':
      return `pie title Distribution
  "Section A" : 40
  "Section B" : 30
  "Section C" : 30`;
    
    case 'class':
      return `classDiagram
  class Animal {
    +name: string
    +makeSound(): void
  }
  class Dog {
    +breed: string
    +bark(): void
  }
  Animal <|-- Dog`;
    
    case 'er':
      return `erDiagram
  CUSTOMER ||--o{ ORDER : places
  ORDER ||--|{ LINE-ITEM : contains
  CUSTOMER {
    string name
    string email
  }
  ORDER {
    int id
    date created
  }`;
    
    default:
      return `flowchart LR
  Start([Start]) --> Process[Do Something] --> End([End])`;
  }
};