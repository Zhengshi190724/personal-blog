import { ArrowUpRight, GitBranch } from 'lucide-react';
import SEO from '../components/SEO/SEO.jsx';
import { siteConfig } from '../config/site.js';
import './IndexPages.css';

export default function AboutPage() {
  return (
    <div className="index-page">
      <SEO title={`关于 | ${siteConfig.name}`} description="关于 Shane、技术栈和联系方式。" path="/about/" />
      <header className="index-hero">
        <div><span className="section-eyebrow">About Shane</span><h1>关于</h1></div>
        <p>关注数字通信、FPGA 信号处理和工程实现，也持续记录工具、方法与学习过程。</p>
      </header>

      <section id="profile" className="index-section about-content"><span className="about-content__label">01 / 个人介绍</span><div className="about-content__body"><h2>在算法与硬件之间建立可靠的连接。</h2><p>我是 Shane。这个博客用于沉淀技术学习、项目实验和工程判断，重点关注可以验证、复现并持续迭代的解决方案。</p></div></section>
      <section id="stack" className="index-section about-content"><span className="about-content__label">02 / 技术栈</span><div className="about-content__body"><h2>研究与实现工具</h2><ul className="stack-list"><li>FPGA / RTL Design</li><li>SystemVerilog</li><li>DSP / Digital Communications</li><li>MATLAB / Simulink</li><li>Python / Data Analysis</li><li>Git / Engineering Workflow</li></ul></div></section>
      <section id="contact" className="index-section about-content"><span className="about-content__label">03 / 联系方式</span><div className="about-content__body"><h2>通过公开项目交流</h2><p>技术讨论、文章勘误和项目建议可以通过 GitHub Issues 提交。</p><a className="primary-action" href="https://github.com/Zhengshi190724/personal-blog/issues" target="_blank" rel="noreferrer"><GitBranch size={16} /> GitHub Issues <ArrowUpRight size={15} /></a></div></section>
      <section id="github" className="index-section about-content"><span className="about-content__label">04 / GitHub</span><div className="about-content__body"><h2>代码与项目记录</h2><p>博客源码和后续公开项目将统一维护在 GitHub。</p><a href="https://github.com/Zhengshi190724" target="_blank" rel="noreferrer">github.com/Zhengshi190724 <ArrowUpRight size={14} /></a></div></section>
    </div>
  );
}
