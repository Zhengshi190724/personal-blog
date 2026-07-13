import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.js';
import './ThemeToggle.css';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === 'light' ? '深色' : '浅色';

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`切换至${nextTheme}模式`}
      title={`切换至${nextTheme}模式`}
    >
      {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
    </button>
  );
}
