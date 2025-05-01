import React from 'react';
import { useEditor } from '../../context/EditorContext';
import { Button } from '../ui/Button';
import { Table, Plus, Minus } from 'lucide-react';

export const TableToolbar: React.FC = () => {
  const { 
    insertTable, 
    insertRow, 
    insertColumn, 
    deleteRow, 
    deleteColumn, 
    isTableActive 
  } = useEditor();

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => insertTable()}
        title="Insert Table"
      >
        <Table className="h-4 w-4" />
      </Button>
      
      {isTableActive() && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={insertRow}
            title="Insert Row"
          >
            <Plus className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={insertColumn}
            title="Insert Column"
          >
            <Plus className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={deleteRow}
            title="Delete Row"
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={deleteColumn}
            title="Delete Column"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}; 