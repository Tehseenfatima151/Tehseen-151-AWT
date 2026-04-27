import React from 'react';
import QuizSection from './QuizSection';

export default function Lecture12() {
  const quizData = [
    { question: "MEAN stack mein 'M' aur 'E' kya represent karte hain?", options: ["MySQL, Express", "MongoDB, Express", "MongoDB, Ember", "MariaDB, Express"], correctAnswer: 1 },
    { question: "React mein UI update kab hota hai?", options: ["Jab props ya state change hon", "Jab API call jaye", "Jab page refresh ho", "Jab user click kare"], correctAnswer: 0 },
    { question: "useEffect hook ka main maqsad kya hai?", options: ["Routing", "State manage karna", "Side effects (like API fetching) handle karna", "Component styling"], correctAnswer: 2 },
    { question: "REST API mein 'Create' operation ke liye konsa HTTP method use hota hai?", options: ["GET", "POST", "PUT", "DELETE"], correctAnswer: 1 },
    { question: "CORS kyun zaroori hai React aur Express app mein?", options: ["Database connect karne ke liye", "Styling ke liye", "Cross-origin requests allow karne ke liye", "Routing ke liye"], correctAnswer: 2 }
  ];

  return (
    <>
      <section className="section">
        <div className="s-tag">Mental Model</div>
        <h2 className="s-title">MEAN Stack "End-to-End" Mental Model 🧠</h2>
        <p className="s-desc">
          MEAN stack aik full-stack pipeline hai jahan <strong>React UI</strong> HTTP requests bhejti hai, <strong>Express/Node</strong> unko process karte hain, aur <strong>MongoDB</strong> mein data store hota hai.
        </p>

        <h3 style={{ fontFamily: "'Baloo Bhaijaan 2',cursive", margin: "1.5rem 0 0.8rem", color: "var(--accent)" }}>🚀 Request Flow</h3>
        <div className="steps" style={{ marginBottom: "1.5rem" }}>
          <div className="step"><div className="sn">1</div><div><div className="st">React Action</div><div className="sd">User UI par koi action karta hai (e.g., button click)</div></div></div>
          <div className="step"><div className="sn">2</div><div><div className="st">API Call</div><div className="sd">Axios ya Fetch se request bheji jati hai</div></div></div>
          <div className="step"><div className="sn">3</div><div><div className="st">Express Handling</div><div className="sd">Server request receive karke route find karta hai</div></div></div>
          <div className="step"><div className="sn">4</div><div><div className="st">MongoDB Query</div><div className="sd">Mongoose data database se nikalta ya save karta hai</div></div></div>
          <div className="step"><div className="sn">5</div><div><div className="st">JSON Response</div><div className="sd">Server UI ko JSON data wapas bhejta hai</div></div></div>
        </div>
      </section>

      <hr className="div" />

      <section className="section">
        <div className="s-tag">REST API</div>
        <h2 className="s-title">REST API Design 🔌</h2>
        
        <div className="tw" style={{ marginBottom: "1.5rem" }}>
          <table>
            <thead><tr><th>Action</th><th>HTTP Method</th><th>Route</th></tr></thead>
            <tbody>
              <tr><td>Get All Tasks</td><td><span className="pill" style={{ background: "rgba(6,214,160,.15)", color: "var(--green)" }}>GET</span></td><td><span className="pill">/tasks</span></td></tr>
              <tr><td>Create Task</td><td><span className="pill" style={{ background: "rgba(56,189,248,.15)", color: "var(--accent)" }}>POST</span></td><td><span className="pill">/tasks</span></td></tr>
              <tr><td>Update Task</td><td><span className="pill" style={{ background: "rgba(255,209,102,.15)", color: "var(--yellow)" }}>PUT/PATCH</span></td><td><span className="pill">/tasks/:id</span></td></tr>
              <tr><td>Delete Task</td><td><span className="pill" style={{ background: "rgba(230,57,70,.15)", color: "#ff8b94" }}>DELETE</span></td><td><span className="pill">/tasks/:id</span></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <hr className="div" />

      <section className="section">
        <div className="s-tag">Backend Build</div>
        <h2 className="s-title">Backend Build (Express + Mongoose) ⚙️</h2>
        <p className="s-desc">Express app routing handle karta hai, aur Mongoose JS objects ko MongoDB documents se map karta hai.</p>
        
        <div className="cb" style={{ marginBottom: "1.5rem" }}>
          <span className="lb">Essential Middleware</span>
          <pre>{`app.use(express.json()); // req.body parse karne ke liye
app.use(cors()); // Frontend access allow karne ke liye`}</pre>
        </div>
      </section>

      <hr className="div" />

      <section className="section">
        <div className="s-tag">React Core Concepts</div>
        <h2 className="s-title">React Core Concepts ⚛️</h2>
        <div className="g2" style={{ marginBottom: "1.5rem" }}>
          <div className="cc blue">
            <div className="ci">📦</div><div className="ct">Props</div>
            <div className="cd">
              • Parent-owned (Bahir se aata hai)<br />
              • Read-only (Nahi badal sakte)<br />
              • Data passing ke liye use hota hai
            </div>
          </div>
          <div className="cc green">
            <div className="ci">💾</div><div className="ct">State</div>
            <div className="cd">
              • Component-owned (Apna private data)<br />
              • Mutable (Setter se change hota hai)<br />
              • UI updates trigger karta hai
            </div>
          </div>
        </div>
      </section>

      <hr className="div" />

      <section className="section">
        <div className="s-tag">Lifecycle</div>
        <h2 className="s-title">Lifecycle via Hooks (useEffect) 🎣</h2>
        <p className="s-desc">Hooks ne puranay class methods ko replace kar dia hai. <code>useEffect</code> side effects handle karta hai (maslan API data fetching).</p>
        
        <div className="alert tip" style={{ marginTop: "1rem" }}>
          <span className="ai">💡</span>
          <div className="ab"><strong>Async Fetch Pattern:</strong><br/>1. Set state to 'loading'<br/>2. Call API (await fetch)<br/>3. Update state with data<br/>4. Handle errors<br/>5. Set loading to 'false'</div>
        </div>
      </section>

      <hr className="div" />

      <section className="section">
        <div className="s-tag">Practice Quiz</div>
        <h2 className="s-title">Quiz — MEAN Stack Samjha? 🧩</h2>
        <QuizSection title="" questions={quizData} />
      </section>
    </>
  );
}
