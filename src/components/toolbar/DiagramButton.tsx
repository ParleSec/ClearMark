import React, { useState } from 'react';
import { useEditor } from '../../context/EditorContext';
import ToolbarButton from './ToolbarButton';
import { DialogModal } from '../ui/Modal';
import { DiagramTemplate, getTemplatesByType } from '../../data/diagramTemplates';

// Custom diagram icon component
const DiagramIcon = (props: React.SVGProps<SVGSVGElement>): JSX.Element => (
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
    <line x1="8" y1="7" x2="16" y2="7" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="8" y1="17" x2="16" y2="17" />
  </svg>
);

/**
 * Improved DiagramButton component for inserting diagrams
 * Uses a simplified dialog modal for better user experience
 */
const DiagramButton: React.FC = () => {
  const { insertDiagram } = useEditor();
  const [showModal, setShowModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState('flowchart');
  const [templates, setTemplates] = useState<DiagramTemplate[]>(getTemplatesByType('flowchart'));
  
  // Open the modal
  const handleOpenModal = () => {
    setShowModal(true);
    setActiveCategory('flowchart');
    setTemplates(getTemplatesByType('flowchart'));
  };
  
  // Close the modal
  const handleCloseModal = () => {
    setShowModal(false);
  };
  
  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setTemplates(getTemplatesByType(category));
  };
  
  // Handle diagram template insertion
  const handleInsertDiagram = (template: DiagramTemplate) => {
    console.log('Inserting diagram:', template.type, template.code);
    
    // Use the context method directly with both parameters
    insertDiagram(template.code, template.type);
    
    // Close the modal
    handleCloseModal();
  };
  
  // Diagram category options
  const categories = [
    { id: 'flowchart', name: 'Flow Chart' },
    { id: 'sequence', name: 'Sequence' },
    { id: 'pie', name: 'Pie Chart' },
    { id: 'class', name: 'Class Diagram' },
    { id: 'er', name: 'ER Diagram' },
    { id: 'gantt', name: 'Gantt Chart' },
  ];

  return (
    <>
      <ToolbarButton 
        icon={DiagramIcon}
        onClick={handleOpenModal}
        title="Insert diagram"
      />
      
      <DialogModal
        isOpen={showModal}
        onClose={handleCloseModal}
        title="Insert Diagram"
        maxWidth="lg"
      >
        <div className="p-4">
          {/* Categories tabs */}
          <div className="mb-4 border-b border-gray-200">
            <div className="flex flex-wrap -mb-px">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`mr-4 py-2 px-1 ${
                    activeCategory === category.id
                      ? 'border-b-2 border-indigo-500 text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } font-medium text-sm`}
                  onClick={() => handleCategoryChange(category.id)}
                  type="button"
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Templates grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {templates.map(template => (
              <div
                key={template.id}
                className="cursor-pointer border rounded-lg p-4 hover:border-indigo-500 
                  hover:shadow-sm transition-all bg-white"
              >
                <h3 className="font-medium text-gray-900 mb-1">{template.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{template.description}</p>
                <div className="bg-gray-50 border border-gray-100 rounded p-2 text-xs font-mono 
                  overflow-hidden max-h-36 text-gray-600">
                  {template.code.split('\n').slice(0, 5).join('\n')}
                  {template.code.split('\n').length > 5 && '...'}
                </div>
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleInsertDiagram(template)}
                    className="w-full py-2 bg-indigo-600 text-white text-sm font-medium rounded
                      hover:bg-indigo-700 transition-colors"
                    type="button"
                  >
                    Insert Diagram
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Info section */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
            <h4 className="font-medium mb-2">About {
              activeCategory === 'flowchart' ? 'Flow Charts' :
              activeCategory === 'sequence' ? 'Sequence Diagrams' :
              activeCategory === 'pie' ? 'Pie Charts' :
              activeCategory === 'class' ? 'Class Diagrams' :
              activeCategory === 'er' ? 'ER Diagrams' :
              'Gantt Charts'
            }</h4>
            <p>
              {activeCategory === 'flowchart' && 
                "Flow charts visualize processes and workflows, with decision points and steps. Great for showing algorithms or procedures."}
              {activeCategory === 'sequence' && 
                "Sequence diagrams display how objects interact over time. Perfect for showing message exchanges between components."}
              {activeCategory === 'pie' && 
                "Pie charts show proportions of a whole. Ideal for percentage breakdowns and distributions."}
              {activeCategory === 'class' && 
                "Class diagrams illustrate the structure of object-oriented systems, showing classes and their relationships."}
              {activeCategory === 'er' && 
                "Entity Relationship diagrams visualize data models and database schemas, showing entities and relationships."}
              {activeCategory === 'gantt' && 
                "Gantt charts represent project schedules, showing tasks, durations, and dependencies over time."}
            </p>
          </div>
        </div>
      </DialogModal>
    </>
  );
};

export default DiagramButton;