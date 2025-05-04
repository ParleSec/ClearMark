import React, { useEffect, useRef, useState } from 'react';
import { RenderElementProps } from 'slate-react';
import mermaid from 'mermaid';

// Initialize mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
  flowchart: { 
    htmlLabels: true,
    curve: 'basis'
  },
  pie: {
    useWidth: 800,
    textPosition: 0.75
  },
  themeVariables: {
    // Ensure text has good contrast
    primaryTextColor: '#212121',
    // Use vibrant but accessible colors
    primaryColor: '#5a9bd5',
    secondaryColor: '#7ac36a',
    tertiaryColor: '#faa75b',
    // Colors for charts
    pie1: '#5b9bd5',
    pie2: '#ed7d31',
    pie3: '#a5a5a5',
    pie4: '#ffc000',
    pie5: '#4472c4',
    pie6: '#70ad47',
    pie7: '#255e91',
    pie8: '#9e480e'
  }
});

// Unique ID generator for diagrams
const uniqueId = () => `diagram-${Math.random().toString(36).substr(2, 9)}`;

const DiagramElement: React.FC<RenderElementProps> = ({ attributes, children, element }) => {
  const diagramRef = useRef<HTMLDivElement>(null);
  const [diagramId] = useState(uniqueId());
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [code, setCode] = useState((element as any).code || '');
  
  // Function to render the diagram
  const renderDiagram = () => {
    if (!diagramRef.current) return;
    
    try {
      setError(null);
      // Clear previous diagram
      diagramRef.current.innerHTML = '';
      
      // Create diagram with current code
      mermaid.render(diagramId, code)
        .then(({ svg }) => {
          if (diagramRef.current) {
            diagramRef.current.innerHTML = svg;
            
            // Apply custom styling to SVG
            if (diagramRef.current.firstChild) {
              enhanceSvgStyles(diagramRef.current.firstChild as HTMLElement);
            }
          }
        })
        .catch((err) => {
          console.error('Mermaid rendering error:', err);
          setError('Error rendering diagram. Check your syntax.');
        });
    } catch (err) {
      console.error('Mermaid error:', err);
      setError('Error rendering diagram. Check your syntax.');
    }
  };
  
  // Render diagram when component mounts or code changes
  useEffect(() => {
    // Use a short timeout to ensure the DOM is ready
    const timer = setTimeout(() => {
      renderDiagram();
    }, 10);
    
    return () => clearTimeout(timer);
  }, [diagramId, code, isEditing]);
  
  // Force re-render when component mounts
  useEffect(() => {
    renderDiagram();
  }, []);
  
  // Add custom styling to SVG after rendering
  const enhanceSvgStyles = (svgElement: HTMLElement) => {
    // Ensure all text is readable but preserve intentional colors
    const textElements = svgElement.querySelectorAll('text');
    textElements.forEach(text => {
      const currentColor = text.style.fill || text.getAttribute('fill');
      // Only change text color if it's too light or not set
      if (!currentColor || 
          currentColor === 'white' || 
          currentColor === '#fff' || 
          currentColor === '#ffffff') {
        text.style.fill = '#212121';
      }
      
      // Add text shadow for better contrast if text is on a colored background
      if (currentColor && currentColor !== '#212121' && currentColor !== 'black') {
        text.style.textShadow = '0 0 3px white, 0 0 2px white';
      }
      
      // Increase font weight for better readability
      text.style.fontWeight = '500';
    });
    
    // Ensure diagram has a white background for good contrast
    const firstG = svgElement.querySelector('g');
    if (firstG) {
      const existingBg = svgElement.querySelector('rect.diagram-background');
      if (!existingBg) {
        // Create a white background for the diagram if none exists
        const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        background.setAttribute('width', '100%');
        background.setAttribute('height', '100%');
        background.setAttribute('fill', 'white');
        background.setAttribute('class', 'diagram-background');
        firstG.insertBefore(background, firstG.firstChild);
      }
    }
    
    // For pie charts: ensure they have labels and good contrast
    const pieChart = svgElement.querySelector('.pie-chart');
    if (pieChart) {
      // Make sure pie slices have a dark outline for better separation
      const pieSlices = svgElement.querySelectorAll('.pieCircle');
      pieSlices.forEach(slice => {
        slice.setAttribute('stroke', '#333');
        slice.setAttribute('stroke-width', '1');
      });
      
      // Ensure pie chart legend is visible
      const legend = svgElement.querySelector('.legend');
      if (!legend) {
        // Add programmatic note if no legend exists
        const textNode = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textNode.setAttribute('x', '10');
        textNode.setAttribute('y', svgElement.clientHeight - 20 + '');
        textNode.setAttribute('fill', '#666');
        textNode.textContent = 'Note: Use "title" in your code to add a title to this chart';
        svgElement.appendChild(textNode);
      }
    }
  };
  
  // Handle code editing
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };
  
  return (
    <div {...attributes} className="diagram-container my-4 border rounded">
      {children}
      
      {isEditing ? (
        <div contentEditable={false}>
          <textarea
            value={code}
            onChange={handleCodeChange}
            className="w-full p-2 font-mono text-sm border-b"
            rows={10}
          />
          <div className="flex justify-between p-2 bg-gray-50">
            <button 
              onClick={toggleEditMode}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save & Render
            </button>
            {error && <div className="text-red-500 text-sm">{error}</div>}
          </div>
        </div>
      ) : (
        <div contentEditable={false}>
          <div ref={diagramRef} className="diagram-render p-4" aria-label={`Diagram: ${getDiagramDescription(code)}`} role="img"></div>
          <div className="flex justify-between p-2 border-t bg-gray-50">
            <span className="text-sm text-gray-500">
              {(element as any).diagramType || 'mermaid'} diagram
            </span>
            <button 
              onClick={toggleEditMode}
              className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
            >
              Edit Diagram
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to generate a text description for the diagram (for accessibility)
const getDiagramDescription = (diagramCode: string): string => {
  // Try to extract a basic description from the diagram code
  if (diagramCode.includes('title')) {
    const titleMatch = diagramCode.match(/title\s+([^\n]+)/);
    if (titleMatch && titleMatch[1]) {
      return titleMatch[1];
    }
  }
  
  // Detect diagram type for basic description
  if (diagramCode.includes('graph')) return 'Flowchart diagram';
  if (diagramCode.includes('sequenceDiagram')) return 'Sequence diagram';
  if (diagramCode.includes('classDiagram')) return 'Class diagram';
  if (diagramCode.includes('erDiagram')) return 'Entity Relationship diagram';
  if (diagramCode.includes('pie')) return 'Pie chart';
  
  return 'Visual diagram';
};

export default DiagramElement; 