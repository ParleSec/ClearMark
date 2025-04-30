import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { createEditor, Node, Transforms, Range } from 'slate';
import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';

import { 
  CustomEditor, 
  EditorState, 
  DEFAULT_EDITOR_CONTENT,
  ImageElement,
  LinkElement
} from '../types/editor';
import { PostMetadata } from '../types/markdown';
import { withImages } from '../components/editor/plugins/withImages';
import { withLinks } from '../components/editor/plugins/withLinks';
import { withMarkdown } from '../components/editor/plugins/withMarkdown';
import { withShortcuts } from '../components/editor/plugins/withShortcuts';
import { serializeToMarkdown } from '../utils/markdown';

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
  // Create a Slate editor object that won't change across renders
  const editor = useMemo(() => 
    withShortcuts(
      withMarkdown(
        withLinks(
          withImages(
            withHistory(
              withReact(createEditor())
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