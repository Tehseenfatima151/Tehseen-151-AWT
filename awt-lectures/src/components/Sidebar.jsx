import { useEffect, useRef } from 'react';
import { lecturesData } from '../data/lecturesData';

export default function Sidebar({ activeLecture, setActiveLecture, isOpen, setIsOpen }) {
  const sidebarRef = useRef(null);

  useEffect(() => {
    // Generate stars once on mount
    const starsEl = document.getElementById('stars');
    if (starsEl && starsEl.childElementCount === 0) {
      for (let i = 0; i < 110; i++) {
        const s = document.createElement('div');
        s.className = 'star';
        const sz = Math.random() > 0.8 ? 3 : 2;
        s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;width:${sz}px;height:${sz}px;--dur:${2 + Math.random() * 4}s;--delay:${Math.random() * 4}s`;
        starsEl.appendChild(s);
      }
    }
  }, []);

  const handleClick = (id) => {
    setActiveLecture(id);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const icons = ['⚙️','🌐','🚂','🔐','📡','🏗️','🗄️','🔑','📘','🔺','🧩','⚛️','🤖','⚡','🚀'];

  return (
    <>
      <div className={`overlay ${isOpen ? 'show' : ''}`} onClick={() => setIsOpen(false)} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} ref={sidebarRef}>
        <div className="sb-logo">
          <div className="sb-badge">CSC337 — AWT</div>
          <h1>Advanced Web<br />Technologies 🔥</h1>
          <p>Roman Urdu Lectures</p>
        </div>

        <div className="nav-lbl">Main Menu</div>
        <button
          className={`nav-item ${activeLecture === 'home' ? 'active' : ''}`}
          onClick={() => handleClick('home')}
        >
          <span className="ic">🏠</span>
          Home
          <span className="dot" />
        </button>

        <div className="nav-lbl">Lectures</div>
        {lecturesData.map((lec) => (
          <button
            key={lec.id}
            className={`nav-item ${activeLecture === lec.id ? 'active' : ''}`}
            onClick={() => handleClick(lec.id)}
          >
            <span className="ic">{icons[lec.id - 1] || '📖'}</span>
            Lecture {lec.id}
            <span className="dot" />
          </button>
        ))}

        <div className="sb-foot">
          🇵🇰 Pakistani Students ke liye<br />
          <strong style={{ color: 'var(--accent)' }}>15 Lectures — Roman Urdu</strong>
        </div>
      </aside>
    </>
  );
}
