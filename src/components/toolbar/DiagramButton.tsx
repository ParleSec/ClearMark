import React, { useState } from 'react';
import { useEditor } from '../../context/EditorContext';
import { insertDiagram } from '../editor/plugins/withDiagrams';

// Import styled button component
import ToolbarButton from './ToolbarButton';

const DiagramButton: React.FC = () => {
  const { editor } = useEditor();
  const [showModal, setShowModal] = useState(false);
  const [diagramType, setDiagramType] = useState('');
  const [diagramCode, setDiagramCode] = useState('');

  // Template examples for different diagram types
  const templates = {
    flowchart: `graph TD
    A[Start] --> B[Process]
    B --> C[Decision]
    C -->|Yes| D[Result 1]
    C -->|No| E[Result 2]`,
    sequence: `sequenceDiagram
    participant User
    participant System
    User->>System: Request
    System->>User: Response`,
    classDiagram: `classDiagram
    class Animal {
      +name: string
      +makeSound(): void
    }
    class Dog {
      +breed: string
      +bark(): void
    }
    Animal <|-- Dog`,
    erDiagram: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER {
        string name
        string email
    }
    ORDER {
        int orderNumber
        date created
    }
    LINE-ITEM {
        string product
        int quantity
        float price
    }`,
    pie: `pie title Distribution of Resources
    "Segment A (40%)" : 40
    "Segment B (30%)" : 30
    "Segment C (20%)" : 20
    "Segment D (10%)" : 10`,
  };

  // Set template based on type
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setDiagramType(newType);
    setDiagramCode(templates[newType as keyof typeof templates] || '');
  };

  // Insert diagram into editor
  const handleInsert = () => {
    if (diagramCode && diagramType) {
      insertDiagram(editor, diagramCode, diagramType);
      setShowModal(false);
      setDiagramCode('');
      setDiagramType('');
    }
  };
  
  // Reset state when closing modal
  const handleCloseModal = () => {
    setShowModal(false);
    setDiagramCode('');
    setDiagramType('');
  };

  // Diagram icon component
  const DiagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
      width="18" 
      height="18" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="8" y1="7" x2="12" y2="7" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="8" y1="17" x2="14" y2="17" />
    </svg>
  );

  return (
    <>
      <ToolbarButton
        icon={DiagramIcon}
        onClick={() => setShowModal(true)}
        title="Insert Diagram (Flowchart, ER, etc.)"
      />

      {/* Diagram insertion modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-3/4 max-w-3xl shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Insert Diagram</h2>
              <button 
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diagram Type
              </label>
              <select
                value={diagramType}
                onChange={handleTypeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="" disabled>Choose Diagram Type</option>
                <option value="flowchart">Flowchart</option>
                <option value="sequence">Sequence Diagram</option>
                <option value="classDiagram">Class Diagram</option>
                <option value="erDiagram">Entity Relationship Diagram</option>
                <option value="pie">Pie Chart</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diagram Code
              </label>
              <textarea
                value={diagramCode}
                onChange={(e) => setDiagramCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm min-h-[240px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={diagramType ? "Enter diagram code here..." : "Select a diagram type first"}
                disabled={!diagramType}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleInsert}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={!diagramCode || !diagramType}
              >
                Insert Diagram
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DiagramButton; 