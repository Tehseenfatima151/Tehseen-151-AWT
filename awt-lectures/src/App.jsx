import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LectureContent from './components/LectureContent';
import Home from './components/Home';

export default function App() {
  const [activeLecture, setActiveLecture] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Progress bar on scroll
  useEffect(() => {
    const pb = document.getElementById('pb');
    const handleScroll = () => {
      if (!pb) return;
      const t = document.documentElement.scrollHeight - window.innerHeight;
      pb.style.width = t > 0 ? (window.scrollY / t * 100) + '%' : '0%';
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Progress bar */}
      <div className="pb" id="pb" />

      {/* Star background */}
      <div className="stars" id="stars" />

      {/* Mobile header button */}
      <Header setIsOpen={setSidebarOpen} />

      {/* Sidebar */}
      <Sidebar
        activeLecture={activeLecture}
        setActiveLecture={setActiveLecture}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main content area */}
      {activeLecture === 'home' ? (
        <Home onStartLearning={() => setActiveLecture(1)} />
      ) : (
        <LectureContent
          activeLecture={activeLecture}
          setActiveLecture={setActiveLecture}
        />
      )}
    </>
  );
}
