import { Link } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle/ThemeToggle.jsx';
import './Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="header-title">My Blog</Link>
        <nav className="header-nav">
          <Link to="/">Posts</Link>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
