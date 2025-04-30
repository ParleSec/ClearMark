/**
 * Utility functions for keyboard handling
 */

/**
 * Check if the platform is Mac
 */
export const isMac = typeof navigator !== 'undefined' 
  ? /Mac|iPod|iPhone|iPad/.test(navigator.platform)
  : false;

/**
 * Normalize keyboard event to a standard format
 * @param event Keyboard event
 * @returns Standardized key combo string
 */
export const normalizeKeyEvent = (event: React.KeyboardEvent | KeyboardEvent): string => {
  const { key, ctrlKey, metaKey, altKey, shiftKey } = event;
  
  // Use metaKey on Mac, ctrlKey elsewhere
  const modKey = isMac ? metaKey : ctrlKey;
  
  // Build combo string
  let combo = '';
  if (modKey) combo += 'mod+';
  if (altKey) combo += 'alt+';
  if (shiftKey) combo += 'shift+';
  
  // Add the main key (lowercase for consistency)
  combo += key.toLowerCase();
  
  return combo;
};

/**
 * Format a key combination for display
 * @param shortcut Key combination string (e.g. 'mod+b')
 * @returns Human-readable shortcut (e.g. '⌘+B' on Mac or 'Ctrl+B' elsewhere)
 */
export const formatKeyboardShortcut = (shortcut: string): string => {
  return shortcut
    .split('+')
    .map(part => {
      switch (part) {
        case 'mod':
          return isMac ? '⌘' : 'Ctrl';
        case 'alt':
          return isMac ? '⌥' : 'Alt';
        case 'shift':
          return isMac ? '⇧' : 'Shift';
        case 'enter':
          return '↵';
        case 'backspace':
          return '⌫';
        case 'tab':
          return '⇥';
        case 'escape':
          return 'Esc';
        default:
          // Capitalize single letters
          return part.length === 1 ? part.toUpperCase() : part;
      }
    })
    .join('+');
};

/**
 * Check if a keyboard event matches a shortcut
 * @param event Keyboard event
 * @param shortcut Shortcut string (e.g. 'mod+b')
 * @returns Whether the event matches the shortcut
 */
export const matchesShortcut = (
  event: React.KeyboardEvent | KeyboardEvent, 
  shortcut: string
): boolean => {
  return normalizeKeyEvent(event) === shortcut;
};

/**
 * Register global keyboard shortcuts
 * @param shortcuts Object mapping shortcut strings to handler functions
 * @returns Function to unregister shortcuts
 */
export const registerGlobalShortcuts = (
  shortcuts: Record<string, (event: KeyboardEvent) => void>
): () => void => {
  const handleKeyDown = (event: KeyboardEvent) => {
    const combo = normalizeKeyEvent(event);
    
    if (shortcuts[combo]) {
      event.preventDefault();
      shortcuts[combo](event);
    }
  };
  
  document.addEventListener('keydown', handleKeyDown);
  
  // Return cleanup function
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
};