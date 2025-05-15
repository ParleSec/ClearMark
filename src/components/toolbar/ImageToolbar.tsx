import React, { useState, useRef, useEffect } from 'react';
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Minimize2, 
  Maximize2, 
  Image as ImageIcon,
  Sliders,
  RefreshCw,
  Sun,
  Contrast,
  PaintBucket,
  Droplet,
  EyeOff,
  Edit,
  Copy as CopyIcon,
  Maximize,
  Minimize,
  Trash2
} from 'lucide-react';
import { Editor, Path, Node, Range, Element as SlateElement, Transforms } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { CustomEditor, ImageElement } from '../../types/editor';
import { updateImageProperties } from '../editor/plugins/withImages';
import ToolbarButton from './ToolbarButton';

interface ImageToolbarProps {
  editor?: CustomEditor;
  element?: ImageElement;
  path?: Path;
  showControls?: 'all' | 'basic' | 'advanced';
  className?: string;
  isFloating?: boolean;
  mode?: 'inline' | 'floating';
}

/**
 * A toolbar for image formatting and enhancement that can be used inline or as a floating toolbar
 */
const ImageToolbar: React.FC<ImageToolbarProps> = ({ 
  editor: propEditor, 
  element: propElement, 
  path: propPath,
  showControls = 'all',
  className = '',
  isFloating = false,
  mode = 'inline'
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const editorFromContext = useSlate();
  const editor = propEditor || editorFromContext;
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    element: ImageElement;
    path: Path;
    domNode: HTMLElement | null;
  } | null>(null);
  
  // Expanded state for maximize/minimize
  const [isExpanded, setIsExpanded] = useState(false);
  // Alt text edit state
  const [editingAlt, setEditingAlt] = useState(false);
  const [altValue, setAltValue] = useState(propElement?.alt || '');
  
  // Use props if provided (inline mode) or find selected image (floating mode)
  const element = propElement || (selectedImage?.element);
  const path = propPath || (selectedImage?.path);
  
  // Update toolbar position and visibility when selection changes for floating mode
  useEffect(() => {
    if (mode !== 'floating') return;
    
    // Find if there's a selected image
    const { selection } = editor;
    
    if (!selection) {
      setSelectedImage(null);
      return;
    }
    
    try {
      // Try to find an image element at the current selection
      const [match] = Editor.nodes(editor, {
        match: n => 
          !Editor.isEditor(n) && 
          SlateElement.isElement(n) && 
          (n as any).type === 'image',
        at: selection
      });
      
      if (!match) {
        setSelectedImage(null);
        return;
      }
      
      const [element, path] = match;
      
      // Find the DOM node for positioning
      let domNode = null;
      try {
        domNode = ReactEditor.toDOMNode(editor, element);
      } catch (err) {
        console.error('Error finding DOM node:', err);
      }
      
      setSelectedImage({
        element: element as ImageElement,
        path,
        domNode
      });
    } catch (error) {
      console.error('Error finding selected image:', error);
      setSelectedImage(null);
    }
  }, [editor, mode]);
  
  // Position the toolbar when selectedImage changes
  useEffect(() => {
    if (mode !== 'floating' || !selectedImage || !selectedImage.domNode || !ref.current) {
      return;
    }
    
    // Get the image bounds
    const rect = selectedImage.domNode.getBoundingClientRect();
    
    // Position toolbar above the image
    ref.current.style.opacity = '1';
    ref.current.style.top = `${rect.top - ref.current.offsetHeight - 8 + window.scrollY}px`;
    ref.current.style.left = `${rect.left + rect.width / 2 - ref.current.offsetWidth / 2 + window.scrollX}px`;
  }, [selectedImage, mode]);
  
  // If floating mode and no image is selected, don't render
  if (mode === 'floating' && !selectedImage) {
    return null;
  }
  
  // If we don't have element or path, don't render
  if (!element || !path) {
    return null;
  }
  
  // Get current values
  const currentSize = element.size || 'medium';
  const currentAlignment = element.alignment || 'center';
  
  // Handlers for image properties
  const handleSizeChange = (size: 'small' | 'medium' | 'large' | 'full') => {
    updateImageProperties(editor, path, { size });
  };
  
  const handleAlignmentChange = (alignment: 'left' | 'center' | 'right') => {
    updateImageProperties(editor, path, { alignment });
  };
  
  const handleFilterChange = (filter: string) => {
    updateImageProperties(editor, path, { filter });
  };
  
  const handleAdjustment = (property: string, value: number) => {
    updateImageProperties(editor, path, { [property]: value });
  };
  
  const handleGrayscaleToggle = () => {
    updateImageProperties(editor, path, { grayscale: !element.grayscale });
  };
  
  const handleReset = () => {
    updateImageProperties(editor, path, {
      filter: undefined,
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      grayscale: false
    });
  };
  
  // Handlers for actions
  const handleEditAlt = () => {
    setEditingAlt(true);
    setAltValue(element.alt || '');
  };
  const handleSaveAlt = () => {
    updateImageProperties(editor, path, { alt: altValue });
    setEditingAlt(false);
  };
  const handleCopyUrl = () => {
    if (element.url) {
      navigator.clipboard.writeText(element.url);
    }
  };
  const handleToggleExpand = () => {
    setIsExpanded(exp => !exp);
  };
  const handleDelete = () => {
    Transforms.removeNodes(editor, { at: path });
  };
  
  // Only show controls as configured
  const showBasicControls = showControls === 'all' || showControls === 'basic';
  const showAdvancedControls = (showControls === 'all' && showAdvanced) || showControls === 'advanced';
  
  // Container classes based on whether it's floating or inline
  const containerClasses = mode === 'floating'
    ? `absolute z-50 bg-white shadow-lg border border-gray-200 rounded p-2 ${className}`
    : `bg-white border border-gray-100 rounded p-2 ${className}`;
    
  // Creating the toolbar content
  const toolbarContent = (
    <div className={containerClasses + " p-0 bg-gray-50 border border-gray-200 rounded-lg shadow-sm"} onMouseDown={e => e.preventDefault()}>
      {/* Header with title and actions */}
      <div className="bg-gray-50 border-b px-3 py-2 flex items-center space-x-2 rounded-t-lg">
        <ImageIcon size={16} className="text-blue-500" />
        <span className="font-medium text-gray-700 text-sm">Image Tools</span>
        {/* Alt text and edit group */}
        <div className="flex items-center space-x-1 ml-2">
          {editingAlt ? (
            <input
              type="text"
              value={altValue}
              onChange={e => setAltValue(e.target.value)}
              onBlur={handleSaveAlt}
              onKeyDown={e => { if (e.key === 'Enter') handleSaveAlt(); if (e.key === 'Escape') setEditingAlt(false); }}
              className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Alt text"
              autoFocus
            />
          ) : (
            <span className="text-xs text-gray-500 cursor-pointer hover:underline" title="Edit alt text" onClick={handleEditAlt}>
              {element.alt ? `Alt: ${element.alt}` : 'Add alt text'}
            </span>
          )}
          <button className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded" title="Edit Alt Text" onClick={handleEditAlt}><Edit size={16} /></button>
        </div>
        {/* Divider */}
        <div className="h-5 w-px bg-gray-200 mx-2" />
        {/* Copy, delete, advanced group */}
        <div className="flex items-center space-x-1">
          <button className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded" title="Copy Image URL" onClick={handleCopyUrl}><CopyIcon size={16} /></button>
          <button className="p-1 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded" title="Delete Image" onClick={handleDelete}><Trash2 size={16} /></button>
          {showControls === 'all' && (
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none text-xs flex items-center transition-colors duration-200 px-2 py-1 rounded border border-gray-200 bg-white ml-2"
            >
              <Sliders size={14} className="mr-1" />
              {showAdvanced ? 'Basic' : 'Advanced'}
            </button>
          )}
        </div>
      </div>
      {/* Advanced controls (size and alignment) */}
      {showAdvanced && (
        <div className="flex flex-wrap gap-2 p-3 border-t bg-white rounded-b-lg">
          {/* Size controls */}
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-500 mr-1">Size:</span>
            <ToolbarButton
              icon={() => <Minimize2 size={16} />}
              onClick={() => handleSizeChange('small')}
              isActive={currentSize === 'small'}
              title="Small"
            />
            <ToolbarButton
              icon={() => <Minimize2 size={18} />}
              onClick={() => handleSizeChange('medium')}
              isActive={currentSize === 'medium'}
              title="Medium"
            />
            <ToolbarButton
              icon={() => <Maximize2 size={18} />}
              onClick={() => handleSizeChange('large')}
              isActive={currentSize === 'large'}
              title="Large"
            />
            <ToolbarButton
              icon={() => <Maximize2 size={20} />}
              onClick={() => handleSizeChange('full')}
              isActive={currentSize === 'full'}
              title="Full width"
            />
          </div>
          {/* Alignment controls */}
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-500 mr-1">Align:</span>
            <ToolbarButton
              icon={AlignLeft}
              onClick={() => handleAlignmentChange('left')}
              isActive={currentAlignment === 'left'}
              title="Align left"
            />
            <ToolbarButton
              icon={AlignCenter}
              onClick={() => handleAlignmentChange('center')}
              isActive={currentAlignment === 'center'}
              title="Align center"
            />
            <ToolbarButton
              icon={AlignRight}
              onClick={() => handleAlignmentChange('right')}
              isActive={currentAlignment === 'right'}
              title="Align right"
            />
          </div>
        </div>
      )}
    </div>
  );
  
  // For floating mode, wrap in positioned container
  if (mode === 'floating') {
    return (
      <div 
        ref={ref}
        className="absolute -top-10000 -left-10000 opacity-0 z-50"
        style={{ transition: 'opacity 0.2s' }}
      >
        {toolbarContent}
      </div>
    );
  }
  
  // For inline mode, just return the toolbar content
  return toolbarContent;
};

