import { ArrowUpRight } from 'lucide-react';
import { siteConfig } from '../../config/site.js';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <strong>{siteConfig.name}</strong>
          <p>Code, systems and thoughtful work.</p>
        </div>
        <nav aria-label="页脚导航">
          <a href="/posts/">文章</a>
          <a href="/archive/">归档</a>
          <a href={siteConfig.github} target="_blank" rel="noreferrer">
            GitHub <ArrowUpRight size={13} />
          </a>
        </nav>
        <span>© {new Date().getFullYear()} · Built with care</span>
      </div>
    </footer>
  );
}
