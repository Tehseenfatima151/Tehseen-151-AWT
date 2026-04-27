import { useState } from "react";

function QuizSection() {
  const qs = [
    { q: "REST API mein GET request ka kya kaam hai?", opts: ["Naya record banao", "Data retrieve karo", "Data delete karo", "Data update karo"], ans: 1 },
    { q: "Online Bookstore API mein books update karne ka sahi endpoint kaun sa hai?", opts: ["/updateBook/10", "/books/update/10", "/books/10", "/editBooks"], ans: 2 },
    { q: "REST API design mein verbs use karna chahiye ya nouns?", opts: ["Verbs — /getBooks", "Nouns — /books", "Koi farq nahi", "Dono use karo"], ans: 1 },
    { q: "HTTP status code 404 ka matlab kya hai?", opts: ["Data create ho gaya", "Server error", "Resource not found", "Request successful"], ans: 2 },
    { q: "Postman kya kaam aata hai?", opts: ["Code likhne ke liye", "Database banana ke liye", "API test karne ke liye", "UI design ke liye"], ans: 2 },
  ];
  const [answers, setAnswers] = useState({});
  const allDone = Object.keys(answers).length === qs.length;
  const score = Object.values(answers).filter(Boolean).length;
  const pick = (qi, oi) => {
    if (answers[qi] !== undefined) return;
    setAnswers(prev => ({ ...prev, [qi]: oi === qs[qi].ans }));
  };
  return (
    <>
      {qs.map((q, qi) => (
        <div key={qi} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.2rem", marginBottom: "0.9rem" }}>
          <div style={{ fontFamily: "'Baloo Bhaijaan 2',cursive", fontWeight: 700, marginBottom: "0.85rem" }}>
            <span style={{ color: "var(--accent)", marginRight: "0.35rem" }}>Q{qi + 1}.</span>{q.q}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {q.opts.map((o, oi) => {
              const done = answers[qi] !== undefined;
              const isCorrect = oi === q.ans;
              let bg = "var(--card2)", border = "var(--border)", color = "var(--text)";
              if (done && isCorrect) { bg = "rgba(6,214,160,0.2)"; border = "var(--green)"; color = "var(--green)"; }
              else if (done && !answers[qi] && oi !== q.ans) { bg = "rgba(230,57,70,0.15)"; border = "var(--red)"; color = "#ff8b94"; }
              return (
                <div key={oi} onClick={() => pick(qi, oi)}
                  style={{ padding: "0.55rem 0.95rem", borderRadius: 9, border: `1px solid ${border}`, cursor: done ? "default" : "pointer", fontSize: "0.86rem", background: bg, color, transition: "all 0.2s" }}>
                  {String.fromCharCode(65 + oi)}) {o}
                </div>
              );
            })}
          </div>
          {answers[qi] !== undefined && (
            <div style={{ marginTop: "0.45rem", fontSize: "0.82rem", fontWeight: 600, color: answers[qi] ? "var(--green)" : "#ff8b94" }}>
              {answers[qi] ? "✅ Bilkul sahi! Shabash!" : "❌ Galat — sahi jawab green mein dekho!"}
            </div>
          )}
        </div>
      ))}
      {allDone && (
        <div style={{ background: "var(--card)", border: "1px solid var(--accent)", borderRadius: 14, padding: "1.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem" }}>🏆</div>
          <div style={{ fontFamily: "'Baloo Bhaijaan 2',cursive", fontSize: "1.1rem", fontWeight: 800, marginTop: "0.5rem" }}>
            {score === 5 ? "🌟 Perfect 5/5! Aap REST Expert ho!" : score >= 4 ? `🎉 ${score}/5 — Bohat acha!` : `📚 ${score}/5 — Dobara parho!`}
          </div>
        </div>
      )}
    </>
  );
}

