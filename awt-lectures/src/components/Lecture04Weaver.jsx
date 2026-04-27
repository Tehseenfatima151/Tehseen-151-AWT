import { useState } from "react";

// Lecture 04 — Express.js Masterclass (from Lecture Weaver HTML)
// Converted to React component maintaining the same content structure

export default function Lecture04Weaver() {
  const quizItems = [
    {
      q: "Middleware functions in Express.js always have access to the req, res, and next objects.",
      a: "TRUE",
      correct: true,
      explanation: "This is their defining signature.",
    },
    {
      q: "app.use(express.json()) is an example of third-party middleware.",
      a: "FALSE",
      correct: false,
      explanation: "It's a built-in middleware provided by Express.",
    },
    {
      q: "Error-handling middleware functions are distinguished by having four arguments.",
      a: "TRUE",
      correct: true,
      explanation: "The four arguments are (err, req, res, next).",
    },
    {
      q: "Route parameters in Express.js are accessed via req.query.",
      a: "FALSE",
      correct: false,
      explanation: "Parameters are in req.params; req.query is for URL search strings.",
    },
    {
      q: "express.Router() is primarily used for modular routing.",
      a: "TRUE",
      correct: true,
      explanation: "It allows you to split routes into multiple files.",
    },
    {
      q: "A single Express.js route can only have one handler function.",
      a: "FALSE",
      correct: false,
      explanation: "You can chain multiple handlers and middleware.",
    },
    {
      q: "Mounting a router using app.use('/admin', adminRouter) prefixes paths with /admin.",
      a: "TRUE",
      correct: true,
      explanation: "This is how mounting works in Express.",
    },
    {
      q: "Middleware can modify the req and res objects.",
      a: "TRUE",
      correct: true,
      explanation: "This is a primary use case (e.g., adding user info to req).",
    },
    {
      q: "The next() function terminates the request-response cycle.",
      a: "FALSE",
      correct: false,
      explanation: "It passes control to the next function; res.send() terminates it.",
    },
    {
      q: "Express.js is an opinionated framework that dictates a strict structure.",
      a: "FALSE",
      correct: false,
      explanation: "Express is famously unopinionated and flexible.",
    },
  ];

  return (
    <>
      <section className="section" style={{ paddingTop: "2rem" }}>
        {/* Restaurant Analogy */}
        <div style={s.analogyBox}>
          <h3 style={s.analogyTitle}>⚡ The Restaurant Analogy</h3>
          <p style={s.analogyText}>
            Think of Express as a professional kitchen. The <strong>Request</strong> is the customer's order.{" "}
            <strong>Middleware</strong> are the stations (cleaning, chopping, seasoning) the order passes through
            before the <strong>Route Handler</strong> (the Chef) finally cooks the meal and sends the{" "}
            <strong>Response</strong> back to the table.
          </p>
        </div>
      </section>

      <hr className="div" />

      {/* Section 1: Framework Concepts */}
      <section className="section">
        <div style={s.sectionHeader}>
          <span style={s.stepBadge}>01</span>
          <h2 className="s-title" style={{ margin: 0 }}>Framework Concepts</h2>
        </div>
        <div className="g2">
          <div className="cc blue">
            <h4 style={s.conceptTitle}>Minimalist & Fast</h4>
            <p className="cd">Provides essential features without forcing a specific structure, leveraging Node's non-blocking I/O.</p>
          </div>
          <div className="cc green">
            <h4 style={s.conceptTitle}>Unopinionated</h4>
            <p className="cd">You decide how to organize your code. No strict folder structures required out of the box.</p>
          </div>
        </div>
      </section>

      <hr className="div" />

      {/* Section 2: Middleware */}
      <section className="section">
        <div style={s.sectionHeader}>
          <span style={s.stepBadge}>02</span>
          <h2 className="s-title" style={{ margin: 0 }}>The Power of Middleware</h2>
        </div>
        <p className="s-desc">
          Middleware functions are the "checkpoints" of your application. They have access to{" "}
          <code style={s.code}>req</code>, <code style={s.code}>res</code>, and <code style={s.code}>next</code>.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", margin: "2rem 0" }}>
          <div style={{ ...s.mwCard, borderLeftColor: "var(--blue)" }}>
            <span style={{ ...s.mwLabel, color: "var(--blue)" }}>APPLICATION-LEVEL</span>
            <p style={s.mwText}>Bound to <code style={s.code}>app.use()</code>. Runs for all requests.</p>
          </div>
          <div style={{ ...s.mwCard, borderLeftColor: "var(--muted)" }}>
            <span style={{ ...s.mwLabel, color: "var(--muted)" }}>ROUTER-LEVEL</span>
            <p style={s.mwText}>Bound to an <code style={s.code}>express.Router()</code> instance.</p>
          </div>
          <div style={{ ...s.mwCard, borderLeftColor: "var(--red)" }}>
            <span style={{ ...s.mwLabel, color: "var(--red)" }}>ERROR-HANDLING</span>
            <p style={s.mwText}>Four arguments: <code style={s.code}>(err, req, res, next)</code>. Always at the end.</p>
          </div>
        </div>

        <div className="alert warn">
          <span className="ai">🔐</span>
          <div className="ab">
            <strong>Real-life Example: Authentication</strong>
            Imagine an <code style={s.code}>authenticateUser</code> function. It inspects the request header for a token.
            If valid, it says "Proceed" via <code style={s.code}>next()</code>. If invalid, it slams the door shut
            with a <code style={s.code}>401 Unauthorized</code> response before the request ever hits your sensitive database routes.
          </div>
        </div>
      </section>

      <hr className="div" />

      {/* Section 3: Routing */}
      <section className="section">
        <div style={s.sectionHeader}>
          <span style={s.stepBadge}>03</span>
          <h2 className="s-title" style={{ margin: 0 }}>Intelligent Routing</h2>
        </div>
        
        <div className="g3" style={{ marginBottom: "2rem" }}>
          <div style={{ ...s.routeCard, color: "var(--blue)" }}>
            app.<strong style={{ color: "#fff" }}>get</strong>('/users', ...)
          </div>
          <div style={{ ...s.routeCard, color: "var(--green)" }}>
            app.<strong style={{ color: "#fff" }}>post</strong>('/users', ...)
          </div>
          <div style={{ ...s.routeCard, color: "var(--yellow)" }}>
            app.<strong style={{ color: "#fff" }}>put</strong>('/:id', ...)
          </div>
        </div>

        <div className="cc accent">
          <h4 style={s.paramTitle}>• Route Parameters</h4>
          <p className="cd" style={{ marginBottom: "1rem" }}>Captured in <code style={s.code}>req.params</code>. Essential for dynamic resources.</p>
          <div style={s.paramCode}>
            /users/:userId/books/:bookId<br />
            <span style={{ color: "var(--muted)", marginTop: "0.5rem", display: "inline-block" }}>→ {"{ userId: \"123\", bookId: \"456\" }"}</span>
          </div>
        </div>
      </section>

      <hr className="div" />

      {/* Section 4: Architecture */}
      <section className="section">
        <div style={s.sectionHeader}>
          <span style={s.stepBadge}>04</span>
          <h2 className="s-title" style={{ margin: 0 }}>Modern Architecture</h2>
        </div>
        
        <div style={s.archBox}>
          <div className="g2">
            <div>
              <h4 style={s.archTitle}>The Standard Pattern</h4>
              <ul style={s.archList}>
                <li style={s.archItem}>
                  <code style={{ ...s.code, color: "var(--blue)", fontWeight: 700 }}>app.js</code>
                  <span style={s.archDesc}> The entry point. Mounts routers and global middleware.</span>
                </li>
                <li style={s.archItem}>
                  <code style={{ ...s.code, color: "var(--blue)", fontWeight: 700 }}>routes/</code>
                  <span style={s.archDesc}> Resource-specific route definitions using express.Router().</span>
                </li>
                <li style={s.archItem}>
                  <code style={{ ...s.code, color: "var(--blue)", fontWeight: 700 }}>controllers/</code>
                  <span style={s.archDesc}> The "brains". Contains the logic for handling requests.</span>
                </li>
              </ul>
            </div>
            
            <div className="cb" style={{ margin: 0 }}>
              <span className="lb">Folder Structure</span>
              <pre>
<span className="kw">📂 project-root</span>
├── 📄 app.js
├── 📂 routes/
│   ├── <span className="str">users.js</span>
│   └── <span className="str">products.js</span>
├── 📂 controllers/
├── 📂 models/
└── 📂 middleware/
              </pre>
            </div>
          </div>
        </div>
      </section>

      <hr className="div" />

      {/* Section 5: Quiz */}
      <section className="section">
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h2 className="s-title">Check for Understanding 🧠</h2>
          <p className="s-desc" style={{ margin: "0 auto" }}>
            Test your knowledge of Express.js core principles. Click each card to reveal the answer.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {quizItems.map((item, i) => (
            <QuizCard key={i} num={i + 1} item={item} />
          ))}
        </div>
      </section>

      <hr className="div" />

      {/* Footer CTA */}
      <section className="section" style={{ textAlign: "center", paddingTop: "2rem", paddingBottom: "2rem" }}>
        <h3 className="s-title" style={{ fontSize: "1.8rem" }}>Ready to Build? 🚀</h3>
        <p className="s-desc" style={{ margin: "0 auto", maxWidth: 600 }}>
          You've covered the core pillars: Middleware, Routing, and Architecture.
          These concepts will allow you to build clean, maintainable, and scalable backend applications.
        </p>
      </section>
    </>
  );
}

