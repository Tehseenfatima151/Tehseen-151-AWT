export default function NextPrev({ activeLecture, setActiveLecture, total }) {
  const handleNav = (dir) => {
    const next = activeLecture + dir;
    if (next >= 1 && next <= total) {
      setActiveLecture(next);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="nav-btns">
      <button
        className="nav-btn"
        onClick={() => handleNav(-1)}
        disabled={activeLecture === 1}
      >
        ← Pehla Lecture
      </button>
      <span style={{ color: 'var(--muted)', fontSize: '0.85rem', fontWeight: 700 }}>
        {activeLecture} / {total}
      </span>
      <button
        className="nav-btn primary"
        onClick={() => handleNav(1)}
        disabled={activeLecture === total}
      >
        Agla Lecture →
      </button>
    </div>
  );
}
