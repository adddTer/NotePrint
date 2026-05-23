import React, { useEffect, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose',
  fontFamily: 'inherit',
});

interface MermaidRendererProps {
  chart: string;
}

export const MermaidRenderer: React.FC<MermaidRendererProps> = ({ chart }) => {
  const [svg, setSvg] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setHasError(false);
    const id = `mermaid-${Math.random().toString(36).substring(2, 10)}`;
    
    const renderChart = async () => {
      try {
        // Enforce neutral theme each time to prevent dark mode detection leaks
        mermaid.initialize({
          theme: 'neutral',
          fontFamily: 'inherit',
        });
        
        const { svg } = await mermaid.render(id, chart);
        if (isMounted) {
          setSvg(svg);
        }
      } catch (error) {
        console.error('Mermaid rendering failed', error);
        if (isMounted) {
          setHasError(true);
        }
      } finally {
        // Clean up any dangling error elements Mermaid might have appended to the body
        const errEl = document.getElementById(`d${id}`);
        if (errEl) errEl.remove();
        const mainEl = document.getElementById(id);
        if (mainEl) mainEl.remove();
        
        // Also remove generic error elements if it fell back to that
        document.querySelectorAll('svg[id^="dmermaid-"]').forEach(el => {
          if (el.textContent?.includes('Syntax error')) {
            el.remove();
          }
        });
      }
    };
    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (hasError) {
    return null;
  }

  if (!svg) {
    return null; /* loading state */
  }

  return (
    <div 
      className="mermaid-chart flex justify-center my-6 overflow-x-auto w-full [&>svg]:max-w-full [&>svg]:bg-transparent"
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
};
