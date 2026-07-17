import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  downloadReadingHistory,
  getReadingHistory,
  recordLocalPageVisit,
} from '../../utils/readingHistory.js';

export default function ReadingHistory() {
  const location = useLocation();

  useEffect(() => {
    recordLocalPageVisit(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    window.blogReadingHistory = {
      snapshot: getReadingHistory,
      download: downloadReadingHistory,
    };
    return () => delete window.blogReadingHistory;
  }, []);

  return null;
}
