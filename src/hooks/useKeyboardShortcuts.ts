import { useEffect } from 'react';
import { Editor, Element as SlateElement, Transforms, Node } from 'slate';

import { MarkdownFormat, MarkdownElementType } from '../types/markdown';
import { registerGlobalShortcuts, matchesShortcut } from '../utils/keyboard';
import { SHORTCUTS } from '../utils/constants';
import { useEditorContext } from '../context/EditorContext';
import { CustomElement } from '../types/editor';

interface ShortcutOptions {
  // Add any global application shortcuts not handled by the editor
  onSave?: () => void;
  onExport?: () => void;
  onToggleMarkdown?: () => void;
  onToggleFocusMode?: () => void;
}

/**
 * Enhanced keyboard shortcuts hook that doesn't use useSlate directly
 */
export function useKeyboardShortcuts(options: ShortcutOptions = {}) {
  const { 
    showMarkdown, 
    setShowMarkdown, 
    focusMode, 
    setFocusMode,
    toggleFormat  // Use the context's toggleFormat for consistency
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
      
      // Toggle focus mode (Ctrl+Shift+F)
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
    // Loop through defined shortcuts in SHORTCUTS constant
    for (const [shortcut, action] of Object.entries(SHORTCUTS)) {
      if (matchesShortcut(event, shortcut)) {
        event.preventDefault();
        
        const { type, isBlock } = action;
        
        // Use the context's toggleFormat for consistency
        toggleFormat(type, isBlock);
        
        return true;
      }
    }
    
    return false;
  };
  
  return { handleEditorShortcuts };
}