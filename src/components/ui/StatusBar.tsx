import React from 'react';
import { Clock, DropletIcon } from 'lucide-react';
import { useEditorContext } from '../../context/EditorContext';

/**
 * Status bar component showing word count and reading time
 * with fluid design aesthetics
 */
const StatusBar: React.FC = () => {
  const { wordCount, readingTime, focusMode } = useEditorContext();
  
  return (
    <div 
      className={`
        border-t border-flow-100 dark:border-slate-800 
        p-2.5 flex justify-between items-center
        text-sm text-slate-700 dark:text-slate-300
        bg-gradient-to-r from-white to-flow-50 dark:from-slate-900 dark:to-slate-800
        transition-all duration-300 ease-in-out
        ${focusMode ? 'opacity-0 translate-y-2 hover:opacity-90 hover:translate-y-0' : ''}
      `}
    >
      <div className="flex items-center">
        <DropletIcon size={14} className="mr-1.5 text-flow-600 dark:text-flow-300" />
        <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
      </div>
      
      <div className="h-4 w-px bg-flow-200 dark:bg-slate-700 mx-4 opacity-50" />
      
      <div className="flex items-center">
        <Clock size={14} className="mr-1.5 text-flow-600 dark:text-flow-300" />
        <span>{readingTime} {readingTime === 1 ? 'minute' : 'minutes'} to read</span>
      </div>
    </div>
  );
};

export default StatusBar;