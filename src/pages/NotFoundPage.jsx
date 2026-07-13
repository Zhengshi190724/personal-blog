import { ArrowLeft, SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO/SEO.jsx';
import { siteConfig } from '../config/site.js';
import './IndexPages.css';

export default function NotFoundPage() {
  return <div className="index-page empty-state"><SEO title={`404 | ${siteConfig.name}`} path="/404/" noindex /><SearchX size={30} /><h1>页面没有找到</h1><p>链接可能已经变更，或者内容还没有发布。</p><Link className="primary-action" to="/"><ArrowLeft size={16} /> 返回首页</Link></div>;
}
