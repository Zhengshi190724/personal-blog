import { ArrowUpRight } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <strong>Shane Blog</strong>
          <p>Code, systems and thoughtful work.</p>
        </div>
        <nav aria-label="页脚导航">
          <a href="/posts/">文章</a>
          <a href="/archive/">归档</a>
          <a href="https://github.com/Zhengshi190724/personal-blog" target="_blank" rel="noreferrer">
            GitHub <ArrowUpRight size={13} />
          </a>
        </nav>
        <span>© {new Date().getFullYear()} · Built with care</span>
      </div>
    </footer>
  );
}
