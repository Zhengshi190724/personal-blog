import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ImageOff, Maximize2, X } from 'lucide-react';
import mediaManifest from '../../generated/media-manifest.json';
import './ResponsiveImage.css';

function srcSet(items = []) {
  return items.map((item) => `${item.src} ${item.width}w`).join(', ');
}

export default function ResponsiveImage({ src = '', alt = '', title = '' }) {
  const [expanded, setExpanded] = useState(false);
  const [failed, setFailed] = useState(false);
  const media = mediaManifest[src];
  const caption = title || alt;

  useEffect(() => {
    if (!expanded) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setExpanded(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [expanded]);

  return (
    <>
      <figure className={`article-media${failed ? ' article-media--failed' : ''}`}>
        <button
          className="article-media__trigger"
          type="button"
          onClick={() => !failed && setExpanded(true)}
          disabled={failed}
          aria-label={failed ? `${alt || '图片'}加载失败` : `放大查看：${alt || '文章图片'}`}
        >
          <picture>
            {media?.sources.avif.length > 0 && <source type="image/avif" srcSet={srcSet(media.sources.avif)} sizes="(max-width: 850px) calc(100vw - 40px), 720px" />}
            {media?.sources.webp.length > 0 && <source type="image/webp" srcSet={srcSet(media.sources.webp)} sizes="(max-width: 850px) calc(100vw - 40px), 720px" />}
            <img
              src={src}
              alt={alt}
              title={title || undefined}
              width={media?.width}
              height={media?.height}
              loading="lazy"
              decoding="async"
              onError={() => setFailed(true)}
            />
          </picture>
          <span className="article-media__zoom" aria-hidden="true"><Maximize2 size={16} /></span>
          <span className="article-media__fallback"><ImageOff size={22} /><span>图片暂时无法显示</span></span>
        </button>
        {caption && <figcaption>{caption}</figcaption>}
      </figure>

      {expanded && createPortal(
        <div className="media-lightbox" role="dialog" aria-modal="true" aria-label={alt || '图片预览'} onMouseDown={(event) => {
          if (event.target === event.currentTarget) setExpanded(false);
        }}>
          <button type="button" className="media-lightbox__close" onClick={() => setExpanded(false)} aria-label="关闭图片预览"><X size={20} /></button>
          <img src={src} alt={alt} />
          {caption && <p>{caption}</p>}
        </div>,
        document.body,
      )}
    </>
  );
}
