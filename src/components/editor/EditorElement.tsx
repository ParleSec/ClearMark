import React from 'react';
import { RenderElementProps } from 'slate-react';
import { CustomElement } from '../../types/editor';
import { MarkdownElementType } from '../../types/markdown';

/**
 * Component to render different element types in the editor
 */
export const EditorElement: React.FC<RenderElementProps> = ({
  element,
  attributes,
  children,
}) => {
  const customElement = element as any;
  const style = customElement.align ? { textAlign: customElement.align } : {};

  // Render different elements based on type
  switch (customElement.type) {
    case 'paragraph':
      return (
        <p style={style} className="my-2 leading-relaxed" {...attributes}>
          {children}
        </p>
      );
    
    case MarkdownElementType.Heading1:
      return (
        <h1 style={style} className="text-3xl font-bold mt-6 mb-2 text-gray-900" {...attributes}>
          {children}
        </h1>
      );
    
    case MarkdownElementType.Heading2:
      return (
        <h2 style={style} className="text-2xl font-bold mt-5 mb-2 text-gray-800" {...attributes}>
          {children}
        </h2>
      );
    
    case MarkdownElementType.Heading3:
      return (
        <h3 style={style} className="text-xl font-bold mt-4 mb-2 text-gray-800" {...attributes}>
          {children}
        </h3>
      );
    
    case MarkdownElementType.BlockQuote:
      return (
        <blockquote style={style} className="border-l-4 border-gray-300 pl-4 italic my-4 text-gray-700" {...attributes}>
          {children}
        </blockquote>
      );
    
    case 'bulleted-list':
      return (
        <ul style={style} className="list-disc ml-6 my-2 text-gray-800" {...attributes}>
          {children}
        </ul>
      );
    
    case 'numbered-list':
      return (
        <ol style={style} className="list-decimal ml-6 my-2 text-gray-800" {...attributes}>
          {children}
        </ol>
      );
    
    case 'list-item':
      return (
        <li style={style} className="my-1" {...attributes}>
          {children}
        </li>
      );
    
    case 'image':
      const { url, alt } = element as any;
      return (
        <div style={style} {...attributes}>
          <div contentEditable={false} className="text-center my-4">
            <img 
              src={url} 
              alt={alt} 
              className="max-w-full h-auto rounded mx-auto"
            />
            {alt && (
              <p style={{ ...style, marginTop: '0.25rem', marginBottom: '0.25rem', fontSize: '0.875rem', color: 'gray' }}>{alt}</p>
            )}
          </div>
          {children}
        </div>
      );
    
    case 'link':
      const { url: linkUrl } = element as any;
      return (
        <a style={style} 
          href={linkUrl} 
          className="text-blue-500 hover:text-blue-700 underline" 
          {...attributes}
        >
          {children}
        </a>
      );
    
    case MarkdownElementType.Table:
      return (
        <table style={style} className="border-collapse border border-gray-300 w-full" {...attributes}>
          <tbody>{children}</tbody>
        </table>
      );
    
    case MarkdownElementType.TableRow:
      return (
        <tr style={style} {...attributes}>
          {children}
        </tr>
      );
    
    case MarkdownElementType.TableCell:
      return (
        <td style={style} className="border border-gray-300 p-2" {...attributes}>
          {children}
        </td>
      );
    
    // Add any other element types here
    
    default:
      // Default to paragraph for unknown types
      console.warn(`Unknown element type: ${customElement.type}`);
      return (
        <p style={style} className="my-2" {...attributes}>
          {children}
        </p>
      );
  }
};

export default EditorElement;