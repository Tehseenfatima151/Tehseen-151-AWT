import NextPrev from './NextPrev';
import Lecture04Weaver from './Lecture04Weaver';
import Lecture06 from './Lecture06';
import Lecture07 from './Lecture07';
import Lecture08 from './Lecture08';
import Lecture09 from './Lecture09';
import Lecture10 from './Lecture10';
import Lecture11 from './Lecture11';
import Lecture12 from './Lecture12';
import Lecture13 from './Lecture13';
import Lecture14 from './Lecture14';
import Lecture15 from './Lecture15';
import { lecturesData } from '../data/lecturesData';

const SPECIAL_COMPONENTS = {
  Lecture04Weaver,
  Lecture06,
  Lecture07,
  Lecture08,
  Lecture09,
  Lecture10,
  Lecture11,
  Lecture12,
  Lecture13,
  Lecture14,
  Lecture15,
};

// ─── Sub-components ───

function Alert({ type, icon, title, text }) {
  return (
    <div className={`alert ${type}`}>
      <span className="ai">{icon}</span>
      <div className="ab">
        <strong>{title}</strong>
        {text}
      </div>
    </div>
  );
}

function CodeBlock({ label, content }) {
  return (
    <div className="cb" style={{ marginTop: '1rem' }}>
      {label && <span className="lb">{label}</span>}
      <pre>{content}</pre>
    </div>
  );
}

function ConceptCards({ cards }) {
  return (
    <div className="g2" style={{ marginTop: '1.2rem' }}>
      {cards.map((card, i) => (
        <div className={`cc ${card.color}`} key={i}>
          <div className="ci">{card.icon}</div>
          <div className="ct">{card.title}</div>
          <div className="cd">{card.desc}</div>
        </div>
      ))}
    </div>
  );
}

function DataTable({ table }) {
  return (
    <div className="tw" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
      <table>
        <thead>
          <tr>{table.headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>
                  {j === 0 ? <span className="pill">{cell}</span> : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FlowDiagram({ flow }) {
  return (
    <div className="flow">
      {flow.map((item, i) => (
        item === '→' ? (
          <span className="fa" key={i}>→</span>
        ) : (
          <div className="fb" key={i}>{item}</div>
        )
      ))}
    </div>
  );
}

function Steps({ steps }) {
  return (
    <div className="steps" style={{ marginTop: '1rem' }}>
      {steps.map((step, i) => (
        <div className="step" key={i}>
          <div className="sn">{step.n}</div>
          <div>
            <div className="st">{step.title}</div>
            <div className="sd">{step.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Section({ sec }) {
  return (
    <>
      <section className="section">
        <div className="s-tag">{sec.tag}</div>
        <h2 className="s-title">{sec.title}</h2>
        <p className="s-desc">{sec.desc}</p>

        {sec.flow && <FlowDiagram flow={sec.flow} />}
        {sec.cards && <ConceptCards cards={sec.cards} />}
        {sec.code && <CodeBlock label={sec.code.label} content={sec.code.content} />}
        {sec.table && <DataTable table={sec.table} />}
        {sec.steps && <Steps steps={sec.steps} />}
        {sec.alert && (
          <Alert
            type={sec.alert.type}
            icon={sec.alert.icon}
            title={sec.alert.title}
            text={sec.alert.text || sec.alert.desc}
          />
        )}
      </section>
      <hr className="div" />
    </>
  );
}

// ─── Main Component ───

export default function LectureContent({ activeLecture, setActiveLecture }) {
  const lecture = lecturesData.find((l) => l.id === activeLecture);

  if (!lecture) return null;

  // Coming soon view
  if (lecture.comingSoon) {
    return (
      <main className="main">
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="coming-soon">
            <div className="big-icon">🔒</div>
            <h3>Lecture {lecture.id} — Tayaari Ho Rahi Hai!</h3>
            <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>
              Ye lecture jald Roman Urdu mein tayar ho ga. Thora intezaar karo! 🇵🇰
            </p>
          </div>
          <NextPrev activeLecture={activeLecture} setActiveLecture={setActiveLecture} total={15} />
        </div>
      </main>
    );
  }


  // Special component rendering (Lecture04Weaver, Lecture06, Lecture07, Lecture08, Lecture09)
  if (lecture.useSpecialComponent && SPECIAL_COMPONENTS[lecture.useSpecialComponent]) {
    const SpecialComp = SPECIAL_COMPONENTS[lecture.useSpecialComponent];
    return (
      <main className="main">
        <section className="hero-section">
          <div className="hero-badge">{lecture.badge} — {lecture.icon} {lecture.title}</div>
          <h2 className="hero-title">{lecture.heroTitle}</h2>
          <p className="hero-desc">{lecture.heroDesc}</p>
          <div className="hero-stats">
            {lecture.stats.map((s, i) => (
              <div className="stat" key={i}>
                <div className="stat-n">{s.n}</div>
                <div className="stat-l">{s.l}</div>
              </div>
            ))}
          </div>
        </section>
        <hr className="div" />
        <SpecialComp />
        <NextPrev activeLecture={activeLecture} setActiveLecture={setActiveLecture} total={15} />
        <footer>
          <p>CSC337 — Advanced Web Technologies 🇵🇰 | Lecture {lecture.id}</p>
          <p style={{ marginTop: '0.4rem' }}>Banaya gaya Pakistani students ke liye ❤️ —{' '}<strong>AWT Seekhain, Pakistan Banain!</strong></p>
        </footer>
      </main>
    );
  }

  return (
    <main className="main">
      {/* HERO */}
      <section className="hero-section">
        <div className="hero-badge">{lecture.badge} — {lecture.icon} {lecture.title}</div>
        <h2 className="hero-title">{lecture.heroTitle}</h2>
        <p className="hero-desc">{lecture.heroDesc}</p>
        <div className="hero-stats">
          {lecture.stats.map((s, i) => (
            <div className="stat" key={i}>
              <div className="stat-n">{s.n}</div>
              <div className="stat-l">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <hr className="div" />

      {/* LECTURE SECTIONS */}
      {lecture.sections.map((sec, i) => (
        <Section sec={sec} key={i} />
      ))}

      {/* NEXT / PREV */}
      <NextPrev activeLecture={activeLecture} setActiveLecture={setActiveLecture} total={15} />

      {/* FOOTER */}
      <footer>
        <p>CSC337 — Advanced Web Technologies 🇵🇰 | Lecture {lecture.id}</p>
        <p style={{ marginTop: '0.4rem' }}>
          Banaya gaya Pakistani students ke liye ❤️ —{' '}
          <strong>AWT Seekhain, Pakistan Banain!</strong>
        </p>
      </footer>
    </main>
  );
}
