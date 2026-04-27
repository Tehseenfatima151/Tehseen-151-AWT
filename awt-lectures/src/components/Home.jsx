import React from 'react';

export default function Home({ onStartLearning }) {
  return (
    <main className="main">
      {/* Hero Section */}
      <section className="hero-section" style={{ minHeight: '80vh', padding: '4rem 2rem' }}>
        <div className="hero-badge">Welcome to AWT</div>
        <h1 className="hero-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}>Advanced Web<br />Technology Lectures</h1>
        <p className="hero-desc" style={{ fontSize: '1.1rem', maxWidth: '600px' }}>
          Ek mukammal guide jahan aap Roman Urdu mein Modern Web Development, React, aur MERN stack bohat aasani se seekh sakte hain.
        </p>
        <button 
          onClick={onStartLearning}
          style={{
            background: 'linear-gradient(135deg, var(--accent), var(--green))',
            color: '#000',
            border: 'none',
            padding: '0.8rem 2rem',
            borderRadius: '12px',
            fontSize: '1.1rem',
            fontWeight: '800',
            fontFamily: "'Baloo Bhaijaan 2', cursive",
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(6, 214, 160, 0.3)',
            transition: 'transform 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          View Lectures 🚀
        </button>
      </section>

      <hr className="div" />

      {/* About Section */}
      <section className="section">
        <div className="s-tag">About Platform</div>
        <h2 className="s-title">Yeh Website Kis Liye Hai? 🤔</h2>
        <p className="s-desc">
          Yeh platform khas tor par un Pakistani students ke liye design kiya gaya hai jo Advanced Web Technology (CSC337) ko asaan zaban mein samajhna chahte hain. Yahan mushkil concepts ko real-world examples aur aasaan Roman Urdu mein samjhaya gaya hai taake aapka concept 100% clear ho.
        </p>
      </section>

      <hr className="div" />

      {/* Features Section */}
      <section className="section">
        <div className="s-tag">Key Features</div>
        <h2 className="s-title">Aap Ko Kya Milega? 🌟</h2>
        <div className="g3" style={{ marginTop: '2rem' }}>
          <div className="cc blue">
            <div className="ci">🇵🇰</div><div className="ct">Roman Urdu</div>
            <div className="cd">Tamam lectures asaan Roman Urdu mein hain, bilkul doston wali discussion ki tarah.</div>
          </div>
          <div className="cc green">
            <div className="ci">📚</div><div className="ct">Organized Lectures</div>
            <div className="cd">Lecture 1 se le kar 15 tak, step-by-step complete syllabus cover kiya gaya hai.</div>
          </div>
          <div className="cc yellow">
            <div className="ci">🎯</div><div className="ct">Beginner Friendly</div>
            <div className="cd">HTML basics se shuru ho kar React aur MERN stack tak ka safar aasan banaya gaya hai.</div>
          </div>
          <div className="cc red">
            <div className="ci">🧩</div><div className="ct">Interactive Quizzes</div>
            <div className="cd">Har lecture ke end mein quizzes hain taake aap apni learning check kar sakein.</div>
          </div>
        </div>
      </section>

      <hr className="div" />

      {/* Team Section */}
      <section className="section">
        <div className="s-tag">Our Team</div>
        <h2 className="s-title">Meet the Team 👥</h2>
        <div className="g3" style={{ marginTop: '2rem' }}>
          <div className="cc accent" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <img src="/team/sir.jpeg" alt="Muhammad Abdullah Wali" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent)', marginBottom: '1rem' }} />
            <div className="ct" style={{ fontSize: '1.2rem' }}>Muhammad Abdullah Wali</div>
            <div style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '1rem', textTransform: 'uppercase' }}>Project Manager</div>
            <div className="cd" style={{ marginBottom: '1.5rem' }}>Course instructor jinhon ne syllabus aur guidelines set kiye.</div>
            <a href="https://muhammadabdullahwali.vercel.app/" target="_blank" rel="noopener noreferrer" style={{ color: '#0b1d38', background: 'var(--accent)', padding: '0.5rem 1.2rem', borderRadius: '8px', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' }}>View Portfolio</a>
          </div>
          
          <div className="cc blue" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <img src="/team/tehseen.jpeg" alt="Tehseen Fatima" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--blue)', marginBottom: '1rem', objectPosition: 'top' }} />
            <div className="ct" style={{ fontSize: '1.2rem' }}>Tehseen Fatima</div>
            <div style={{ color: 'var(--blue)', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '1rem', textTransform: 'uppercase' }}>Full Stack Developer</div>
            <div className="cd" style={{ marginBottom: '1.5rem' }}>React application architecture aur Roman Urdu content structure build kiya.</div>
            <a href="https://sites.google.com/view/tehseens-portfolio/home" target="_blank" rel="noopener noreferrer" style={{ color: '#0b1d38', background: 'var(--blue)', padding: '0.5rem 1.2rem', borderRadius: '8px', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' }}>View Portfolio</a>
          </div>

          <div className="cc green" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <img src="/team/rabiya.jfif" alt="Rabiya Ashfaq" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--green)', marginBottom: '1rem', objectPosition: 'top' }} />
            <div className="ct" style={{ fontSize: '1.2rem' }}>Rabiya Ashfaq</div>
            <div style={{ color: 'var(--green)', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '1rem', textTransform: 'uppercase' }}>Co-Developer / Designer</div>
            <div className="cd" style={{ marginBottom: '1.5rem' }}>UI design maintain karna aur content formatting mein madad ki.</div>
            <a href="#" style={{ color: '#0b1d38', background: 'var(--green)', padding: '0.5rem 1.2rem', borderRadius: '8px', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' }}>View Portfolio</a>
          </div>
        </div>
      </section>

      <hr className="div" />

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--muted)', fontSize: '0.85rem' }}>
        <p>© 2026 Advanced Web Technology Lectures</p>
        <p style={{ marginTop: '0.5rem' }}>Built with React, CSS, and ❤️</p>
      </footer>
    </main>
  );
}
