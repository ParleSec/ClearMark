import { Editor, Element, Transforms, Path, Node } from 'slate';
import { ReactEditor } from 'slate-react';
import { CustomEditor, ImageElement } from '../../../types/editor';

/**
 * Enhanced image plugin with improved user experience
 * - Drag and drop support
 * - Paste support (from clipboard)
 * - Image resizing
 * - Better deletion handling
 */
export const withImages = (editor: CustomEditor): CustomEditor => {
  const { isVoid, insertData, deleteBackward } = editor;

  // Mark image elements as void
  editor.isVoid = element => {
    return element.type === 'image' ? true : isVoid(element);
  };

  // Handle pasting image URLs and drag-drop events
  editor.insertData = data => {
    const text = data.getData('text/plain');
    const { files } = data;

    // If dragging or pasting files, try to handle as images
    if (files && files.length > 0) {
      for (const file of Array.from(files)) {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.addEventListener('load', () => {
            const url = reader.result;
            if (typeof url === 'string') {
              insertImageWithSize(editor, url);
            }
          });
          reader.readAsDataURL(file);
          return; // Prevent default handling
        }
      }
    } 
    // Check if clipboard contains an image URL
    else if (isImageUrl(text)) {
      insertImageWithSize(editor, text);
      return; // Prevent default handling
    } 
    
    // Default handling for other content
    insertData(data);
  };

  // Improve handling of deletion when next to images
  editor.deleteBackward = unit => {
    const { selection } = editor;

    // Handle regular deletion
    if (selection && Path.isPath(selection.focus.path)) {
      const [node] = Editor.node(editor, selection.focus.path);
      
      // If at the start of a text node right after an image, delete the image
      if (
        selection.focus.offset === 0 &&
        Element.isElement(node) &&
        selection.focus.path[selection.focus.path.length - 1] === 0
      ) {
        const [previousNode] = Editor.previous(editor) || [];
        
        if (previousNode && Element.isElement(previousNode) && previousNode.type === 'image') {
          return Transforms.removeNodes(editor, { at: Path.previous(selection.focus.path) });
        }
      }
    }

    // Default deletion behavior
    deleteBackward(unit);
  };

  return editor;
};

/**
 * Insert an image with size options and position it properly
 */
export const insertImageWithSize = (
  editor: CustomEditor, 
  url: string, 
  alt: string = '',
  size: 'small' | 'medium' | 'large' | 'full' = 'medium'
): void => {
  // Create the image element with size information
  const image: ImageElement = {
    type: 'image',
    url,
    alt,
    size, // Store size preference for rendering
    alignment: 'center', // Default to center alignment
    brightness: 100, // Default brightness
    contrast: 100, // Default contrast
    saturation: 100, // Default saturation
    blur: 0, // Default blur
    grayscale: false, // Default grayscale
    children: [{ text: '' }],
  };

  // Insert the image at the current selection
  Transforms.insertNodes(editor, image);
  
  // Move selection after the image
  try {
    Transforms.move(editor, { distance: 1 });
  } catch (e) {
    // If we can't move after (e.g., image is at document end), 
    // just make sure we have a paragraph to type in
    const [match] = Editor.nodes(editor, {
      match: n => !Editor.isEditor(n) && Element.isElement(n) && n.type === 'paragraph',
    });
    
    if (!match) {
      Transforms.insertNodes(editor, {
        type: 'paragraph',
        children: [{ text: '' }],
      });
    }
  }
};

/**
 * Update image properties (size, alignment, alt text)
 */
export const updateImageProperties = (
  editor: CustomEditor,
  path: Path,
  properties: Partial<Omit<ImageElement, 'type' | 'children'>>
): void => {
  Transforms.setNodes(
    editor,
    properties,
    { at: path }
  );
};

/**
 * Set image alignment (left, center, right)
 */
export const setImageAlignment = (
  editor: CustomEditor,
  path: Path,
  alignment: 'left' | 'center' | 'right'
): void => {
  updateImageProperties(editor, path, { alignment });
};

/**
 * Set image size (small, medium, large, full)
 */
export const setImageSize = (
  editor: CustomEditor,
  path: Path,
  size: 'small' | 'medium' | 'large' | 'full'
): void => {
  updateImageProperties(editor, path, { size });
};

/**
 * Basic check if a string could be an image URL
 */
const isImageUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Check if it's a URL by common patterns
  if (
    !url.startsWith('http://') && 
    !url.startsWith('https://') && 
    !url.startsWith('data:image/')
  ) {
    return false;
  }
  
  // Check for common image extensions
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
  const hasImageExtension = imageExtensions.some(ext => 
    url.toLowerCase().endsWith(ext)
  );
  
  // Return true for data URLs that contain image data or URLs with image extensions
  return url.startsWith('data:image/') || hasImageExtension;
};