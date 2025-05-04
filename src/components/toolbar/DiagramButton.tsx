import React, { useState } from 'react';
import { useEditor } from '../../context/EditorContext';
import { insertDiagram } from '../editor/plugins/withDiagrams';

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

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="toolbar-button"
        title="Insert Diagram"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      </button>

      {/* Diagram insertion modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-3/4 max-w-3xl">
            <h2 className="text-xl font-bold mb-4">Insert Diagram</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diagram Type
              </label>
              <select
                value={diagramType}
                onChange={handleTypeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="" disabled>Choose Diagram</option>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                rows={10}
                placeholder={diagramType ? "Enter diagram code here..." : "Select a diagram type first"}
                disabled={!diagramType}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleInsert}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
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