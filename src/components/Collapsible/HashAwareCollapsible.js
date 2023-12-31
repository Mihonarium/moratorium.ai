// HashAwareCollapsible.js
import React, { useEffect, useState, useRef } from 'react';
import Collapsible from './index.js';

const HashAwareCollapsible = ({ summaryCollapsed, summaryExpanded, children, customToggleId = null }) => {
  const contentRef = useRef(null);
  const [isContentOpen, setContentOpen] = useState(false);
  const [childIDs, setChildIDs] = useState([]);

	useEffect(() => {
	  if (!contentRef.current) return;

	  const ids = Array.from(contentRef.current.querySelectorAll('[id]')).map(el => el.id);
	  setChildIDs(ids);
	  
	  const handleHashChange = () => {
		const currentHash = new URL(window.location).hash.slice(1);
		if (ids.includes(currentHash) && !isContentOpen) {
		  setContentOpen(true);
		  setTimeout(() => {
			const targetElement = document.getElementById(currentHash);
			targetElement && targetElement.scrollIntoView();
			//window.scrollBy(0, 1);
			  setTimeout(() => {
				window.scrollBy(0, 1);
			  }, 30);
		  }, 30);
		}
	  };

		  setTimeout(() => {
			handleHashChange(); // Check the hash on initial mount
		  }, 100);
	  //handleHashChange(); // Check the hash on initial mount

	  window.addEventListener('hashchange', handleHashChange, false);
	  return () => {
		window.removeEventListener('hashchange', handleHashChange);
	  };
	}, [contentRef]);


  return (
    <Collapsible 
      summaryCollapsed={summaryCollapsed} 
      summaryExpanded={summaryExpanded} 
      isOpen={isContentOpen}
      onToggle={(state) => {
        setContentOpen(state);
		if (!state) {  // If the content is being closed
		  // Remove the hash from the URL without affecting the browser history
			const currentHash = new URL(window.location).hash.slice(1);
			if (childIDs.includes(currentHash)) {
			  history.replaceState(null, null, ' ');
			}
		}
      }}
	  customToggleId={customToggleId}
    >
      <div ref={contentRef}>
        {children}
      </div>
    </Collapsible>
  );
};

export default HashAwareCollapsible;
