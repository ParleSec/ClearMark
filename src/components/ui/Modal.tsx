import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

// Portal Component
interface PortalProps {
  children: React.ReactNode;
}

/**
 * Portal component for rendering content outside the normal DOM hierarchy
 * Used for modals, popovers, and other overlay components
 */
const Portal: React.FC<PortalProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Only render the portal on the client-side to avoid SSR issues
  if (!mounted) return null;
  
  // Create a portal to the document body
  return createPortal(
    children,
    document.body
  );
};

// Add keyframes to a global style tag when the component mounts
const ModalKeyframes = () => {
  useEffect(() => {
    // Create style element if it doesn't exist already
    if (!document.getElementById('modal-animations')) {
      const style = document.createElement('style');
      style.id = 'modal-animations';
      style.innerHTML = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideDown {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(10px); }
        }
      `;
      document.head.appendChild(style);
    }
    
    return () => {
      // Cleanup is optional since these animations might be used by other modals
    };
  }, []);
  
  return null;
};

// Basic Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: 'sm' | 'md' | 'lg';
}

/**
 * Simple modal component with fluid design aesthetics
 */
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, width = 'md' }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);
  
  // Close modal when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);
  
  // Prevent scrolling of background content
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);
  
  // If not open, don't render anything
  if (!isOpen) return null;
  
  // Get width class based on prop
  const getWidthClass = () => {
    switch (width) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-2xl';
      default: return 'max-w-md';
    }
  };
  
  return (
    <Portal>
      <ModalKeyframes />
      <div 
        className="fixed inset-0 z-[999999] bg-black/25 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden"
        style={{
          animation: isOpen ? 'fadeIn 200ms ease forwards' : 'fadeOut 150ms ease forwards'
        }}
      >
        <div 
          ref={modalRef}
          className={`bg-white dark:bg-slate-900 ${getWidthClass()} w-full max-h-[calc(100vh-2rem)] rounded-fluid shadow-flow-lg dark:shadow-slate-900/50 flex flex-col overflow-hidden transform transition-all duration-300 ease-out`}
          style={{
            animation: isOpen ? 'slideUp 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'slideDown 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          {/* Header with fluid design */}
          <div className="flex justify-between items-center p-4 border-b border-flow-100 dark:border-slate-800 bg-gradient-to-r from-white to-flow-50 dark:from-slate-900 dark:to-slate-800">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50 m-0">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
          
          {/* Content with smooth scrolling */}
          <div className="overflow-y-auto overscroll-contain flex-grow p-4 text-slate-900 dark:text-slate-100">
            {children}
          </div>
        </div>
      </div>
    </Portal>
  );
};

// Dialog Modal Component with more options
interface DialogModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeOnClickOutside?: boolean;
  closeOnEsc?: boolean;
}

/**
 * A more flexible dialog modal component that uses Portal
 * Follows the fluid, rainwater-inspired design system
 */
const DialogModal: React.FC<DialogModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
  showCloseButton = true,
  closeOnClickOutside = true,
  closeOnEsc = true,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  
  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && closeOnEsc) {
        onClose();
      }
    };
    
    if (isOpen && closeOnEsc) {
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, closeOnEsc]);
  
  // Handle outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dialogRef.current && 
          !dialogRef.current.contains(event.target as Node) &&
          closeOnClickOutside) {
        onClose();
      }
    };
    
    if (isOpen && closeOnClickOutside) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose, closeOnClickOutside]);
  
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  // Set width based on maxWidth prop
  const getWidthClass = () => {
    switch (maxWidth) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-2xl';
      case 'xl': return 'max-w-4xl';
      default: return 'max-w-md';
    }
  };
  
  return (
    <Portal>
      <ModalKeyframes />
      <div className="fixed inset-0 z-[999999] bg-black/25 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden animate-in fade-in duration-200">
        <div 
          ref={dialogRef}
          className={`${getWidthClass()} w-full max-h-[calc(100vh-2rem)] bg-white dark:bg-slate-900 rounded-fluid shadow-flow-lg dark:shadow-slate-900/50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-3 duration-300 ease-out`}
        >
          {/* Header with fluid gradient */}
          <div className="flex justify-between items-center p-4 border-b border-flow-100 dark:border-slate-800 bg-gradient-to-r from-white to-flow-50 dark:from-slate-900 dark:to-slate-800">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50">
              {title}
            </h3>
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            )}
          </div>
          
          {/* Content area with smooth scrolling */}
          <div className="overflow-y-auto overscroll-contain flex-grow scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-flow-200 hover:scrollbar-thumb-flow-300 dark:scrollbar-thumb-slate-600 dark:hover:scrollbar-thumb-slate-500 p-4 text-slate-900 dark:text-slate-100">
            {children}
          </div>
        </div>
      </div>
    </Portal>
  );
};

// Export both modal variants
export { Modal, DialogModal };