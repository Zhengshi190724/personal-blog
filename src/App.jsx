import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import Header from './components/Layout/Header.jsx';
import Footer from './components/Layout/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import PostPage from './pages/PostPage.jsx';
import TagPage from './pages/TagPage.jsx';
import PostsPage from './pages/PostsPage.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import ArchivePage from './pages/ArchivePage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import FriendsPage from './pages/FriendsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import Analytics from './components/Analytics/Analytics.jsx';

function LegacyPostRedirect() {
  const { slug } = useParams();
  return <Navigate replace to={`/posts/${slug}/`} />;
}

function LegacyTagRedirect() {
  const { tag } = useParams();
  return <Navigate replace to={`/tags/${tag}/`} />;
}

export default function App() {
  return (
    <div className="app-shell">
      <Analytics />
      <div className="ambient-media" aria-hidden="true">
        <video
          autoPlay
          loop
          muted
          playsInline
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4"
        />
        <div className="ambient-media__veil" />
      </div>
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
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/posts/" element={<PostsPage />} />
          <Route path="/posts/:slug/" element={<PostPage />} />
          <Route path="/categories/:category/" element={<CategoryPage />} />
          <Route path="/tags/:tag/" element={<TagPage />} />
          <Route path="/archive/" element={<ArchivePage />} />
          <Route path="/about/" element={<AboutPage />} />
          <Route path="/friends/" element={<FriendsPage />} />
          <Route path="/404/" element={<NotFoundPage />} />
          <Route path="/post/:slug" element={<LegacyPostRedirect />} />
          <Route path="/tag/:tag" element={<LegacyTagRedirect />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
