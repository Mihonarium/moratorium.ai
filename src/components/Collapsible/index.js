//index.js
import React, { useEffect, useState, useRef } from 'react';

const Collapsible = ({ 
  summaryCollapsed, 
  summaryExpanded, 
  children, 
  isOpen, 
  onToggle, 
  customToggleId = null 
}) => {
  const isControlled = isOpen !== undefined; // Check if in controlled mode
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false);
  
  const currentIsOpen = isControlled ? isOpen : uncontrolledIsOpen;
  const toggleElementRef = useRef(null);

  const handleToggle = () => {
    console.log("Button was clicked");
    console.log("isControlled:", isControlled);
    console.log("currentIsOpen:", currentIsOpen);
    if (isControlled) {
      onToggle && onToggle(!currentIsOpen);
    } else {
      setUncontrolledIsOpen(!currentIsOpen);
    }
  };

  useEffect(() => {
    console.log('Collapsible rendered. isOpen:', isOpen);

    if (customToggleId) {
      toggleElementRef.current = document.getElementById(customToggleId);
      toggleElementRef.current && toggleElementRef.current.addEventListener('click', handleToggle);
    }

    return () => {
      if (toggleElementRef.current) {
        toggleElementRef.current.removeEventListener('click', handleToggle);
      }
    };
  }, [isOpen, customToggleId]);

  const arrowStyle = {
    position: 'absolute',
    left: '0',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '1em', 
    textAlign: 'center' 
  };

  return (
    <div>
      {!customToggleId && (
        <button 
          onClick={handleToggle}
          className='button-collapsible'
        >
          {currentIsOpen 
            ? <span style={arrowStyle}>▼</span>
            : <span style={arrowStyle}>▶</span>
          }
          {currentIsOpen && summaryExpanded ? summaryExpanded : summaryCollapsed}
        </button>
      )}
      <div style={{ display: currentIsOpen ? 'block' : 'none' }}>
        {children}
      </div>
    </div>
  );
};

export default Collapsible;
