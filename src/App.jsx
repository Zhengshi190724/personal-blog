import { Routes, Route } from 'react-router-dom';
import Header from './components/Layout/Header.jsx';
import Footer from './components/Layout/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import PostPage from './pages/PostPage.jsx';
import TagPage from './pages/TagPage.jsx';

export default function App() {
  return (
    <>
      <Header />
      <main className="page-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/post/:slug" element={<PostPage />} />
          <Route path="/tag/:tag" element={<TagPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