// Export the component
export default ImageToolbar;

/**
 * Image styling utilities - moved from image-helper.ts
 */

/**
 * Generate CSS filter style based on image properties
 */
export const generateImageFilterStyle = (element: ImageElement): React.CSSProperties => {
  const { filter, brightness, contrast, saturation, blur, grayscale } = element;
  const filters = [];
  
  // Apply adjustment filters if they differ from default values
  if (brightness !== undefined && brightness !== 100) {
    filters.push(`brightness(${brightness / 100})`);
  }
  
  if (contrast !== undefined && contrast !== 100) {
    filters.push(`contrast(${contrast / 100})`);
  }
  
  if (saturation !== undefined && saturation !== 100) {
    filters.push(`saturate(${saturation / 100})`);
  }
  
  if (blur !== undefined && blur > 0) {
    filters.push(`blur(${blur / 10}px)`);
  }
  
  if (grayscale) {
    filters.push('grayscale(1)');
  }
  
  // Apply preset filters
  if (filter) {
    switch (filter) {
      case 'warm':
        filters.push('sepia(0.3)');
        break;
      case 'cool':
        filters.push('hue-rotate(30deg)');
        break;
      case 'vivid':
        filters.push('saturate(1.5)');
        break;
      case 'muted':
        filters.push('saturate(0.7)');
        break;
      case 'vintage':
        filters.push('sepia(0.5) hue-rotate(-30deg)');
        break;
    }
  }
  
  return filters.length ? { filter: filters.join(' ') } : {};
};

/**
 * Get size class for an image based on size property
 */
export const getImageSizeClass = (size?: 'small' | 'medium' | 'large' | 'full'): string => {
  switch (size) {
    case 'small': return 'max-w-xs';
    case 'medium': return 'max-w-md';
    case 'large': return 'max-w-lg';
    case 'full': return 'w-full';
    default: return 'max-w-md';
  }
};

/**
 * Get alignment class for an image based on alignment property
 */
export const getImageAlignmentClass = (alignment?: 'left' | 'center' | 'right'): string => {
  switch (alignment) {
    case 'left': return 'ml-0 mr-auto';
    case 'center': return 'mx-auto';
    case 'right': return 'ml-auto mr-0';
    default: return 'mx-auto';
  }
};

/**
 * Get a standard transition style for smooth image updates
 */
export const getImageTransitionStyle = (): React.CSSProperties => {
  return {
    transition: 'all 0.3s ease-in-out'
  };
}; 