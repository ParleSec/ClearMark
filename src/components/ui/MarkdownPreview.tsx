import React, { useMemo } from 'react';
import { useEditorContext } from '../../context/EditorContext';
import { generateMarkdownOutput } from '../../utils/markdown';

/**
 * Component for showing markdown preview alongside the editor
 * Updated with fluid, water-inspired styling
 */
const MarkdownPreview: React.FC = () => {
  const { editorState, metadata, darkMode } = useEditorContext();
  
  // Generate the markdown text with front matter
  const markdownText = useMemo(() => {
    const { content } = generateMarkdownOutput(editorState, metadata, {
      includeFormatting: true,
      includeFrontMatter: true
    });
    return content;
  }, [editorState, metadata]);
  
  return (
    <div className="w-full md:w-1/2 border-t md:border-t-0 md:border-l h-full bg-gradient-to-br from-slate-50 to-sky-50/30 dark:from-slate-900 dark:to-sky-950/30 overflow-auto border-slate-200/70 dark:border-slate-800/70">
      <div className="p-3 sm:p-4 md:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center">
          <span className="bg-gradient-to-r from-sky-500 to-cyan-600 dark:from-sky-400 dark:to-cyan-500 h-5 w-1 rounded-r mr-2 opacity-80"></span>
          Markdown Preview
        </h2>
        
        <pre className="font-mono text-xs sm:text-sm whitespace-pre-wrap bg-white/90 dark:bg-slate-950/80 p-3 sm:p-4 rounded-[0.35rem] border border-t-slate-100 border-x-slate-200 border-b-sky-200 dark:border-t-slate-800 dark:border-x-slate-800 dark:border-b-sky-900 overflow-auto backdrop-blur-[1px] shadow-[0_2px_6px_rgba(14,165,233,0.07)]"
          style={{
            borderTopLeftRadius: '0.4rem',
            borderTopRightRadius: '0.3rem',
            borderBottomLeftRadius: '0.3rem',
            borderBottomRightRadius: '0.5rem',
          }}>
          <code className="text-slate-800 dark:text-slate-200 leading-relaxed">
            {markdownText}
          </code>
        </pre>
      </div>
    </div>
  );
};

export default MarkdownPreview;