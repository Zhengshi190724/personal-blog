import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getLocalAnalytics, trackPageView } from '../../utils/analytics.js';

export default function Analytics() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      window.blogAnalytics = { snapshot: getLocalAnalytics };
      return () => delete window.blogAnalytics;
    }
    return undefined;
  }, []);

  return null;
}
