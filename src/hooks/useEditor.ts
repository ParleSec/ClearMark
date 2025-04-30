import { useMemo, useCallback, useState, useEffect } from 'react';
import { createEditor, Transforms, Editor, Element, Node, Range } from 'slate';
import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';

import { EditorState, DEFAULT_EDITOR_CONTENT, CustomElement } from '../types/editor';
import { MarkdownElementType, MarkdownFormat } from '../types/markdown';
import { withImages } from '../components/editor/plugins/withImages';
import { withLinks } from '../components/editor/plugins/withLinks';
import { withMarkdown } from '../components/editor/plugins/withMarkdown';
import { withShortcuts } from '../components/editor/plugins/withShortcuts';
import { useLocalStorage, useAutoSave } from './useLocalStorage';

const STORAGE_KEY = 'markflow-editor-content';

/**
 * Custom hook that provides all the editor functionality
 */
export const useEditor = () => {
  // Create the editor instance with all plugins
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
  
  // Get editor content from localStorage or use default
  const [editorState, setEditorState] = useLocalStorage<EditorState>(
    STORAGE_KEY, 
    DEFAULT_EDITOR_CONTENT
  );
  
  // Auto-save every few seconds
  useAutoSave(STORAGE_KEY, editorState, 2000);
  
  // Format checking and toggling
  const isFormatActive = useCallback((format: MarkdownFormat | MarkdownElementType, isBlock = false) => {
    if (isBlock) {
      const [match] = Editor.nodes(editor, {
        match: n => !Editor.isEditor(n) && Element.isElement(n) && (n as any).type === format,
      });
      return !!match;
    } else {
      const marks = Editor.marks(editor);
      if (!marks) return false;
      
      // Use type-safe approach instead of dynamic indexing
      switch (format) {
        case MarkdownFormat.Bold:
          return !!marks.bold;
        case MarkdownFormat.Italic:
          return !!marks.italic;
        case MarkdownFormat.Code:
          return !!marks.code;
        default:
          return false;
      }
    }
  }, [editor]);
  
  const toggleFormat = useCallback((format: MarkdownFormat | MarkdownElementType, isBlock = false) => {
    if (isBlock) {
      const isActive = isFormatActive(format, true);
      
      Transforms.setNodes(
        editor,
        { type: isActive ? 'paragraph' : format } as Partial<CustomElement>,
        { match: n => Editor.isBlock(editor, n as any) }
      );
    } else {
      if (isFormatActive(format)) {
        Editor.removeMark(editor, format as MarkdownFormat);
      } else {
        Editor.addMark(editor, format as MarkdownFormat, true);
      }
    }
  }, [editor, isFormatActive]);
  
  // Insert special elements
  const insertImage = useCallback((url: string, alt?: string) => {
    if (!url) return;
    
    const image = {
      type: 'image' as const,
      url,
      alt: alt || '',
      children: [{ text: '' }],
    };
    
    Transforms.insertNodes(editor, image);
  }, [editor]);
  
  const insertLink = useCallback((url: string, text?: string) => {
    if (!url) return;
    
    const { selection } = editor;
    // Use Range.isCollapsed instead of editor.isCollapsed
    const isCollapsed = selection && Range.isCollapsed(selection);
    
    if (isCollapsed) {
      const link = {
        type: 'link' as const,
        url,
        children: [{ text: text || url }],
      };
      
      Transforms.insertNodes(editor, link);
    } else {
      Transforms.wrapNodes(
        editor,
        { type: 'link' as const, url, children: [] },
        { split: true }
      );
    }
  }, [editor]);
  
  // Calculate word count
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  
  useEffect(() => {
    const text = editorState
      .map(n => Node.string(n))
      .join('\n');
    
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
    
    // Average reading speed: 200 words per minute
    const minutes = Math.ceil(words / 200);
    setReadingTime(minutes);
  }, [editorState]);
  
  return {
    editor,
    editorState,
    setEditorState,
    isFormatActive,
    toggleFormat,
    insertImage,
    insertLink,
    wordCount,
    readingTime,
  };
};