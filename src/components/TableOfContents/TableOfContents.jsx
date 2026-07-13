import { useEffect, useState } from 'react';
import { ChevronDown, ListTree } from 'lucide-react';
import './TableOfContents.css';

function TocLinks({ headings, activeId }) {
  return (
    <ol className="toc-list">
      {headings.map((heading) => (
        <li key={heading.id} className={`toc-item toc-item--level-${heading.level}`}>
          <a
            className={activeId === heading.id ? 'is-active' : ''}
            href={`#${heading.id}`}
            onClick={(event) => {
              const details = event.currentTarget.closest('details');
              if (details) {
                event.preventDefault();
                details.open = false;
                window.history.pushState(null, '', `#${heading.id}`);
                window.requestAnimationFrame(() => {
                  document.getElementById(heading.id)?.scrollIntoView({
                    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
                    block: 'start',
                  });
                });
              }
            }}
          >
            <span>{heading.text}</span>
          </a>
        </li>
      ))}
    </ol>
  );
}

export default function TableOfContents({ headings, mobile = false }) {
  const [activeId, setActiveId] = useState(headings[0]?.id || '');

  useEffect(() => {
    const elements = headings
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean);
    if (elements.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-120px 0px -62% 0px', threshold: [0, 1] },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  if (mobile) {
    return (
      <details className="toc-mobile liquid-glass">
        <summary>
          <span><ListTree size={16} /> 文章目录</span>
          <ChevronDown size={16} />
        </summary>
        <TocLinks headings={headings} activeId={activeId} />
      </details>
    );
  }

  return (
    <aside className="toc-desktop" aria-label="文章目录">
      <div className="toc-heading"><ListTree size={15} /> ON THIS PAGE</div>
      <TocLinks headings={headings} activeId={activeId} />
    </aside>
  );
}
