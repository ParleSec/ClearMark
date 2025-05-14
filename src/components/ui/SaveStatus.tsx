import React from 'react';
import { useEditorContext } from '../../context/EditorContext';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

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

const SaveStatus: React.FC = () => {
  const { saveStatus, lastSaved } = useEditorContext();

  if (saveStatus.isSaving) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Saving...</span>
      </div>
    );
  }

  if (saveStatus.lastError) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-500">
        <AlertCircle className="w-4 h-4" />
        <span>Save failed</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-500">
        <CheckCircle className="w-4 h-4" />
        <span>Saved {formatLastSaved(lastSaved)}</span>
      </div>
    );
  }

  return null;
};

export default SaveStatus; 