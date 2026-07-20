import { useEffect, useId, useRef, useState } from 'react';
import { useTheme } from '../../hooks/useTheme.js';
import './MermaidDiagram.css';

let renderQueue = Promise.resolve();

function queueDiagramRender(id, source, theme) {
  const task = renderQueue.then(async () => {
    const { default: mermaid } = await import('mermaid');
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      suppressErrorRendering: true,
      theme: theme === 'light' ? 'default' : 'dark',
      flowchart: {
        htmlLabels: true,
        useMaxWidth: true,
      },
    });
    return mermaid.render(id, source);
  });

  renderQueue = task.catch(() => undefined);
  return task;
}

export default function MermaidDiagram({ source = '' }) {
  const { theme } = useTheme();
  const reactId = useId();
  const canvasRef = useRef(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const diagramId = `mermaid-${reactId.replaceAll(':', '')}-${theme}`;
    setResult(null);
    setError('');

    queueDiagramRender(diagramId, source, theme)
      .then((nextResult) => {
        if (active) setResult(nextResult);
      })
      .catch((renderError) => {
        if (active) setError(renderError instanceof Error ? renderError.message : '图表语法无效');
      });

    return () => {
      active = false;
    };
  }, [reactId, source, theme]);

  useEffect(() => {
    if (result?.bindFunctions && canvasRef.current) {
      result.bindFunctions(canvasRef.current);
    }
  }, [result]);

  if (error) {
    return (
      <figure className="mermaid-diagram mermaid-diagram--error" data-theme={theme}>
        <figcaption>Mermaid 图表渲染失败</figcaption>
        <details>
          <summary>查看图表源码</summary>
          <pre><code>{source}</code></pre>
        </details>
      </figure>
    );
  }

  return (
    <figure
      className="mermaid-diagram"
      data-theme={theme}
      aria-label="Mermaid 图表"
    >
      {result ? (
        <div
          ref={canvasRef}
          className="mermaid-diagram__canvas"
          dangerouslySetInnerHTML={{ __html: result.svg }}
        />
      ) : (
        <div className="mermaid-diagram__loading" role="status">
          <span className="route-loading__indicator" />
          <span>正在渲染图表</span>
        </div>
      )}
    </figure>
  );
}
