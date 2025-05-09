import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

/**
 * Reusable modal component with mobile optimizations
 */
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [animationState, setAnimationState] = useState<'entering' | 'entered' | 'exiting' | 'exited'>(
    isOpen ? 'entering' : 'exited'
  );
  
  // Handle animation states
  useEffect(() => {
    if (isOpen) {
      setAnimationState('entering');
      const timer = setTimeout(() => {
        setAnimationState('entered');
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setAnimationState('exiting');
      const timer = setTimeout(() => {
        setAnimationState('exited');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
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
      // For iOS Safari
      document.documentElement.style.position = 'fixed';
      document.documentElement.style.width = '100%';
      document.documentElement.style.height = '100%';
      document.documentElement.style.top = `-${window.scrollY}px`;
    } else {
      // Restore scroll position for iOS Safari
      if (document.documentElement.style.position === 'fixed') {
        const scrollY = -parseInt(document.documentElement.style.top || '0', 10);
        document.documentElement.style.position = '';
        document.documentElement.style.width = '';
        document.documentElement.style.height = '';
        document.documentElement.style.top = '';
        window.scrollTo(0, scrollY);
      }
      document.body.style.overflow = '';
    }
    
    return () => {
      if (document.documentElement.style.position === 'fixed') {
        const scrollY = -parseInt(document.documentElement.style.top || '0', 10);
        document.documentElement.style.position = '';
        document.documentElement.style.width = '';
        document.documentElement.style.height = '';
        document.documentElement.style.top = '';
        window.scrollTo(0, scrollY);
      }
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  if (animationState === 'exited') return null;
  
  return (
    <div 
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black transition-opacity duration-300 touch-none
        ${animationState === 'entering' ? 'bg-opacity-0' : ''} 
        ${animationState === 'entered' ? 'bg-opacity-50' : ''} 
        ${animationState === 'exiting' ? 'bg-opacity-0' : ''}`}
      aria-modal="true"
      role="dialog"
    >
      <div 
        ref={modalRef}
        className={`bg-white rounded-t-lg sm:rounded-lg shadow-xl max-w-md w-full overflow-hidden transition-transform duration-300 transform 
          ${animationState === 'entering' ? 'translate-y-full sm:translate-y-8 sm:scale-95' : ''} 
          ${animationState === 'entered' ? 'translate-y-0 sm:scale-100' : ''} 
          ${animationState === 'exiting' ? 'translate-y-full sm:translate-y-8 sm:scale-95' : ''}`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900 pr-2">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 p-2 rounded-full touch-manipulation"
            aria-label="Close modal"
            title="Close modal"
          >
            <X size={22} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[70vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;