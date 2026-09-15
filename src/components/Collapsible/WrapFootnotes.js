import React, { useEffect, useState, useRef  } from 'react';
import ReactDOM from 'react-dom';
import Collapsible from './index.js';

const WrapFootnotes = () => {
  const [isFootnotesOpen, setFootnotesOpen] = useState(false);
  const [footnotesContent, setFootnotesContent] = useState(null);

  useEffect(() => {
    // MDX v3 (remark-gfm) renders footnotes as <section class="footnotes"> with a
    // visually-hidden <h2 id="footnote-label">; older MDX v1 used <div class="footnotes">.
    const footnotesDiv = document.querySelector('.footnotes');
    if (!footnotesDiv) return;
	const generatedLabel = footnotesDiv.querySelector('#footnote-label');
	generatedLabel && generatedLabel.remove();
	footnotesDiv.insertAdjacentHTML('afterbegin', '<h2>Footnotes</h2>');
	

    setFootnotesContent(footnotesDiv.innerHTML);
    footnotesDiv.style.display = 'none'; // Hide the original div.footnotes instead of removing it
  }, []);

  useEffect(() => {
    const checkFootnoteHash = () => {
      const footnoteHashRegex = /#(user-content-)?fn-\d+/;
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
		  if (!state && /^#(user-content-)?fn-/.test(window.location.hash)) {
			window.history.pushState("", document.title, window.location.pathname + window.location.search);
		  }
		}}
    >
      <div id="footnotes_content" dangerouslySetInnerHTML={{ __html: footnotesContent }} />
    </Collapsible></div>
  );
};



export default WrapFootnotes;