function QuizCard({ num, item }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div
      onClick={() => setRevealed((r) => !r)}
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "1.25rem 1.5rem",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: revealed ? "0 4px 15px rgba(0,0,0,0.2)" : "none",
        borderColor: revealed ? "var(--accent)" : "var(--border)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.8rem" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "1px" }}>
          Question {num}
        </span>
        <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{revealed ? "Hide Answer" : "Click to reveal"}</span>
      </div>
      <p style={{ fontWeight: 600, color: "var(--text)", marginBottom: revealed ? "1.2rem" : 0, fontSize: "1.05rem" }}>
        {item.q}
      </p>
      {revealed && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem", display: "flex", alignItems: "flex-start", gap: "1rem" }}>
          <span
            style={{
              padding: "4px 12px",
              borderRadius: 6,
              fontSize: "0.8rem",
              fontWeight: 800,
              background: item.correct ? "rgba(6,214,160,0.15)" : "rgba(230,57,70,0.15)",
              color: item.correct ? "var(--green)" : "var(--red)",
              letterSpacing: "1px",
            }}
          >
            {item.a}
          </span>
          <span style={{ fontSize: "0.9rem", color: "var(--text)", fontStyle: "italic", lineHeight: 1.5 }}>
            {item.explanation}
          </span>
        </div>
      )}
    </div>
  );
}

