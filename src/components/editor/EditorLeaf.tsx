import React from 'react';
import { RenderLeafProps } from 'slate-react';
import { CustomText } from '../../types/editor';

interface EditorLeafProps extends RenderLeafProps {
  leaf: CustomText;
}

/**
 * Component for rendering Slate text leaves with formatting
 */
export const EditorLeaf: React.FC<EditorLeafProps> = ({ attributes, children, leaf }) => {
  let formattedChildren = children;
  
  // Apply text formatting in a specific order
  // (ensuring nested formatting works correctly)
  
  if (leaf.bold) {
    formattedChildren = <strong>{formattedChildren}</strong>;
  }
  
  if (leaf.italic) {
    formattedChildren = <em>{formattedChildren}</em>;
  }
  
  if (leaf.code) {
    formattedChildren = (
      <code className="bg-gray-100 px-1 font-mono rounded">
        {formattedChildren}
      </code>
    );
  }
  
  return <span {...attributes}>{formattedChildren}</span>;
};

export default EditorLeaf;