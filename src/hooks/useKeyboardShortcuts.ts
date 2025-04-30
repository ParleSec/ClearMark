import { useEffect } from 'react';
import { Editor, Element, Transforms, Node } from 'slate';
import { useSlate } from 'slate-react';

import { MarkdownFormat, MarkdownElementType } from '../types/markdown';
import { registerGlobalShortcuts, matchesShortcut } from '../utils/keyboard';
import { SHORTCUTS } from '../utils/constants';
import { useEditorContext } from '../context/EditorContext';
import { CustomElement, CustomText } from '../types/editor';

interface ShortcutOptions {
  // Add any global application shortcuts not handled by the editor
  onSave?: () => void;
  onExport?: () => void;
  onToggleMarkdown?: () => void;
  onToggleFocusMode?: () => void;
}

/**
 * Custom hook to handle keyboard shortcuts
 */
export function useKeyboardShortcuts(options: ShortcutOptions = {}) {
  const editor = useSlate();
  const { 
    showMarkdown, 
    setShowMarkdown, 
    focusMode, 
    setFocusMode 
  } = useEditorContext();
  
  // Register global shortcuts
  useEffect(() => {
    const globalShortcuts: Record<string, (event: KeyboardEvent) => void> = {
      // Save shortcut (Ctrl+S / Cmd+S)
      'mod+s': (event) => {
        event.preventDefault();
        if (options.onSave) {
          options.onSave();
        }
      },
      
      // Export shortcut (Ctrl+E / Cmd+E)
      'mod+e': (event) => {
        event.preventDefault();
        if (options.onExport) {
          options.onExport();
        }
      },
      
      // Toggle markdown preview (Ctrl+M / Cmd+M)
      'mod+m': (event) => {
        event.preventDefault();
        if (options.onToggleMarkdown) {
          options.onToggleMarkdown();
        } else {
          setShowMarkdown(!showMarkdown);
        }
      },
      
      // Toggle focus mode (Ctrl+F / Cmd+F)
      'mod+shift+f': (event) => {
        event.preventDefault();
        if (options.onToggleFocusMode) {
          options.onToggleFocusMode();
        } else {
          setFocusMode(!focusMode);
        }
      },
    };
    
    // Register the shortcuts and get cleanup function
    const unregister = registerGlobalShortcuts(globalShortcuts);
    
    return unregister;
  }, [
    showMarkdown, 
    setShowMarkdown, 
    focusMode, 
    setFocusMode,
    options
  ]);
  
  // Handle editor-specific shortcuts (these work inside the editor)
  const handleEditorShortcuts = (event: React.KeyboardEvent) => {
    // Loop through defined shortcuts
    for (const [shortcut, action] of Object.entries(SHORTCUTS)) {
      if (matchesShortcut(event, shortcut)) {
        event.preventDefault();
        
        const { type, isBlock } = action;
        
        if (isBlock) {
          toggleBlock(editor, type as MarkdownElementType);
        } else {
          toggleMark(editor, type as MarkdownFormat);
        }
        
        return true;
      }
    }
    
    return false;
  };
  
  return { handleEditorShortcuts };
}

/**
 * Toggle a mark in the editor
 */
function toggleMark(editor: Editor, format: MarkdownFormat) {
  const isActive = isMarkActive(editor, format);
  
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
}

/**
 * Check if a mark is active
 */
function isMarkActive(editor: Editor, format: MarkdownFormat) {
  const marks = Editor.marks(editor);
  if (!marks) return false;
  
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

/**
 * Toggle a block format
 */
function toggleBlock(editor: Editor, format: MarkdownElementType) {
  const isActive = isBlockActive(editor, format);
  
  Transforms.setNodes(
    editor,
    { type: isActive ? 'paragraph' : format } as Partial<CustomElement>,
    { match: (n: Node) => Editor.isBlock(editor, n as any) }
  );
}

/**
 * Check if a block format is active
 */
function isBlockActive(editor: Editor, format: MarkdownElementType) {
  const [match] = Editor.nodes(editor, {
    match: (n: Node) => {
      if (!Editor.isEditor(n) && Element.isElement(n)) {
        const element = n as CustomElement;
        return element.type === format;
      }
      return false;
    }
  });
  
  return !!match;
}