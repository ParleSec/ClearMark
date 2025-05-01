import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { createEditor, Node, Transforms, Range, Editor, Element as SlateElement } from 'slate';
import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';

import { 
  CustomEditor, 
  EditorState, 
  DEFAULT_EDITOR_CONTENT,
  ImageElement,
  LinkElement,
  CustomElement
} from '../types/editor';
import { MarkdownFormat, MarkdownElementType, PostMetadata } from '../types/markdown';
import { withImages } from '../components/editor/plugins/withImages';
import { withLinks } from '../components/editor/plugins/withLinks';
import { withMarkdown } from '../components/editor/plugins/withMarkdown';
import { withShortcuts } from '../components/editor/plugins/withShortcuts';
import { withHeadings } from '../components/editor/plugins/withHeadings';
import { withQuote } from '../components/editor/plugins/withQuote';
import { serializeToMarkdown } from '../utils/markdown';
import { withTable } from '../components/editor/plugins/withTable';
import { insertTable, insertRow, insertColumn, deleteRow, deleteColumn, isTableActive } from '../components/editor/plugins/withTable';

interface EditorContextValue {
  editor: CustomEditor;
  editorState: EditorState;
  setEditorState: (state: EditorState) => void;
  markdownContent: string;
  wordCount: number;
  readingTime: number;
  showMarkdown: boolean;
  setShowMarkdown: (show: boolean) => void;
  focusMode: boolean;
  setFocusMode: (focus: boolean) => void;
  metadata: PostMetadata;
  setMetadata: (metadata: PostMetadata) => void;
  insertImage: (url: string, alt?: string) => void;
  insertLink: (url: string, text?: string) => void;
  toggleFormat: (format: MarkdownFormat | MarkdownElementType, isBlock?: boolean) => void;
  isFormatActive: (format: MarkdownFormat | MarkdownElementType, isBlock?: boolean) => boolean;
  insertTable: (rows?: number, cols?: number) => void;
  insertRow: () => void;
  insertColumn: () => void;
  deleteRow: () => void;
  deleteColumn: () => void;
  isTableActive: () => boolean;
}

const EditorContext = createContext<EditorContextValue | undefined>(undefined);

interface EditorProviderProps {
  children: ReactNode;
  initialContent?: EditorState;
}

