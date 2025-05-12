import React, { useState, useEffect, useRef } from 'react';
import { CustomEditor } from '../../types/editor';
import { DialogModal } from '../ui/Modal';
import { getSelectedDiagram } from './plugins/withDiagrams';
import { DiagramTemplate, DIAGRAM_TEMPLATES } from '../../data/diagramTemplates';

interface DiagramEditorProps {
  isOpen: boolean;
  onClose: () => void;
  editor: CustomEditor;
  diagramType: string;
  diagramCode: string;
  onSave: (code: string, type: string) => void;
}

const DiagramEditor: React.FC<DiagramEditorProps> = ({
  isOpen,
  onClose,
  editor,
  diagramType,
  diagramCode,
  onSave,
}) => {
  const [code, setCode] = useState(diagramCode);
  const [currentType, setCurrentType] = useState(diagramType);
  const [templates, setTemplates] = useState<DiagramTemplate[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize the editor state when opened
  useEffect(() => {
    if (isOpen) {
      setCode(diagramCode);
      setCurrentType(diagramType);
      
      // Filter templates based on diagram type
      const filteredTemplates = DIAGRAM_TEMPLATES.filter((t: DiagramTemplate) => t.type === diagramType);
      setTemplates(filteredTemplates);
      
      // Focus the textarea with a slight delay to ensure modal is rendered
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen, diagramCode, diagramType]);

  // Handle saving changes
  const handleSave = () => {
    onSave(code, currentType);
    onClose();
  };

  // Handle type change
  const handleTypeChange = (type: string) => {
    setCurrentType(type);
    
    // Update templates for the new type
    const filteredTemplates = DIAGRAM_TEMPLATES.filter((t: DiagramTemplate) => t.type === type);
    setTemplates(filteredTemplates);
  };

  // Apply a template
  const applyTemplate = (template: DiagramTemplate) => {
    setCode(template.code);
    setCurrentType(template.type);
  };

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Diagram"
      maxWidth="lg"
    >
      <div className="flex flex-col md:flex-row min-h-[500px]">
        {/* Left side - Code editor */}
        <div className="flex-1 border-r border-gray-200 p-4">
          <div className="mb-3">
            <label htmlFor="diagram-type" className="block text-sm font-medium text-gray-700 mb-1">
              Diagram Type
            </label>
            <select
              id="diagram-type"
              value={currentType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 
                focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              <option value="flowchart">Flow Chart</option>
              <option value="sequence">Sequence Diagram</option>
              <option value="pie">Pie Chart</option>
              <option value="class">Class Diagram</option>
              <option value="er">ER Diagram</option>
              <option value="gantt">Gantt Chart</option>
            </select>
          </div>

          <div className="flex-1">
            <label htmlFor="diagram-code" className="block text-sm font-medium text-gray-700 mb-1">
              Diagram Code
            </label>
            <textarea
              ref={textareaRef}
              id="diagram-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-[calc(100%-2rem)] min-h-[300px] font-mono border border-gray-300 
                rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 
                focus:border-indigo-500 text-sm"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right side - Templates */}
        <div className="w-full md:w-[350px] p-4 bg-gray-50">
          <h3 className="font-medium text-gray-900 mb-3">Templates</h3>
          
          <div className="space-y-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className="cursor-pointer border rounded-lg p-3 bg-white hover:border-indigo-500 
                  hover:shadow-sm transition-all"
                onClick={() => applyTemplate(template)}
              >
                <h4 className="font-medium text-gray-900 text-sm mb-1">{template.name}</h4>
                <p className="text-xs text-gray-500 mb-2">{template.description}</p>
                <div className="bg-gray-50 border border-gray-100 rounded p-2 text-xs font-mono 
                  overflow-hidden max-h-24 text-gray-600">
                  {template.code.split('\n').slice(0, 4).join('\n')}
                  {template.code.split('\n').length > 4 && '...'}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Tips</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Use <code className="bg-gray-100 px-1 rounded">{"-->"}</code> for arrows in flowcharts</li>
              <li>• Use <code className="bg-gray-100 px-1 rounded">[Text]</code> for process nodes</li>
              <li>• Use <code className="bg-gray-100 px-1 rounded">&#123;Yes/No&#125;</code> for decision nodes</li>
              <li>• <a href="https://mermaid.js.org/syntax/flowchart.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Mermaid.js Syntax Documentation</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium 
            rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 
            focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium 
            rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 
            focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Diagram
        </button>
      </div>
    </DialogModal>
  );
};

export default DiagramEditor; 