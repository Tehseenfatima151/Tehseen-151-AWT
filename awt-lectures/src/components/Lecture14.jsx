import React from 'react';
import QuizSection from './QuizSection';

export default function Lecture14() {
  const quizData = [
    { question: "Fetch API mein 404/500 errors ko properly handle karne ke liye kya check karna zaroori hai?", options: ["response.json()", "response.ok", "response.headers", "response.status"], correctAnswer: 1 },
    { question: "Redux Thunk kya dispatch karne ki ijazat deta hai?", options: ["Strings", "Arrays", "Functions", "Promises"], correctAnswer: 2 },
    { question: "Axios aur Fetch mein ek main difference kya hai?", options: ["Fetch automatic JSON parse karta hai", "Axios automatic JSON parse karta hai", "Dono same hain", "Fetch sirf GET requests karta hai"], correctAnswer: 1 },
    { question: "Redux store kya hai?", options: ["Database for backend", "Global state memory for app", "UI styling component", "Routing manager"], correctAnswer: 1 },
    { question: "Async API calls ko handle karte waqt state ke konsey 3 parts zaroori hain?", options: ["Component, Props, Styles", "Header, Main, Footer", "Loading, Data, Error", "Start, Run, Stop"], correctAnswer: 2 }
  ];

  return (
    <>
      <section className="section">
        <div className="s-tag">Data Flow</div>
        <h2 className="s-title">Data Flow Ka Concept 🧩</h2>
        <p className="s-desc">
          Frontend applications backend APIs se data fetch karti hain. React ko ek clean method chahiye data request karne aur UI update karne ke liye. Jab multiple components ko same data chahiye ho (jaise cart items ya user profile), to <strong>Redux</strong> use kiya jata hai shared state manage karne ke liye.
        </p>

        <div className="g3" style={{ marginBottom: "1.5rem" }}>
          <div className="cc blue"><div className="ci">📞</div><div className="ct">Fetch/Axios</div><div className="cd">Communication ke liye use hote hain API se.</div></div>
          <div className="cc green"><div className="ci">🗄️</div><div className="ct">Redux</div><div className="cd">Global Storage jahan app ka state maintain hota hai.</div></div>
          <div className="cc yellow"><div className="ci">⚡</div><div className="ct">Thunk</div><div className="cd">Async Logic handle karne ke liye middleware.</div></div>
        </div>
      </section>

      <hr className="div" />

      <section className="section">
        <div className="s-tag">API Calls</div>
        <h2 className="s-title">API Calling with Fetch 🌐</h2>
        <p className="s-desc">Fetch browser ka built-in function hai. Ismein aapko manual JSON parsing aur error checking karni parti hai.</p>

        <div className="steps" style={{ marginBottom: "1.5rem" }}>
          <div className="step"><div className="sn">1</div><div><div className="st">Call API</div><div className="sd"><code>fetch(url)</code></div></div></div>
          <div className="step"><div className="sn">2</div><div><div className="st">Check Response</div><div className="sd"><code>response.ok</code> zaroor check karein</div></div></div>
          <div className="step"><div className="sn">3</div><div><div className="st">Parse JSON</div><div className="sd"><code>response.json()</code></div></div></div>
          <div className="step"><div className="sn">4</div><div><div className="st">Update State</div><div className="sd">Data ko store karein ya dispatch karein</div></div></div>
        </div>

        <div className="cb" style={{ marginBottom: "1.5rem" }}>
          <span className="lb">Fetch Example</span>
          <pre>{`const getData = async () => {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) 
       throw new Error('Network error');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
};`}</pre>
        </div>
      </section>

      <hr className="div" />

      <section className="section">
        <div className="s-tag">Axios</div>
        <h2 className="s-title">API Calling with Axios 🚀</h2>
        <p className="s-desc">Axios ek external library hai jo data ko automatically parse karti hai aur Interceptors provide karti hai.</p>

        <div className="tw" style={{ marginBottom: "1.5rem" }}>
          <table>
            <thead><tr><th>Feature</th><th>Fetch (Built-in)</th><th>Axios (Library)</th></tr></thead>
            <tbody>
              <tr><td>JSON Parsing</td><td>Manual (.json())</td><td><span className="pill" style={{ background: "rgba(6,214,160,.15)", color: "var(--green)" }}>Automatic</span></td></tr>
              <tr><td>Error Handling</td><td>Check response.ok</td><td><span className="pill" style={{ background: "rgba(6,214,160,.15)", color: "var(--green)" }}>Auto throws error</span></td></tr>
            </tbody>
          </table>
        </div>

        <div className="cb" style={{ marginBottom: "1.5rem" }}>
          <span className="lb">Axios Interceptor</span>
          <pre>{`axios.interceptors.request.use(config => {
  config.headers.Authorization = 'Bearer token';
  return config;
});`}</pre>
        </div>
      </section>

      <hr className="div" />

      <section className="section">
        <div className="s-tag">Redux & Thunk</div>
        <h2 className="s-title">Redux Core Concepts 📦</h2>
        
        <div className="g3" style={{ marginBottom: "1.5rem" }}>
          <div className="cc blue"><div className="ci">💾</div><div className="ct">Store</div><div className="cd">App ki main database (Global State) jahan sara data rehta hai.</div></div>
          <div className="cc green"><div className="ci">⚙️</div><div className="ct">Reducer</div><div className="cd">Pure functions jo state ko update karte hain instructions ke mutabiq.</div></div>
          <div className="cc yellow"><div className="ci">✉️</div><div className="ct">Action</div><div className="cd">Ek object jo batata hai kya tabdeeli karni hai: <code>{`{type, payload}`}</code></div></div>
        </div>

        <h3 style={{ fontFamily: "'Baloo Bhaijaan 2',cursive", margin: "1.5rem 0 0.8rem", color: "var(--accent)" }}>Redux Thunk: Async Middleware ⚡</h3>
        <p className="s-desc">Redux simple objects ko samajhta hai. Thunk middleware humein <strong>functions</strong> dispatch karne ki ijazat deta hai taake hum async API calls handle kar sakein.</p>

        <div className="steps" style={{ marginBottom: "1.5rem" }}>
          <div className="step"><div className="sn">1</div><div><div className="st">FETCH_START</div><div className="sd">Loading spinner show karein.</div></div></div>
          <div className="step"><div className="sn">2</div><div><div className="st">API Execution</div><div className="sd">Wait for data from backend.</div></div></div>
          <div className="step"><div className="sn">3</div><div><div className="st">SUCCESS / FAIL</div><div className="sd">Data store mein save karein ya error dikhayein.</div></div></div>
        </div>
      </section>

      <hr className="div" />

      <section className="section">
        <div className="s-tag">Practice Quiz</div>
        <h2 className="s-title">Quiz — React APIs Samjha? 🧩</h2>
        <QuizSection title="" questions={quizData} />
      </section>
    </>
  );
}