export const EditorProvider: React.FC<EditorProviderProps> = ({ 
  children, 
  initialContent = DEFAULT_EDITOR_CONTENT 
}) => {
  // Create a Slate editor object with all plugins
  const editor = useMemo(() => 
    withTable(
      withShortcuts(
        withMarkdown(
          withLinks(
            withImages(
              withQuote(
                withHeadings(
                  withHistory(
                    withReact(createEditor())
                  )
                )
              )
            )
          )
        )
      )
    ), 
  []);

  // Editor state
  const [editorState, setEditorState] = useState<EditorState>(initialContent);
  
  // UI states
  const [showMarkdown, setShowMarkdown] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  
  // Metadata
  const [metadata, setMetadata] = useState<PostMetadata>({
    title: '',
    description: '',
    tags: [],
    date: new Date().toISOString().split('T')[0],
  });

  // Generate markdown content from editor state
  const markdownContent = useMemo(() => {
    return serializeToMarkdown(editorState);
  }, [editorState]);

  // Calculate word count and reading time
  const wordCount = useMemo(() => {
    const text = editorState
      .map(n => Node.string(n))
      .join('\n');
    
    return text.trim().split(/\s+/).filter(Boolean).length;
  }, [editorState]);

  const readingTime = useMemo(() => {
    // Average reading speed: 200 words per minute
    return Math.ceil(wordCount / 200);
  }, [wordCount]);

  // Format checking and toggling
  const isFormatActive = useCallback((format: MarkdownFormat | MarkdownElementType, isBlock = false): boolean => {
    if (isBlock) {
      const [match] = Editor.nodes(editor, {
        match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && (n as any).type === format,
      });
      return !!match;
    } else {
      const marks = Editor.marks(editor);
      // Type-safe format checking
      if (!marks) return false;
      
      // Safe way to check formatting marks
      switch (format) {
        case MarkdownFormat.Bold:
          return marks.bold === true;
        case MarkdownFormat.Italic:
          return marks.italic === true;
        case MarkdownFormat.Code:
          return marks.code === true;
        default:
          return false;
      }
    }
  }, [editor]);

  const toggleFormat = useCallback((format: MarkdownFormat | MarkdownElementType, isBlock = false): void => {
    if (isBlock) {
      const isActive = isFormatActive(format, true);
      
      // Special handling for lists
      if (format === MarkdownElementType.BulletedList || format === MarkdownElementType.NumberedList) {
        // Unwrap any existing lists first
        Transforms.unwrapNodes(editor, {
          match: n => 
            !Editor.isEditor(n) && 
            SlateElement.isElement(n) && 
            ((n as any).type === MarkdownElementType.BulletedList || (n as any).type === MarkdownElementType.NumberedList),
          split: true,
        });
        
        // If turning on list, convert paragraphs to list-items and wrap in list
        if (!isActive) {
          Transforms.setNodes(editor, { 
            type: 'list-item' as const
          });
          Transforms.wrapNodes(editor, { 
            type: format as MarkdownElementType,
            children: [] 
          } as CustomElement);
        }
      } else {
        // For other block elements (headings, blockquotes)
        Transforms.setNodes(editor, {
          type: isActive ? 'paragraph' : format as MarkdownElementType
        } as Partial<CustomElement>);
      }
    } else {
      // Inline formatting
      const isActive = isFormatActive(format);
      if (isActive) {
        Editor.removeMark(editor, format as MarkdownFormat);
      } else {
        Editor.addMark(editor, format as MarkdownFormat, true);
      }
    }
  }, [editor, isFormatActive]);

  // Insert elements
  const handleInsertImage = useCallback((url: string, alt?: string) => {
    if (!url) return;
    
    // Create image element with proper typing
    const image: ImageElement = {
      type: 'image',
      url,
      alt: alt || '',
      children: [{ text: '' }],
    };
    
    // Insert the image node
    Transforms.insertNodes(editor, image);
  }, [editor]);

  const handleInsertLink = useCallback((url: string, text?: string) => {
    if (!url) return;
    
    const { selection } = editor;
    
    // Use Range.isCollapsed instead of editor.isCollapsed
    if (selection && Range.isCollapsed(selection)) {
      // Insert new link with proper typing
      const link: LinkElement = {
        type: 'link',
        url,
        children: [{ text: text || url }],
      };
      
      Transforms.insertNodes(editor, link);
    } else {
      // Wrap selection in link with proper typing
      Transforms.wrapNodes(
        editor,
        { type: 'link', url, children: [] } as LinkElement,
        { split: true }
      );
    }
  }, [editor]);

  // Table functions
  const handleInsertTable = useCallback((rows: number = 3, cols: number = 3) => {
    insertTable(editor, rows, cols);
  }, [editor]);

  const handleInsertRow = useCallback(() => {
    insertRow(editor);
  }, [editor]);

  const handleInsertColumn = useCallback(() => {
    insertColumn(editor);
  }, [editor]);

  const handleDeleteRow = useCallback(() => {
    deleteRow(editor);
  }, [editor]);

  const handleDeleteColumn = useCallback(() => {
    deleteColumn(editor);
  }, [editor]);

  const handleIsTableActive = useCallback(() => {
    return isTableActive(editor);
  }, [editor]);

  // Context value
  const value = {
    editor,
    editorState,
    setEditorState,
    markdownContent,
    wordCount,
    readingTime,
    showMarkdown,
    setShowMarkdown,
    focusMode,
    setFocusMode,
    metadata,
    setMetadata,
    insertImage: handleInsertImage,
    insertLink: handleInsertLink,
    toggleFormat,
    isFormatActive,
    insertTable: (rows = 3, cols = 3) => insertTable(editor, rows, cols),
    insertRow: () => insertRow(editor),
    insertColumn: () => insertColumn(editor),
    deleteRow: () => deleteRow(editor),
    deleteColumn: () => deleteColumn(editor),
    isTableActive: () => isTableActive(editor)
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
};

// Custom hook to use the editor context
export const useEditorContext = (): EditorContextValue => {
  const context = useContext(EditorContext);
  
  if (context === undefined) {
    throw new Error('useEditorContext must be used within an EditorProvider');
  }
  
  return context;
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};