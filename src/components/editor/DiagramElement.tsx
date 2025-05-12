import React, { useEffect, useRef, useState } from 'react';
import { Transforms } from 'slate';
import { RenderElementProps } from 'slate-react';
import { useSlate, ReactEditor } from 'slate-react';
import { Edit, Maximize, Minimize, Copy, Trash2, AlertTriangle } from 'lucide-react';
import mermaid from 'mermaid';
import { DiagramElement as DiagramElementType } from '../../types/editor';
import DiagramEditor from './DiagramEditor';

// Try to log mermaid version and configurations
console.log('Mermaid library loaded:', typeof mermaid);
try {
  // Minimal initialization with just the essential options
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
  });
  console.log('Mermaid initialized successfully');
} catch (error) {
  console.error('Failed to initialize mermaid:', error);
}

// Simplified component with minimal moving parts
const MermaidDiagram: React.FC<{ code: string }> = ({ code }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showError, setShowError] = useState(false);
  const [showCode, setShowCode] = useState(false);
  
  // Clean diagram code - remove duplicate prefixes
  const cleanCode = code.trim().replace(/^flowchart flowchart/, 'flowchart');
  
  // Render the diagram - use a much simpler approach
  useEffect(() => {
    console.log('Diagram effect running with code:', cleanCode);
    
    // Clear timeout on unmount
    const timeoutId = setTimeout(() => {
      if (!containerRef.current) {
        console.error('Container ref is null - cannot render diagram');
        setShowError(true);
        return;
      }
      
      try {
        // Clear any previous content
        containerRef.current.innerHTML = '';
        console.log('Container cleared, preparing to render');
        
        // Create the mermaid element
        const id = `diagram-${Date.now()}`;
        const mermaidEl = document.createElement('div');
        mermaidEl.className = 'mermaid';
        mermaidEl.textContent = cleanCode;
        mermaidEl.id = id;
        
        // Add to container
        containerRef.current.appendChild(mermaidEl);
        console.log('Mermaid element created with ID:', id);
        
        // Force browser reflow
        window.getComputedStyle(mermaidEl).display;
        console.log('Forced reflow');
        
        // Try rendering after container is ready
        setTimeout(() => {
          try {
            console.log('Running mermaid.run() on element:', id);
            mermaid.run({
              nodes: [mermaidEl],
              suppressErrors: false
            }).then(() => {
              console.log('Mermaid render succeeded!');
              setShowError(false);
            }).catch(err => {
              console.error('Mermaid.run() promise rejected:', err);
              setShowError(true);
              setShowCode(true);
            });
          } catch (runError) {
            console.error('Exception during mermaid.run():', runError);
            setShowError(true);
            setShowCode(true);
          }
        }, 500); // Longer delay to ensure DOM is ready
      } catch (err) {
        console.error('Error in diagram rendering effect:', err);
        setShowError(true);
        setShowCode(true);
      }
    }, 500); // Delay initial setup too
    
    return () => clearTimeout(timeoutId);
  }, [cleanCode]);
  
  // If there was an error, show both the error and the diagram container
  // The diagram might still render even with an error
  return (
    <div className="w-full">
      {showError && (
        <div className="mb-4 p-2 bg-red-50 text-red-500 rounded flex items-center">
          <AlertTriangle size={16} className="mr-2" />
          <span>There was a problem rendering the diagram.</span>
        </div>
      )}
      
      <div ref={containerRef} className="w-full py-2" />
      
      {showCode && showError && (
        <pre className="mt-4 p-3 bg-gray-100 overflow-auto rounded text-xs">
          <code>{cleanCode}</code>
        </pre>
      )}
    </div>
  );
};

/**
 * A streamlined diagram component for the editor
 */
const DiagramElement: React.FC<RenderElementProps> = ({ attributes, children, element }) => {
  const editor = useSlate();
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  
  // Cast element to DiagramElementType
  const typedElement = element as DiagramElementType;
  
  // Extract diagram properties
  const diagramType = typedElement.diagramType || 'flowchart';
  const diagramCode = typedElement.code || '';

  // Handle diagram edit
  const handleEditDiagram = (): void => {
    setShowEditor(true);
  };
  
  // Handle diagram update
  const handleUpdateDiagram = (code: string, type: string): void => {
    try {
      // Get the path to the current diagram element
      const path = ReactEditor.findPath(editor, element);
      
      // Update the diagram at this path
      editor.updateDiagram(path, code, type);
    } catch (err) {
      console.error('Error updating diagram:', err);
    }
  };

  // Handle diagram deletion
  const handleDeleteDiagram = (): void => {
    try {
      // Don't use the editor.removeNodes (which could be recursive)
      // Instead use Transforms directly
      const path = ReactEditor.findPath(editor, element);
      Transforms.removeNodes(editor, { at: path });
    } catch (err) {
      console.error('Error deleting diagram:', err);
    }
  };

  // Get title based on diagram type
  const getDiagramTitle = (): string => {
    const titles: Record<string, string> = {
      'flowchart': 'Flow Chart',
      'sequence': 'Sequence Diagram',
      'pie': 'Pie Chart',
      'class': 'Class Diagram',
      'er': 'ER Diagram',
      'gantt': 'Gantt Chart'
    };
    
    return titles[diagramType] || 'Diagram';
  };

  return (
    <div {...attributes} className="py-2 my-4 select-none">
      <div contentEditable={false} className="relative">
        {/* Diagram container */}
        <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
          {/* Diagram header */}
          <div className="bg-gray-50 border-b px-3 py-2 flex justify-between items-center">
            <span className="font-medium text-gray-700 text-sm">{getDiagramTitle()}</span>
            
            <div className="flex items-center space-x-1">
              <button 
                className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded"
                onClick={handleEditDiagram}
                aria-label="Edit diagram"
                title="Edit diagram"
              >
                <Edit size={16} />
              </button>
              
              <button 
                className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded copy-button"
                onClick={() => navigator.clipboard.writeText(diagramCode)}
                aria-label="Copy diagram code"
                title="Copy diagram code"
              >
                <Copy size={16} />
              </button>
              
              <button 
                className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label={isExpanded ? "Minimize diagram" : "Expand diagram"}
                title={isExpanded ? "Minimize" : "Expand"}
              >
                {isExpanded ? <Minimize size={16} /> : <Maximize size={16} />}
              </button>
              
              <button 
                className="p-1 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded"
                onClick={handleDeleteDiagram}
                aria-label="Delete diagram"
                title="Delete diagram"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          
          {/* Diagram content */}
          <div 
            className={`diagram-container p-4 bg-white flex items-center justify-center ${
              isExpanded ? 'h-[calc(100vh-10rem)] overflow-auto' : 'max-h-[500px] overflow-auto'
            }`}
          >
            <MermaidDiagram code={diagramCode} />
          </div>
        </div>
        
        {/* Diagram editor modal */}
        <DiagramEditor
          isOpen={showEditor}
          onClose={() => setShowEditor(false)}
          editor={editor}
          diagramType={diagramType}
          diagramCode={diagramCode}
          onSave={handleUpdateDiagram}
        />
      </div>
      {children}
    </div>
  );
};

export default DiagramElement;