import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import './TypewriterText.css';

const DEFAULT_SENTENCES = [
  '感谢你的访问！',
  '愿每一次探索都有收获。',
  '记录技术，也记录生活。',
  '保持好奇，持续创造。',
];

export default function TypewriterText({ sentences = DEFAULT_SENTENCES }) {
  const prefersReducedMotion = useReducedMotion();
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const sentence = sentences[sentenceIndex] ?? '';
  const characters = Array.from(sentence);
  const visibleText = prefersReducedMotion
    ? sentence
    : characters.slice(0, characterCount).join('');

  useEffect(() => {
    if (prefersReducedMotion || sentences.length === 0) return undefined;

    let delay = 110;
    let update = () => setCharacterCount((count) => count + 1);

    if (!isDeleting && characterCount >= characters.length) {
      delay = 1800;
      update = () => setIsDeleting(true);
    } else if (isDeleting && characterCount > 0) {
      delay = 65;
      update = () => setCharacterCount((count) => count - 1);
    } else if (isDeleting) {
      delay = 420;
      update = () => {
        setSentenceIndex((index) => (index + 1) % sentences.length);
        setIsDeleting(false);
      };
    }

    const timeoutId = window.setTimeout(update, delay);
    return () => window.clearTimeout(timeoutId);
  }, [characterCount, characters.length, isDeleting, prefersReducedMotion, sentences.length]);

  return (
    <span className="typewriter" aria-live="polite">
      <span className="typewriter__visual" aria-hidden="true">
        {visibleText}
        <span className="typewriter__caret" />
      </span>
      <span className="typewriter__accessible">{sentence}</span>
    </span>
  );
}