const s = {
  analogyBox: {
    background: "linear-gradient(135deg, var(--card2), var(--card))",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: "2rem",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)",
  },
  analogyTitle: { fontFamily: "'Baloo Bhaijaan 2', cursive", fontSize: "1.4rem", fontWeight: 700, color: "var(--accent)", marginBottom: 12 },
  analogyText: { fontSize: "1rem", color: "var(--text)", lineHeight: 1.8 },
  sectionHeader: { display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" },
  stepBadge: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: 40, height: 40, borderRadius: 12, fontSize: "1rem", fontWeight: 800,
    background: "linear-gradient(135deg, var(--blue), var(--accent))", color: "#fff",
    flexShrink: 0,
    boxShadow: "0 4px 10px rgba(17,138,178,0.3)",
  },
  conceptTitle: { fontFamily: "'Baloo Bhaijaan 2', cursive", fontSize: "1.2rem", fontWeight: 700, color: "var(--text)", marginBottom: 8 },
  mwCard: {
    background: "var(--card2)", borderLeft: "4px solid",
    borderRadius: "0 12px 12px 0", padding: "1rem 1.25rem",
  },
  mwLabel: { fontSize: "0.7rem", fontWeight: 800, letterSpacing: "1px" },
  mwText: { fontSize: "0.95rem", color: "var(--text)", marginTop: 6, lineHeight: 1.5 },
  routeCard: {
    background: "var(--card2)", border: "1px solid var(--border)", borderRadius: 12,
    padding: "1rem 1.25rem", fontFamily: "monospace", fontSize: "0.9rem",
    textAlign: "center",
  },
  paramTitle: { fontFamily: "'Baloo Bhaijaan 2', cursive", fontSize: "1.2rem", fontWeight: 700, color: "var(--text)", marginBottom: 8 },
  paramCode: {
    background: "var(--darker)", border: "1px solid var(--border)", borderRadius: 8, padding: "1rem",
    fontFamily: "monospace", fontSize: "0.9rem", color: "var(--accent)",
  },
  archBox: {
    background: "var(--card)", border: "1px solid var(--border)",
    borderRadius: 16, padding: "2rem",
  },
  archTitle: { fontFamily: "'Baloo Bhaijaan 2', cursive", fontSize: "1.3rem", fontWeight: 700, color: "var(--accent)", marginBottom: 20 },
  archList: { listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 16 },
  archItem: { display: "flex", alignItems: "flex-start", fontSize: "0.95rem", gap: "0.5rem" },
  archDesc: { color: "var(--muted)", lineHeight: 1.5 },
  code: {
    fontFamily: "monospace", fontSize: "0.85rem",
    background: "var(--darker)", border: "1px solid var(--border)", padding: "2px 6px",
    borderRadius: 6, color: "var(--accent)",
  },
};
