import { useEffect, useState } from 'react';
import { trackArticleCompletion } from '../../utils/analytics.js';
import './ReadingProgress.css';

export default function ReadingProgress({ articleSelector = '.post', slug }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frameId = 0;
    let completionRecorded = false;
    const startedAt = Date.now();

    const update = () => {
      const article = document.querySelector(articleSelector);
      if (!article) return;
      const start = article.offsetTop;
      const distance = Math.max(article.scrollHeight - window.innerHeight, 1);
      const nextProgress = Math.min(1, Math.max(0, (window.scrollY - start) / distance));
      setProgress(nextProgress);
      if (slug && !completionRecorded && nextProgress >= 0.9 && Date.now() - startedAt >= 10000) {
        completionRecorded = true;
        trackArticleCompletion(slug);
      }
    };

    const requestUpdate = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(update);
    };

    update();
    const completionTimer = window.setTimeout(requestUpdate, 10000);
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    return () => {
      cancelAnimationFrame(frameId);
      window.clearTimeout(completionTimer);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, [articleSelector, slug]);

  return (
    <div className="reading-progress" aria-hidden="true">
      <span style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
}
