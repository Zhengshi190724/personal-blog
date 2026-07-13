import { Link2 } from 'lucide-react';
import SEO from '../components/SEO/SEO.jsx';
import { siteConfig } from '../config/site.js';
import './IndexPages.css';

export default function FriendsPage() {
  return (
    <div className="index-page">
      <SEO title={`友情链接 | ${siteConfig.name}`} description="值得持续阅读的技术网站与个人博客。" path="/friends/" />
      <header className="index-hero"><div><span className="section-eyebrow">Links</span><h1>友情链接</h1></div><p>收集长期更新、内容可靠并具有独立思考的技术站点。</p></header>
      <section className="empty-state"><Link2 size={26} /><h2>链接正在整理中</h2><p>这里将逐步加入数字通信、FPGA、信号处理和工程实践相关站点。</p></section>
    </div>
  );
}
