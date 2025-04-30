import React, { useMemo } from 'react';
import { useEditorContext } from '../../context/EditorContext';
import { generateMarkdownOutput } from '../../utils/markdown';

/**
 * Component for showing markdown preview alongside the editor
 */
const MarkdownPreview: React.FC = () => {
  const { editorState, metadata } = useEditorContext();
  
  // Generate the markdown text with front matter
  const markdownText = useMemo(() => {
    const { content } = generateMarkdownOutput(editorState, metadata, {
      includeFormatting: true,
      includeFrontMatter: true
    });
    return content;
  }, [editorState, metadata]);
  
  return (
    <div className="w-1/2 border-l h-full bg-gray-50 overflow-auto">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">
          Markdown Preview
        </h2>
        
        <pre className="font-mono text-sm whitespace-pre-wrap bg-white p-4 rounded-md border border-gray-200 overflow-auto">
          {markdownText}
        </pre>
      </div>
    </div>
  );
};

export default MarkdownPreview;