import React from 'react';
import { Clock } from 'lucide-react';
import { useEditorContext } from '../../context/EditorContext';

/**
 * Status bar component showing word count and reading time
 */
const StatusBar: React.FC = () => {
  const { wordCount, readingTime, focusMode } = useEditorContext();
  
  return (
    <div 
      className={`border-t p-2 flex justify-between items-center text-sm text-gray-500 bg-white
        ${focusMode ? 'opacity-0 hover:opacity-100 transition-opacity' : ''}`}
    >
      <div>
        {wordCount} {wordCount === 1 ? 'word' : 'words'}
      </div>
      <div className="flex items-center">
        <Clock size={14} className="mr-1" />
        {readingTime} {readingTime === 1 ? 'minute' : 'minutes'} to read
      </div>
    </div>
  );
};

export default StatusBar;