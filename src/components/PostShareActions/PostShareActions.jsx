import { useEffect, useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';
import { siteConfig } from '../../config/site.js';
import './PostShareActions.css';

function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  if (!copied) throw new Error('copy command failed');
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  fallbackCopy(text);
}

export default function PostShareActions({ title, path }) {
  const [status, setStatus] = useState('');
  const url = new URL(path, siteConfig.url).toString();

  useEffect(() => {
    if (!status) return undefined;
    const timer = window.setTimeout(() => setStatus(''), 2200);
    return () => window.clearTimeout(timer);
  }, [status]);

  const copyLink = async () => {
    try {
      await copyText(url);
      setStatus('链接已复制');
    } catch {
      setStatus('复制失败，请从地址栏复制');
    }
  };

  const share = async () => {
    if (!navigator.share) {
      await copyLink();
      return;
    }
    try {
      await navigator.share({ title, url });
      setStatus('分享面板已打开');
    } catch (error) {
      if (error?.name !== 'AbortError') setStatus('分享失败');
    }
  };

  return (
    <div className="post-share-actions" role="group" aria-label="文章分享操作">
      <button type="button" onClick={copyLink} title="复制文章链接">
        {status === '链接已复制' ? <Check size={14} /> : <Copy size={14} />}
        <span>复制链接</span>
      </button>
      <button type="button" onClick={share} title="使用系统分享">
        <Share2 size={14} />
        <span>分享</span>
      </button>
      <span className="post-share-actions__status" role="status" aria-live="polite">{status}</span>
    </div>
  );
}
