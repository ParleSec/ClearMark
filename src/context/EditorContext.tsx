import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react';
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
import { withImages, insertImageWithSize } from '../components/editor/plugins/withImages';
import { withLinks } from '../components/editor/plugins/withLinks';
import { withMarkdown } from '../components/editor/plugins/withMarkdown';
import { withShortcuts } from '../components/editor/plugins/withShortcuts';
import { withHeadings } from '../components/editor/plugins/withHeadings';
import { withQuote } from '../components/editor/plugins/withQuote';
import { serializeToMarkdown } from '../utils/markdown';
import { withTable } from '../components/editor/plugins/withTable';
import { insertTable, insertRow, insertColumn, deleteRow, deleteColumn, isTableActive } from '../components/editor/plugins/withTable';
import { withDiagrams } from '../components/editor/plugins/withDiagrams';
import { insertDiagram } from '../components/editor/plugins/withDiagrams';
import { useLocalStorage, useAutoSave } from '../hooks/useLocalStorage';
import { STORAGE_KEYS, AUTOSAVE_DELAY } from '../utils/constants';

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
  insertImage: (url: string, alt?: string, size?: 'small' | 'medium' | 'large' | 'full') => void;
  insertLink: (url: string, text?: string) => void;
  toggleFormat: (format: MarkdownFormat | MarkdownElementType, isBlock?: boolean) => void;
  isFormatActive: (format: MarkdownFormat | MarkdownElementType, isBlock?: boolean) => boolean;
  insertTable: (rows?: number, cols?: number) => void;
  insertRow: () => void;
  insertColumn: () => void;
  deleteRow: () => void;
  deleteColumn: () => void;
  isTableActive: () => boolean;
  insertDiagram: (code: string, type: string) => void;
  saveStatus: SaveStatus;
  lastSaved: Date | null;
  manualSave: () => Promise<void>;
}

interface SaveStatus {
  isSaving: boolean;
  lastError: Error | null;
  lastSaved: Date | null;
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
    withDiagrams(
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
      )
    ), 
  []);

  // Save status tracking
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({
    isSaving: false,
    lastError: null,
    lastSaved: null
  });

  // Get editor content from localStorage or use default
  const [editorState, setEditorState] = useLocalStorage<EditorState>(
    STORAGE_KEYS.EDITOR_CONTENT,
    initialContent
  );
  
  // Get metadata from localStorage or use default
  const [metadata, setMetadata] = useLocalStorage<PostMetadata>(
    STORAGE_KEYS.EDITOR_METADATA,
    {
      title: '',
      description: '',
      tags: [],
      date: new Date().toISOString().split('T')[0],
    }
  );

  // Manual save function
  const manualSave = useCallback(async () => {
    setSaveStatus(prev => ({ ...prev, isSaving: true }));
    try {
      // Save editor content
      localStorage.setItem(STORAGE_KEYS.EDITOR_CONTENT, JSON.stringify(editorState));
      // Save metadata
      localStorage.setItem(STORAGE_KEYS.EDITOR_METADATA, JSON.stringify(metadata));
      // Update last saved timestamp
      const now = new Date();
      localStorage.setItem(STORAGE_KEYS.LAST_SAVED, now.toISOString());
      setSaveStatus(prev => ({
        ...prev,
        isSaving: false,
        lastError: null,
        lastSaved: now
      }));
    } catch (error) {
      console.error('Error saving editor state:', error);
      setSaveStatus(prev => ({
        ...prev,
        isSaving: false,
        lastError: error instanceof Error ? error : new Error('Failed to save')
      }));
    }
  }, [editorState, metadata]);

  // Enhanced auto-save with error handling and status tracking
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const autoSave = async () => {
      if (saveStatus.isSaving) return; // Don't start a new save if one is in progress
      
      setSaveStatus(prev => ({ ...prev, isSaving: true }));
      try {
        await manualSave();
      } catch (error) {
        console.error('Auto-save failed:', error);
        setSaveStatus(prev => ({
          ...prev,
          isSaving: false,
          lastError: error instanceof Error ? error : new Error('Auto-save failed')
        }));
      }
    };

    // Debounced auto-save
    timeoutId = setTimeout(autoSave, AUTOSAVE_DELAY);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [editorState, metadata, manualSave]);

  // Load last saved timestamp on mount
  useEffect(() => {
    const lastSavedStr = localStorage.getItem(STORAGE_KEYS.LAST_SAVED);
    if (lastSavedStr) {
      setSaveStatus(prev => ({
        ...prev,
        lastSaved: new Date(lastSavedStr)
      }));
    }
  }, []);

  // UI states
  const [showMarkdown, setShowMarkdown] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

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
      // Special handling for lists
      if (format === MarkdownElementType.BulletedList || format === MarkdownElementType.NumberedList) {
        // Check if we're toggling the same list type that's currently active
        const sameListTypeActive = isFormatActive(format, true);
        
        // Unwrap any existing lists first
        Transforms.unwrapNodes(editor, {
          match: n => 
            !Editor.isEditor(n) && 
            SlateElement.isElement(n) && 
            ((n as any).type === MarkdownElementType.BulletedList || (n as any).type === MarkdownElementType.NumberedList),
          split: true,
        });
        
        // If turning on list or switching list type, convert to list items and wrap in list
        if (!sameListTypeActive) {
          Transforms.setNodes(editor, { 
            type: MarkdownElementType.ListItem
          } as Partial<CustomElement>);
          
          Transforms.wrapNodes(editor, { 
            type: format,
            children: [] 
          } as CustomElement);
        } else {
          // If turning off list, convert list items to paragraphs
          Transforms.setNodes(editor, { 
            type: 'paragraph' 
          } as Partial<CustomElement>, {
            match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && (n as any).type === MarkdownElementType.ListItem
          });
        }
      } else {
        // For other block elements (headings, blockquotes)
        Transforms.setNodes(editor, {
          type: isFormatActive(format, true) ? 'paragraph' : format as MarkdownElementType
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
  const handleInsertImage = useCallback((url: string, alt?: string, size?: 'small' | 'medium' | 'large' | 'full') => {
    if (!url) return;
    
    // Use the enhanced insertImageWithSize function instead
    insertImageWithSize(editor, url, alt || '', size || 'medium');
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

  // Insert diagram
  const handleInsertDiagram = useCallback((code: string, type: string = 'flowchart') => {
    if (!code) return;
    insertDiagram(editor, code, type);
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
    insertTable: handleInsertTable,
    insertRow: handleInsertRow,
    insertColumn: handleInsertColumn,
    deleteRow: handleDeleteRow,
    deleteColumn: handleDeleteColumn,
    isTableActive: handleIsTableActive,
    insertDiagram: handleInsertDiagram,
    saveStatus,
    lastSaved: saveStatus.lastSaved,
    manualSave
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