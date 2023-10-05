import React, { useEffect, useState, useRef  } from 'react';
import ReactDOM from 'react-dom';
import Collapsible from './index.js';

const WrapFootnotes = () => {
  const [isFootnotesOpen, setFootnotesOpen] = useState(false);
  const [footnotesContent, setFootnotesContent] = useState(null);

  useEffect(() => {
    const footnotesDiv = document.querySelector('div.footnotes');
    if (!footnotesDiv) return;
	footnotesDiv.insertAdjacentHTML('afterbegin', '<h2>Footnotes</h2>');
	

    setFootnotesContent(footnotesDiv.innerHTML);
    footnotesDiv.style.display = 'none'; // Hide the original div.footnotes instead of removing it
  }, []);

  useEffect(() => {
    const checkFootnoteHash = () => {
      const footnoteHashRegex = /#fn-\d+/;
      if (footnoteHashRegex.test(window.location.hash)) {
		if(document.querySelector('#footnotes_collapsible hr')) {
			document.querySelector('#footnotes_collapsible hr').remove()
		}
        setFootnotesOpen(true);
		const targetElement = document.getElementById(window.location.hash.substring(1));
		targetElement && targetElement.scrollIntoView();
      }
    };

    window.addEventListener('hashchange', checkFootnoteHash, false);
    return () => {
      window.removeEventListener('hashchange', checkFootnoteHash);
    };
  }, []);

  if (!footnotesContent) {
    return null;
  }

  return (
    <div id="footnotes_collapsible"><Collapsible 
      summaryCollapsed=<span>Show <b>Footnotes</b></span>
      summaryExpanded=<span>Hide <b>Footnotes</b></span> 
      isOpen={isFootnotesOpen}
      onToggle={(state) => {
		if(document.querySelector('#footnotes_collapsible hr')) {
			document.querySelector('#footnotes_collapsible hr').remove()
		}
		  setFootnotesOpen(state);
		  if (!state && window.location.hash.startsWith('#fn-')) {
			window.history.pushState("", document.title, window.location.pathname + window.location.search);
		  }
		}}
    >
      <div id="footnotes_content" dangerouslySetInnerHTML={{ __html: footnotesContent }} />
    </Collapsible></div>
  );
};



export default WrapFootnotes;
