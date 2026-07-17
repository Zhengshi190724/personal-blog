import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import Header from './components/Layout/Header.jsx';
import Footer from './components/Layout/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import ReadingHistory from './components/ReadingHistory/ReadingHistory.jsx';
import AmbientMedia from './components/AmbientMedia/AmbientMedia.jsx';

const PostPage = lazy(() => import('./pages/PostPage.jsx'));
const TagPage = lazy(() => import('./pages/TagPage.jsx'));
const PostsPage = lazy(() => import('./pages/PostsPage.jsx'));
const CategoryPage = lazy(() => import('./pages/CategoryPage.jsx'));
const ArchivePage = lazy(() => import('./pages/ArchivePage.jsx'));
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'));
const FriendsPage = lazy(() => import('./pages/FriendsPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));
const ContentMapPage = lazy(() => import('./pages/ContentMapPage.jsx'));

function LegacyPostRedirect() {
  const { slug } = useParams();
  return <Navigate replace to={`/posts/${slug}/`} />;
}

function LegacyTagRedirect() {
  const { tag } = useParams();
  return <Navigate replace to={`/tags/${tag}/`} />;
}

function RouteLoading() {
  return (
    <div className="route-loading" role="status">
      <span className="route-loading__indicator" />
      <span>正在加载页面</span>
    </div>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <ReadingHistory />
      <AmbientMedia />
      <svg className="noise-filter" aria-hidden="true">
        <filter id="blog-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0" />
          <feComposite in2="SourceGraphic" operator="in" result="noise" />
          <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
        </filter>
      </svg>
      <Header />
      <main className="page-content">
        <Suspense fallback={<RouteLoading />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/posts/" element={<PostsPage />} />
            <Route path="/posts/:slug/" element={<PostPage />} />
            <Route path="/categories/:category/" element={<CategoryPage />} />
            <Route path="/tags/:tag/" element={<TagPage />} />
            <Route path="/maps/:map/" element={<ContentMapPage />} />
            <Route path="/archive/" element={<ArchivePage />} />
            <Route path="/about/" element={<AboutPage />} />
            <Route path="/friends/" element={<FriendsPage />} />
            <Route path="/404/" element={<NotFoundPage />} />
            <Route path="/post/:slug" element={<LegacyPostRedirect />} />
            <Route path="/tag/:tag" element={<LegacyTagRedirect />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
