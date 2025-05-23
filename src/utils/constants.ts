import { MarkdownFormat, MarkdownElementType } from '../types/markdown';

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
    EDITOR_CONTENT: 'markflow-editor-content',
    EDITOR_METADATA: 'markflow-editor-metadata',
    THEME: 'markflow-theme',
    FOCUS_MODE: 'markflow-focus-mode',
    LAST_SAVED: 'markflow-last-saved',
};

/**
 * Keyboard shortcuts configuration
 * Format: 'key combination': { type: format type, isBlock: boolean }
 */
export const SHORTCUTS = {
    // Inline formatting
    'mod+b': { type: MarkdownFormat.Bold, isBlock: false },
    'mod+i': { type: MarkdownFormat.Italic, isBlock: false },
    'mod+`': { type: MarkdownFormat.Code, isBlock: false },
    
    // Heading shortcuts
    'mod+1': { type: MarkdownElementType.Heading1, isBlock: true },
    'mod+2': { type: MarkdownElementType.Heading2, isBlock: true },
    'mod+3': { type: MarkdownElementType.Heading3, isBlock: true },
    
    // Block formatting
    'mod+shift+.': { type: MarkdownElementType.BlockQuote, isBlock: true },
    'mod+shift+8': { type: MarkdownElementType.BulletedList, isBlock: true },
    'mod+shift+7': { type: MarkdownElementType.NumberedList, isBlock: true },
  };
  
  /**
   * Default formatting toolbar items
   */
  export const DEFAULT_TOOLBAR_ITEMS = [
    { type: MarkdownFormat.Bold, isBlock: false },
    { type: MarkdownFormat.Italic, isBlock: false },
    { type: MarkdownFormat.Code, isBlock: false },
    'separator',
    { type: MarkdownElementType.Heading1, isBlock: true },
    { type: MarkdownElementType.Heading2, isBlock: true },
    { type: MarkdownElementType.Heading3, isBlock: true },
    { type: MarkdownElementType.BlockQuote, isBlock: true },
    { type: MarkdownElementType.BulletedList, isBlock: true },
    { type: MarkdownElementType.NumberedList, isBlock: true },
    'separator',
    'image',
    'link',
  ];

/**
 * Reading speed (words per minute)
 */
export const READING_SPEED = 200;

/**
 * Autosave delay in milliseconds
 */
export const AUTOSAVE_DELAY = 2000;

/**
 * Default editor content
 */
export const DEFAULT_CONTENT = [
  {
    type: 'paragraph',
    children: [{ text: 'Start writing your blog post here...' }],
  },
];

/**
 * Default metadata structure
 */
export const DEFAULT_METADATA = {
  title: '',
  description: '',
  tags: [],
  date: new Date().toISOString().split('T')[0],
  author: '',
};

/**
 * Theme values
 */
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SEPIA: 'sepia',
  SYSTEM: 'system',
};