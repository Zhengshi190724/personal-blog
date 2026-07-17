import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';

const VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4';
const POSTER_URL = '/images/ambient-poster.jpg';

export default function AmbientMedia() {
  const prefersReducedMotion = useReducedMotion();
  const [playVideo, setPlayVideo] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 701px)');
    const update = () => {
      const saveData = Boolean(navigator.connection?.saveData);
      setPlayVideo(desktop.matches && !prefersReducedMotion && !saveData);
    };
    update();
    desktop.addEventListener('change', update);
    return () => desktop.removeEventListener('change', update);
  }, [prefersReducedMotion]);

  return (
    <div className="ambient-media" aria-hidden="true">
      {playVideo && (
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={POSTER_URL}
          preload="metadata"
          src={VIDEO_URL}
        />
      )}
      <div className="ambient-media__veil" />
    </div>
  );
}
