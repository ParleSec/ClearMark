import React from 'react';
import { useEditorContext } from '../../context/EditorContext';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

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

function formatLastSaved(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  }

  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }

  return date.toLocaleDateString();
}

export default SaveStatus; 