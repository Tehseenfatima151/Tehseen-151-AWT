import React from 'react';
import QuizSection from './QuizSection';

export default function Lecture13() {
  const quizData = [
    { question: "JSX must return:", options: ["Multiple siblings", "Exactly one root element", "Only <div> tags", "A string"], correctAnswer: 1 },
    { question: "Controlled input requires:", options: ["Only value", "value + onChange", "useRef only", "className"], correctAnswer: 1 },
    { question: "React mein 'useState' kya hai?", options: ["Routing mechanism", "Hook for state management", "API fetcher", "Styling tool"], correctAnswer: 1 },
    { question: "JSX mein inline styles likhne ka tarika kya hai?", options: ["style='color: red'", "style={color: 'red'}", "style={{color: 'red'}}", "css={{color: 'red'}}"], correctAnswer: 2 },
    { question: "Prop drilling se bachne ke liye konsa hook use hota hai?", options: ["useState", "useEffect", "useRef", "useContext"], correctAnswer: 3 }
  ];

  return (
    <>
      <section className="section">
        <div className="s-tag">Introduction</div>
        <h2 className="s-title">Why React? 🤔</h2>
        <p className="s-desc">
          React UI building ko components mein divide karta hai. Jab bhi data (state) change hota hai, React automatically UI ko update kar deta hai efficiently. Apps ek "component tree" ki tarah hoti hain jahan data upar se niche (props) jata hai aur events niche se upar (callbacks).
        </p>

        <div className="alert tip" style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
          <span className="ai">⚛️</span>
          <div className="ab"><strong>React = Components + State + Virtual DOM</strong></div>
        </div>
      </section>

      <hr className="div" />

      <section className="section">
        <div className="s-tag">JSX Syntax</div>
        <h2 className="s-title">JSX (React Language) Done Right 📝</h2>
        <div className="g3" style={{ marginBottom: "1.5rem" }}>
          <div className="cc blue">
            <div className="ci">1️⃣</div><div className="ct">Single Parent</div>
            <div className="cd">Hamesha ek <code>&lt;div&gt;</code> ya <code>&lt;&gt;</code> (Fragment) mein wrap karein.</div>
          </div>
          <div className="cc green">
            <div className="ci">2️⃣</div><div className="ct">Class Name</div>
            <div className="cd">HTML wala 'class' nahi, <code>className</code> use hota hai.</div>
          </div>
          <div className="cc yellow">
            <div className="ci">3️⃣</div><div className="ct">JS Expressions</div>
            <div className="cd">Variables aur logic curly braces <code>{`{ }`}</code> mein likhein.</div>
          </div>
        </div>
      </section>

      <hr className="div" />

      <section className="section">
        <div className="s-tag">Forms</div>
        <h2 className="s-title">Controlled vs Uncontrolled Forms 📝</h2>
        <div className="g2" style={{ marginBottom: "1.5rem" }}>
          <div className="cc blue">
            <div className="ci">🎛️</div><div className="ct">Controlled</div>
            <div className="cd">React state hi "Single Source of Truth" hai. Input ki har tabdeeli state update karti hai. Best for validation.</div>
          </div>
          <div className="cc green">
            <div className="ci">🚀</div><div className="ct">Uncontrolled</div>
            <div className="cd">Data DOM ke pas hota hai. Hum <code>useRef()</code> ke zariye value read karte hain. Best for simple forms.</div>
          </div>
        </div>
      </section>

      <hr className="div" />

      <section className="section">
        <div className="s-tag">Hooks</div>
        <h2 className="s-title">Hooks Crash Pack (Functional Superpowers) ⚡</h2>
        
        <div className="g2" style={{ marginBottom: "1.5rem" }}>
          <div className="cc blue">
            <div className="ci">💾</div><div className="ct">useState</div>
            <div className="cd">
              Functional component mein state handle karne ke liye. Jab state badalti hai, UI update hota hai.<br/><br/>
              <code>const [val, setVal] = useState(0);</code>
            </div>
          </div>
          <div className="cc green">
            <div className="ci">⚡</div><div className="ct">useEffect</div>
            <div className="cd">
              Side-effects ke liye (API calls, timers). Empty dependency array <code>[]</code> = "Run only once".<br/><br/>
              <code>useEffect(() =&gt; {`{...}`}, []);</code>
            </div>
          </div>
          <div className="cc yellow">
            <div className="ci">🎯</div><div className="ct">useRef</div>
            <div className="cd">
              Direct DOM elements ko access karne ya values ko persist karne ke liye (bina re-render ke).<br/><br/>
              <code>const inputRef = useRef(null);</code>
            </div>
          </div>
          <div className="cc red">
            <div className="ci">🌍</div><div className="ct">useContext</div>
            <div className="cd">
              "Prop Drilling" se bachne ke liye global state share karne ka tarika (jaise Theme ya Auth).<br/><br/>
              <code>const theme = useContext(ThemeCtx);</code>
            </div>
          </div>
        </div>
      </section>

      <hr className="div" />

      <section className="section">
        <div className="s-tag">Practice Quiz</div>
        <h2 className="s-title">Quiz — React Core Samjha? 🧩</h2>
        <QuizSection title="" questions={quizData} />
      </section>
    </>
  );
}