export default function Lecture07() {
  return (
    <>
      {/* Part 1: REST API kya hai */}
      <section className="section">
        <div className="s-tag">Part 1 — 0 se 40 Minute</div>
        <h2 className="s-title">REST API kya hoti hai? 📡</h2>
        <p className="s-desc">API (Application Programming Interface) alag software systems ko aapas mein communicate karne deta hai. Jaise Foodpanda ya Careem — app server se API ke zariye baat karta hai!</p>

        <div className="g3" style={{ marginBottom: "1.5rem" }}>
          <div className="cc blue"><div className="ci">📡</div><div className="ct">API kya hai?</div><div className="cd">Rules ka ek set jo software systems ko communicate karne deta hai. Waiter ki tarah — aap order do, kitchen response de!</div></div>
          <div className="cc green"><div className="ci">🌐</div><div className="ct">REST kya hai?</div><div className="cd">Representational State Transfer — web services design karne ka architectural style, HTTP protocol use karta hai.</div></div>
          <div className="cc yellow"><div className="ci">📋</div><div className="ct">REST Principles</div><div className="cd">1. Stateless<br />2. Client-Server<br />3. Uniform Interface<br />4. Resource-based</div></div>
        </div>

        <h3 style={{ fontFamily: "'Baloo Bhaijaan 2',cursive", margin: "1.5rem 0 0.8rem", color: "var(--accent)" }}>🔄 HTTP Methods — Ek Nazar Mein</h3>
        <div className="tw" style={{ marginBottom: "1.5rem" }}>
          <table>
            <thead><tr><th>Method</th><th>Kaam</th><th>Real-life Misal</th></tr></thead>
            <tbody>
              <tr><td><span className="pill" style={{ background: "rgba(6,214,160,.15)", color: "var(--green)" }}>GET</span></td><td>Data retrieve karo</td><td>Product list dekho</td></tr>
              <tr><td><span className="pill">POST</span></td><td>Naya data create karo</td><td>User register karo</td></tr>
              <tr><td><span className="pill" style={{ background: "rgba(255,209,102,.15)", color: "var(--yellow)" }}>PUT</span></td><td>Data update karo</td><td>Profile update karo</td></tr>
              <tr><td><span className="pill" style={{ background: "rgba(230,57,70,.15)", color: "#ff8b94" }}>DELETE</span></td><td>Data delete karo</td><td>Account delete karo</td></tr>
            </tbody>
          </table>
        </div>

        <div className="alert tip"><span className="ai">💡</span><div className="ab"><strong>Real-Life Misal!</strong> Facebook login mein POST use hota hai — kyunki credentials request body mein secure tarike se bheje jaate hain, URL mein nahi!</div></div>
      </section>

      <hr className="div" />

      {/* Part 2: Case Study — Online Bookstore */}
      <section className="section">
        <div className="s-tag">Part 2 — 40 se 80 Minute</div>
        <h2 className="s-title">Case Study — Online Bookstore API 📚</h2>
        <p className="s-desc">Hum ek Online Bookstore ke liye REST API design karenge. Step by step — pehle resources identify karo, phir endpoints banao!</p>

        <div className="g3" style={{ marginBottom: "1.5rem" }}>
          <div className="cc blue"><div className="ci">👤</div><div className="ct">Resource 1: Users</div><div className="cd">User registration, login, profile management.</div></div>
          <div className="cc green"><div className="ci">📖</div><div className="ct">Resource 2: Books</div><div className="cd">Books add karo, dekho, update karo, delete karo.</div></div>
          <div className="cc yellow"><div className="ci">🛒</div><div className="ct">Resource 3: Orders</div><div className="cd">Orders create karo aur dekho.</div></div>
        </div>

        <h3 style={{ fontFamily: "'Baloo Bhaijaan 2',cursive", margin: "1.5rem 0 0.8rem", color: "var(--green)" }}>📋 Bookstore API Endpoints</h3>
        <div className="tw" style={{ marginBottom: "1.5rem" }}>
          <table>
            <thead><tr><th>Operation</th><th>Method</th><th>Endpoint</th></tr></thead>
            <tbody>
              <tr><td>Sab books dekho</td><td><span className="pill" style={{ background: "rgba(6,214,160,.15)", color: "var(--green)" }}>GET</span></td><td><span className="pill">/books</span></td></tr>
              <tr><td>Ek book dekho</td><td><span className="pill" style={{ background: "rgba(6,214,160,.15)", color: "var(--green)" }}>GET</span></td><td><span className="pill">/books/:id</span></td></tr>
              <tr><td>Naya book add karo</td><td><span className="pill">POST</span></td><td><span className="pill">/books</span></td></tr>
              <tr><td>Book update karo</td><td><span className="pill" style={{ background: "rgba(255,209,102,.15)", color: "var(--yellow)" }}>PUT</span></td><td><span className="pill">/books/:id</span></td></tr>
              <tr><td>Book delete karo</td><td><span className="pill" style={{ background: "rgba(230,57,70,.15)", color: "#ff8b94" }}>DELETE</span></td><td><span className="pill">/books/:id</span></td></tr>
              <tr><td>Naya order</td><td><span className="pill">POST</span></td><td><span className="pill">/orders</span></td></tr>
            </tbody>
          </table>
        </div>

        <h3 style={{ fontFamily: "'Baloo Bhaijaan 2',cursive", margin: "1.5rem 0 0.8rem", color: "var(--accent)" }}>⚡ Design Best Practices</h3>
        <div className="steps">
          <div className="step"><div className="sn">1</div><div><div className="st">Nouns use karo — Verbs nahi!</div><div className="sd">✅ /books &nbsp;&nbsp; ❌ /getBooks &nbsp;&nbsp; ❌ /deleteBook</div></div></div>
          <div className="step"><div className="sn">2</div><div><div className="st">Plural form use karo</div><div className="sd">✅ /books &nbsp;&nbsp; ❌ /book</div></div></div>
          <div className="step"><div className="sn">3</div><div><div className="st">Proper HTTP Status Codes use karo</div><div className="sd">200 OK, 201 Created, 404 Not Found, 500 Server Error</div></div></div>
          <div className="step"><div className="sn">4</div><div><div className="st">JSON format mein response do</div><div className="sd">{"{ \"id\": 1, \"title\": \"Clean Code\", \"price\": 500 }"}</div></div></div>
        </div>
      </section>

      <hr className="div" />

      {/* Part 3: Implementation */}
      <section className="section">
        <div className="s-tag">Part 3 — 80 se 100 Minute</div>
        <h2 className="s-title">Practical Implementation — Node.js + Express 💻</h2>
        <p className="s-desc">Ab hum step-by-step Books API implement karenge — Node.js aur Express.js use karke!</p>

        <div className="cb" style={{ marginBottom: "1.5rem" }}>
          <span className="lb">server.js — Setup</span>
          <pre>{`const express = require('express');
const app = express();
app.use(express.json());

let books = [];

// GET — Sab books
app.get('/books', (req, res) => {
    res.json(books);
});

// POST — Naya book
app.post('/books', (req, res) => {
    const book = req.body;
    books.push(book);
    res.status(201).json(book);
});

// GET — Ek book by ID
app.get('/books/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const book = books.find(b => b.id === id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
});

// PUT — Book update
app.put('/books/:id', (req, res) => {
    const index = books.findIndex(b => b.id == req.params.id);
    if (index === -1) return res.status(404).json({ message: "Book not found" });
    books[index] = req.body;
    res.json(books[index]);
});

// DELETE — Book delete
app.delete('/books/:id', (req, res) => {
    books = books.filter(b => b.id != req.params.id);
    res.json({ message: "Book deleted" });
});

app.listen(3000, () => console.log("Server running on port 3000"));`}</pre>
        </div>

        <h3 style={{ fontFamily: "'Baloo Bhaijaan 2',cursive", margin: "1.5rem 0 0.8rem", color: "var(--yellow)" }}>🔍 Advanced Concepts</h3>
        <div className="g3">
          <div className="cc yellow"><div className="ci">🔎</div><div className="ct">Query Parameters</div><div className="cd"><code style={{ color: "var(--accent)" }}>GET /books?author=Ali</code><br />Filter results ke liye use hota hai.</div></div>
          <div className="cc blue"><div className="ci">📄</div><div className="ct">Pagination</div><div className="cd"><code style={{ color: "var(--accent)" }}>GET /books?page=1&limit=10</code><br />Large data ko pages mein divide karo.</div></div>
          <div className="cc green"><div className="ci">🔐</div><div className="ct">Authentication</div><div className="cd">JWT tokens se secure APIs banao. Login → Token milta hai → Har request mein token bhejo.</div></div>
        </div>

        <div className="alert exam" style={{ marginTop: "1.5rem" }}>
          <span className="ai">🎯</span>
          <div className="ab"><strong>Student Activity — Postman se Test Karo!</strong><br />1. POST se 3 books add karo<br />2. GET se sab books retrieve karo<br />3. PUT se ek book update karo<br />4. DELETE se ek book delete karo</div>
        </div>
      </section>

      <hr className="div" />

      {/* Part 4: Security */}
      <section className="section">
        <div className="s-tag">Part 4 — 7.3 REST API Security</div>
        <h2 className="s-title">REST API Security — Hifazat Karo! 🔐</h2>
        <p className="s-desc">Agar APIs secure nahi hain to hackers data chura sakte hain, servers overload kar sakte hain, aur unauthorized access ho sakta hai!</p>

        <div className="g2" style={{ marginBottom: "1.5rem" }}>
          <div className="cc red">
            <div className="ci">🌍</div><div className="ct">CORS — Cross-Origin Resource Sharing</div>
            <div className="cd">Browser security mechanism jo control karta hai ke kaun si domains API access kar sakti hain.<br /><br />✅ Sirf trusted domains allow karo<br />❌ Kabhi bhi * use mat karo sensitive APIs mein!</div>
          </div>
          <div className="cc yellow">
            <div className="ci">💉</div><div className="ct">XSS — Cross-Site Scripting</div>
            <div className="cd">Attacker malicious script inject karta hai website mein.<br /><br />🛡️ Prevention:<br />• Input validation<br />• Output encoding<br />• HTTPOnly cookies</div>
          </div>
          <div className="cc red">
            <div className="ci">🌊</div><div className="ct">DDoS Attack</div>
            <div className="cd">Hazaron fake requests server ko overload kar deti hain.<br /><br />🛡️ Prevention:<br />• Rate limiting<br />• CAPTCHA<br />• API Gateway / CDN</div>
          </div>
          <div className="cc blue">
            <div className="ci">🔑</div><div className="ct">Authentication vs Authorization</div>
            <div className="cd"><strong style={{ color: "var(--accent)" }}>Authentication:</strong> Tum kaun ho? (ID card)<br /><strong style={{ color: "var(--green)" }}>Authorization:</strong> Tum kya kar sakte ho? (Lab access)<br /><br />Dono zaroori hain!</div>
          </div>
        </div>

        <div className="alert tip">
          <span className="ai">💡</span>
          <div className="ab"><strong>University Misal:</strong> ID Card Check = Authentication (tum kaun ho). Lab Access = Authorization (kya access hai). CCTV = Security Policies. Visitor Log = Session Handling.</div>
        </div>
      </section>

      <hr className="div" />

      {/* Quiz */}
      <section className="section">
        <div className="s-tag">Practice Quiz</div>
        <h2 className="s-title">Quiz — REST API Seekha? 🧩</h2>
        <p className="s-desc">Click karke jawab reveal karo — fauran pata chale sahi hai ya galat!</p>
        <QuizSection />
      </section>

      <hr className="div" />

      {/* Recap */}
      <section className="section">
        <div className="s-tag">Quick Recap</div>
        <h2 className="s-title">Key Takeaways — Yaad Raho! 🔑</h2>
        <div className="steps">
          <div className="step"><div className="sn">1</div><div><div className="st">REST API = Standard Web Communication</div><div className="sd">HTTP methods (GET/POST/PUT/DELETE) se resources manage karo.</div></div></div>
          <div className="step"><div className="sn">2</div><div><div className="st">URI mein Nouns use karo</div><div className="sd">/books ✅ — /getBooks ❌. HTTP method action batata hai!</div></div></div>
          <div className="step"><div className="sn">3</div><div><div className="st">Status Codes zaroori hain</div><div className="sd">200 OK, 201 Created, 404 Not Found, 500 Server Error.</div></div></div>
          <div className="step"><div className="sn">4</div><div><div className="st">Security multi-layered honi chahiye</div><div className="sd">CORS + XSS protection + DDoS prevention + JWT authentication.</div></div></div>
          <div className="step"><div className="sn">5</div><div><div className="st">Postman se test karo</div><div className="sd">Har endpoint ko Postman mein test karo deploy karne se pehle!</div></div></div>
        </div>
        <div className="alert exam" style={{ marginTop: "1.5rem" }}>
          <span className="ai">🎯</span>
          <div className="ab"><strong>Exam Tip!</strong> "REST stateless kyun?" → Har request mein apni info hoti hai — scalability badhti hai.<br />"CORS kya hai?" → Browser security jo cross-origin requests control karti hai.</div>
        </div>
      </section>
    </>
  );
}
