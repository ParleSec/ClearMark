import React from 'react';
import { useEditorContext } from '../../context/EditorContext';
import { CheckCircle, AlertCircle, Loader2, CloudOff, Cloud } from 'lucide-react';

// Format the last saved timestamp
const formatLastSaved = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // Less than a minute ago
  if (diff < 60000) {
    return 'just now';
  }
  
  // Less than an hour ago
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }
  
  // Less than a day ago
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }
  
  // Otherwise show the date
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

/**
 * Displays the current save status with fluid design aesthetics
 */
const SaveStatus: React.FC = () => {
  const { saveStatus, lastSaved } = useEditorContext();

  if (saveStatus.isSaving) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200 transition-all duration-300">
        <div className="relative">
          <Loader2 className="w-4 h-4 animate-spin text-flow-600 dark:text-flow-300" />
          <span className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-flow-500 rounded-full animate-pulse" />
        </div>
        <span className="text-flow-700 dark:text-flow-300 font-medium">Saving changes...</span>
      </div>
    );
  }

  if (saveStatus.lastError) {
    // Handle the error message safely
    const errorMessage = saveStatus.lastError instanceof Error 
      ? saveStatus.lastError.message 
      : String(saveStatus.lastError);
    
    const shortenedError = errorMessage.length > 50 
      ? errorMessage.substring(0, 50) + '...' 
      : errorMessage;

    return (
      <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 px-2.5 py-1.5 rounded-fluid transition-all duration-300">
        <CloudOff className="w-4 h-4" />
        <span className="font-medium">Save failed - {shortenedError}</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200 group transition-all duration-300 hover:text-flow-700 dark:hover:text-flow-300">
        <Cloud className="w-4 h-4 text-flow-600 dark:text-flow-300 transition-all duration-200 group-hover:scale-110" />
        <span>
          <span className="text-flow-700 dark:text-flow-300 font-medium">Saved</span> {formatLastSaved(lastSaved)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 opacity-80">
      <Cloud className="w-4 h-4" />
      <span>Not saved yet</span>
    </div>
  );
};

export default SaveStatus; 