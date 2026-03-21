'use client';

import { useState, useEffect } from 'react';

interface ReadMoreProps {
  html: string;
  maxLength?: number;
}

export default function ReadMore({ html, maxLength = 100 }: ReadMoreProps) {
  const [expanded, setExpanded] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [isLong, setIsLong] = useState(false);

  useEffect(() => {
    // This runs only on client
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    setTextContent(text);
    setIsLong(text.length > maxLength);
  }, [html, maxLength]);

  return (
    <div className="ck-content p-3 ">
      {expanded || !isLong ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <p>{textContent.slice(0, maxLength)}...</p>
      )}

      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600  text-sm mt-1 hover:underline cursor-pointer"
        >
          {expanded ? 'Read less' : 'Read more'}
        </button>
      )}
    </div>
  );
}
