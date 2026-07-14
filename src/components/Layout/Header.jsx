import { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronDown, Menu, Search, X } from 'lucide-react';
import { categories } from '../../config/navigation.js';
import { siteConfig } from '../../config/site.js';
import ThemeToggle from '../ThemeToggle/ThemeToggle.jsx';
import SearchDialog from '../SearchDialog/SearchDialog.jsx';
import './Header.css';

const navGroups = [
  {
    label: '首页',
    to: '/',
  },
  {
    label: '文章',
    to: '/posts/',
    children: categories.map((category) => ({ label: category.name, to: `/categories/${category.slug}/` })),
  },
  {
    label: '归档',
    to: '/archive/',
    children: [
      { label: '按年份', to: '/archive/#years' },
      { label: '按分类', to: '/archive/#categories' },
      { label: '按标签', to: '/archive/#tags' },
    ],
  },
  {
    label: '关于',
    to: '/about/',
    children: [
      { label: '个人介绍', to: '/about/#profile' },
      { label: '技术栈', to: '/about/#stack' },
      { label: '联系方式', to: '/about/#contact' },
      { label: 'GitHub', to: '/about/#github' },
    ],
  },
];

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const openSearch = useCallback(() => {
    setMobileOpen(false);
    setSearchOpen(true);
  }, []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useEffect(() => setMobileOpen(false), [location.pathname, location.hash]);

  return (
    <>
      <motion.header className="header" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
        <div className="header-inner liquid-glass">
          <Link to="/" className="header-brand" aria-label={`${siteConfig.name} 首页`}>
            <span className="header-logo" aria-hidden="true" />
            <span>{siteConfig.name}</span>
          </Link>

          <nav className="header-nav" aria-label="主要导航">
            {navGroups.map((group) => {
              const hasChildren = Boolean(group.children?.length);
              return (
                <div className={`nav-group${hasChildren ? '' : ' nav-group--single'}`} key={group.label}>
                  <NavLink to={group.to} end={group.to === '/'}>
                    {group.label}
                    {hasChildren && <ChevronDown size={13} />}
                  </NavLink>
                  {hasChildren && (
                    <div className="nav-dropdown liquid-glass">
                      {group.children.map((child) => <Link key={child.to} to={child.to}>{child.label}</Link>)}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="nav-group nav-group--end">
              <button type="button" className="nav-group__trigger">其他<ChevronDown size={13} /></button>
              <div className="nav-dropdown liquid-glass">
                <button type="button" onClick={openSearch}><Search size={14} />搜索</button>
                <Link to="/friends/">友情链接</Link>
                <Link to="/404/">404 页面</Link>
              </div>
            </div>
          </nav>

          <div className="header-actions">
            <button className="header-search" type="button" onClick={openSearch} aria-label="搜索文章"><Search size={15} /><kbd>⌘K</kbd></button>
            <ThemeToggle />
            <button className="mobile-menu-toggle" type="button" onClick={() => setMobileOpen((value) => !value)} aria-expanded={mobileOpen} aria-controls="mobile-navigation" aria-label={mobileOpen ? '关闭菜单' : '打开菜单'}>
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav id="mobile-navigation" className="mobile-navigation liquid-glass" aria-label="移动端导航">
            {navGroups.map((group) => (
              <div className={`mobile-nav-group${group.children?.length ? '' : ' mobile-nav-group--single'}`} key={group.label}>
                <Link className="mobile-nav-group__title" to={group.to}>{group.label}</Link>
                {group.children?.length > 0 && <div>{group.children.map((child) => <Link key={child.to} to={child.to}>{child.label}</Link>)}</div>}
              </div>
            ))}
            <div className="mobile-nav-group">
              <span className="mobile-nav-group__title">其他</span>
              <div><button type="button" onClick={openSearch}>搜索</button><Link to="/friends/">友情链接</Link><Link to="/404/">404 页面</Link></div>
            </div>
          </nav>
        )}
      </motion.header>
      <SearchDialog open={searchOpen} onOpen={openSearch} onClose={closeSearch} />
    </>
  );
}
