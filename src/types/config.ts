/**
 * Application configuration types
 */

/**
 * Theme mode options
 */
export type ThemeMode = 'light' | 'dark' | 'sepia' | 'system';

/**
 * Editor configuration
 */
export interface EditorConfig {
  /** Auto-save content */
  autosave: boolean;
  
  /** Auto-save interval in milliseconds */
  autosaveInterval: number;
  
  /** Enable spell checking */
  spellcheck: boolean;
  
  /** Enable markdown shortcuts */
  markdownShortcuts: boolean;
  
  /** Default focus mode */
  defaultFocusMode: boolean;
  
  /** Show word count */
  showWordCount: boolean;
  
  /** Show reading time */
  showReadingTime: boolean;
  
  /** Default theme */
  theme: ThemeMode;
  
  /** Font size (in px) */
  fontSize: number;
  
  /** Font family */
  fontFamily: string;
  
  /** Line height */
  lineHeight: number;
  
  /** Maximum width of the content area (in px) */
  maxWidth: number;
  
  /** Show toolbar */
  showToolbar: boolean;
  
  /** Auto-hide toolbar in focus mode */
  autoHideToolbar: boolean;
  
  /** Enable keyboard shortcuts */
  keyboardShortcuts: boolean;
}

/**
 * Toolbar configuration
 */
export interface ToolbarConfig {
  /** Show toolbar */
  visible: boolean;
  
  /** Position of the toolbar */
  position: 'top' | 'bottom' | 'left' | 'right';
  
  /** Enabled toolbar items */
  items: string[];
  
  /** Show formatting buttons */
  showFormatting: boolean;
  
  /** Show insert buttons */
  showInsert: boolean;
  
  /** Show view buttons */
  showView: boolean;
  
  /** Show export buttons */
  showExport: boolean;
}

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: EditorConfig = {
  autosave: true,
  autosaveInterval: 2000,
  spellcheck: true,
  markdownShortcuts: true,
  defaultFocusMode: false,
  showWordCount: true,
  showReadingTime: true,
  theme: 'light',
  fontSize: 16,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  lineHeight: 1.6,
  maxWidth: 1048,
  showToolbar: true,
  autoHideToolbar: true,
  keyboardShortcuts: true,
};

/**
 * Default toolbar configuration
 */
export const DEFAULT_TOOLBAR_CONFIG: ToolbarConfig = {
  visible: true,
  position: 'top',
  items: [
    'bold',
    'italic',
    'code',
    'separator',
    'heading-one',
    'heading-two',
    'heading-three',
    'block-quote',
    'bulleted-list',
    'separator',
    'image',
    'link',
  ],
  showFormatting: true,
  showInsert: true,
  showView: true,
  showExport: true,
};