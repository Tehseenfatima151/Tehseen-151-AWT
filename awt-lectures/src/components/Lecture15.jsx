import React from 'react';
import QuizSection from './QuizSection';

export default function Lecture15() {
  const quizData = [
    { question: "React Testing Library kya test karne ko encourage karta hai?", options: ["Component internal state", "Implementation details", "User-visible behavior", "CSS animations"], correctAnswer: 2 },
    { question: "Async UI updates (maslan data fetch) ke liye best query kaunsi hai?", options: ["getByText", "findByText", "queryByText", "getAllByText"], correctAnswer: 1 },
    { question: "MERN stack mein DB query logic kis layer mein honi chahiye?", options: ["Routes", "Controllers", "Models/Services", "React components"], correctAnswer: 2 },
    { question: "Existing resource ko update karne ka sahi HTTP method kya hai?", options: ["GET", "POST", "PUT/PATCH", "TRACE"], correctAnswer: 2 },
    { question: "Ek reliable MERN architecture mein separation of concerns kahan hoti hai?", options: ["UI and CSS only", "Routes, Controllers, Models", "MongoDB inside React", "Everything in one server file"], correctAnswer: 1 }
  ];

  return (
    <>
      <section className="section">
        <div className="s-tag">Testing Core</div>
        <h2 className="s-title">React Unit Testing ka Mindset 🧪</h2>
        <p className="s-desc">
          React tests mein user ke behavior ko test karna chahiye (kya dikh raha hai aur kya kaam kar raha hai), na ke internal component details.
        </p>

        <div className="g2" style={{ marginBottom: "1.5rem" }}>
          <div className="cc blue">
            <div className="ci">✅</div><div className="ct">Kya Test Karna Hai (High Value)</div>
            <div className="cd">
              • Rendering states (loading, error, success)<br />
              • User interactions (click, typing)<br />
              • Conditional UI
            </div>
          </div>
          <div className="cc red">
            <div className="ci">❌</div><div className="ct">Kya Test NAHI Karna</div>
            <div className="cd">
              • Private functions<br />
              • Internal state structure (jaise kis variable mein data hai)
            </div>
          </div>
        </div>

        <div className="alert tip" style={{ marginBottom: "1.5rem" }}>
          <span className="ai">💡</span>
          <div className="ab"><strong>Important Note:</strong> React Testing Library mein hum "User ki tarah query" karte hain: <code>getByRole</code>, <code>getByLabelText</code>. Ye accessibility aur UI quality dono improve karta hai!</div>
        </div>
      </section>

      <hr className="div" />

      <section className="section">
        <div className="s-tag">Testing Patterns</div>
        <h2 className="s-title">Practical Testing Patterns 🛠️</h2>

        <div className="g3" style={{ marginBottom: "1.5rem" }}>
          <div className="cc blue"><div className="ci">1️⃣</div><div className="ct">Events & State</div><div className="cd">Click karne par UI mein change aana, ya form type karne par validation dikhana.</div></div>
          <div className="cc green"><div className="ci">2️⃣</div><div className="ct">Async UI (Fetch)</div><div className="cd">Pehle Loading spinner, phir API complete hone par Data dikhna. (Yahan <code>findBy...</code> use hota hai).</div></div>
          <div className="cc yellow"><div className="ci">3️⃣</div><div className="ct">Mocking APIs</div><div className="cd">Asli API call karne ki bajaye Mock server (jaise MSW) ya api modules ko mock karo!</div></div>
        </div>

        <div className="alert exam" style={{ marginBottom: "1.5rem" }}>
          <span className="ai">🎯</span>
          <div className="ab"><strong>Common Mistakes:</strong><br />❌ Async content ke liye <code>getByText</code> use karna (Error dega!). Hamesha <code>findBy...</code> aur <code>waitFor</code> use karein.<br />❌ Over-mocking karna (tests meaningless ho jate hain).</div>
        </div>
      </section>

      <hr className="div" />

      <section className="section">
        <div className="s-tag">MERN Architecture</div>
        <h2 className="s-title">MERN Stack — Architecture Blueprint 🏗️</h2>
        <p className="s-desc">MERN ek complete pipeline hai: React UI → Express API → MongoDB.</p>

        <h3 style={{ fontFamily: "'Baloo Bhaijaan 2',cursive", margin: "1.5rem 0 0.8rem", color: "var(--accent)" }}>🔄 Request Flow</h3>
        <div className="steps" style={{ marginBottom: "1.5rem" }}>
          <div className="step"><div className="sn">1</div><div><div className="st">React Component</div><div className="sd">User action karta hai.</div></div></div>
          <div className="step"><div className="sn">2</div><div><div className="st">HTTP Call</div><div className="sd">Axios ya Fetch API ko request bhejta hai.</div></div></div>
          <div className="step"><div className="sn">3</div><div><div className="st">Express Routes</div><div className="sd">URL mapping ko handle karta hai.</div></div></div>
          <div className="step"><div className="sn">4</div><div><div className="st">Controller</div><div className="sd">Request ka logic yahan hota hai.</div></div></div>
          <div className="step"><div className="sn">5</div><div><div className="st">Mongoose Model</div><div className="sd">MongoDB mein actual query run karta hai!</div></div></div>
        </div>
      </section>

      <hr className="div" />

      <section className="section">
        <div className="s-tag">Complete Flow</div>
        <h2 className="s-title">Complete MERN Implementation Flow 🚀</h2>
        <p className="s-desc">Ek feature (jaise Notes ya Products) ko end-to-end banane ka step-by-step process.</p>

        <div className="tw" style={{ marginBottom: "1.5rem" }}>
          <table>
            <thead><tr><th>Layer</th><th>Kya Karna Hai?</th></tr></thead>
            <tbody>
              <tr><td>1. Model (Mongoose)</td><td>Schema aur database validations define karein.</td></tr>
              <tr><td>2. Controllers</td><td>CRUD functions likhein (status codes ke saath).</td></tr>
              <tr><td>3. Routes</td><td>Controllers ko HTTP endpoints ke saath jorain.</td></tr>
              <tr><td>4. Express Setup</td><td>Middleware (CORS, express.json) aur DB connection.</td></tr>
              <tr><td>5. React UI</td><td>Loading, Error, aur Empty list states handle karein.</td></tr>
              <tr><td>6. Integration</td><td>React components ko backend API se connect karein.</td></tr>
            </tbody>
          </table>
        </div>

        <div className="cb" style={{ marginBottom: "1.5rem" }}>
          <span className="lb">Folder Structure</span>
          <pre>{`frontend/
  ├── components/
  ├── pages/
  ├── services/ (api calls)
backend/
  ├── config/
  ├── models/
  ├── controllers/
  ├── routes/`}</pre>
        </div>
      </section>

      <hr className="div" />

      <section className="section">
        <div className="s-tag">Practice Quiz</div>
        <h2 className="s-title">Quiz — MERN aur Testing Samjha? 🧩</h2>
        <QuizSection title="" questions={quizData} />
      </section>

      <hr className="div" />

      <section className="section">
        <div className="s-tag">End of Course</div>
        <div className="alert tip" style={{ textAlign: 'center', padding: '2rem' }}>
          <span className="ai" style={{ fontSize: '3rem', margin: '0 auto 1rem' }}>🎓</span>
          <div className="ab">
            <h2 style={{ fontSize: '1.8rem', color: 'var(--green)', marginBottom: '0.5rem' }}>Congratulations!</h2>
            <p>Aapne Advanced Web Technology ka course complete kar liya hai. MERN Stack aur React Testing ki sari bunyadi cheezein ab aapko ati hain. Best of luck for your future projects!</p>
          </div>
        </div>
      </section>
    </>
  );
}
