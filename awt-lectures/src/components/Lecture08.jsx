import { useState } from "react";

function QuizSection() {
  const qs = [
    { q: "JWT ki 3 parts kya hain?", opts: ["Username, Password, Role", "Header, Payload, Signature", "Token, Key, Algorithm", "Login, Verify, Access"], ans: 1 },
    { q: "JWT ko 'stateless' kyun kaha jaata hai?", opts: ["Server session store karta hai", "Token automatically expire hota hai", "Server koi state store nahi karta", "Client password yaad rakhta hai"], ans: 2 },
    { q: "JWT mein Payload kya hota hai?", opts: ["Encryption key", "Algorithm ki information", "User data jaise userId, role, expiry", "Digital signature"], ans: 2 },
    { q: "Agar JWT signature invalid ho to kya hoga?", opts: ["Token valid rahega", "Access grant ho jaayega", "Server token reject kar dega", "New token generate hoga"], ans: 2 },
    { q: "JWT store karne ke liye kaunsa best practice hai?", opts: ["URL mein paste karo", "Public place mein likho", "HttpOnly cookie ya secure storage use karo", "Database mein plain text mein likho"], ans: 2 },
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
            {score === 5 ? "🌟 Perfect! Aap JWT Expert ho!" : score >= 4 ? `🎉 ${score}/5 — Bohat acha!` : `📚 ${score}/5 — Dobara parho!`}
          </div>
        </div>
      )}
    </>
  );
}

export default function Lecture08() {
  return (
    <>
      {/* Part 1: Authentication vs Authorization */}
      <section className="section">
        <div className="s-tag">Part 1 — 0 se 30 Minute</div>
        <h2 className="s-title">Authentication aur Authorization kya hai? 🔐</h2>
        <p className="s-desc">Pehle yeh samjho — Authentication aur Authorization mein farq kya hai? Dono alag cheezein hain!</p>

        <div className="g2" style={{ marginBottom: "1.5rem" }}>
          <div className="cc blue">
            <div className="ci">🪪</div><div className="ct">Authentication (AuthN)</div>
            <div className="cd"><strong style={{ color: "var(--accent)" }}>Tum kaun ho?</strong><br /><br />• Username &amp; password<br />• OTP (One-Time Password)<br />• Biometrics (fingerprint)<br /><br />Misal: Facebook login</div>
          </div>
          <div className="cc green">
            <div className="ci">🔑</div><div className="ct">Authorization (AuthZ)</div>
            <div className="cd"><strong style={{ color: "var(--green)" }}>Tum kya kar sakte ho?</strong><br /><br />• Admin → sab kuch<br />• Student → sirf apna data<br />• Teacher → marks upload<br /><br />Misal: University lab access</div>
          </div>
        </div>

        <div className="alert tip"><span className="ai">💡</span><div className="ab"><strong>University Misal:</strong> ID Card Check = Authentication (tum kaun ho). Lab ya Admin Room Access = Authorization (kya access hai). Pehle authenticate karo, phir authorize!</div></div>

        <h3 style={{ fontFamily: "'Baloo Bhaijaan 2',cursive", margin: "1.8rem 0 0.8rem", color: "var(--yellow)" }}>🤔 Traditional Session vs JWT</h3>
        <div className="g2">
          <div className="cc red">
            <div className="ci">😓</div><div className="ct">Traditional Session-Based</div>
            <div className="cd">❌ Server session store karta hai<br />❌ Cookies use karta hai<br />❌ Scalable nahi — large systems mein problem<br />❌ Microservices mein mushkil</div>
          </div>
          <div className="cc green">
            <div className="ci">✅</div><div className="ct">JWT Token-Based (Recommended)</div>
            <div className="cd">✅ Server kuch store nahi karta<br />✅ Stateless — perfectly REST-friendly<br />✅ Scalable — multiple servers work<br />✅ Mobile apps ke saath bhi kaam karta hai</div>
          </div>
        </div>
      </section>

      <hr className="div" />

      {/* Part 2: JWT Structure */}
      <section className="section">
        <div className="s-tag">Part 2 — 30 se 60 Minute</div>
        <h2 className="s-title">JWT Structure — Iske Teen Parts! 🧩</h2>
        <p className="s-desc">JWT (JSON Web Token) ek compact, secure token hai jo client aur server ke beech information transmit karta hai. Iske teen parts hote hain!</p>

        <div className="flow" style={{ marginBottom: "1.5rem" }}>
          <div className="fb" style={{ borderColor: "var(--blue)", color: "var(--accent)" }}>Header<br /><small style={{ color: "var(--muted)", fontWeight: 400 }}>Algorithm info</small></div>
          <span className="fa">.</span>
          <div className="fb" style={{ borderColor: "var(--green)", color: "var(--green)" }}>Payload<br /><small style={{ color: "var(--muted)", fontWeight: 400 }}>User data</small></div>
          <span className="fa">.</span>
          <div className="fb" style={{ borderColor: "var(--yellow)", color: "var(--yellow)" }}>Signature<br /><small style={{ color: "var(--muted)", fontWeight: 400 }}>Security stamp</small></div>
        </div>

        <div className="g3" style={{ marginBottom: "1.5rem" }}>
          <div className="cc blue">
            <div className="ci">📋</div><div className="ct">1. Header</div>
            <div className="cd">Token type aur algorithm ki info:<br /><br /><code style={{ color: "var(--accent)", fontSize: "0.8rem" }}>{`{ "alg": "HS256", "typ": "JWT" }`}</code><br /><br />Jaise ticket ka type — VIP ya Economy?</div>
          </div>
          <div className="cc green">
            <div className="ci">📦</div><div className="ct">2. Payload</div>
            <div className="cd">User data (claims):<br /><br /><code style={{ color: "var(--green)", fontSize: "0.8rem" }}>{`{ "userId": 101, "role": "admin", "exp": 1712345678 }`}</code><br /><br />Jaise ticket pe seat number!</div>
          </div>
          <div className="cc yellow">
            <div className="ci">🔏</div><div className="ct">3. Signature</div>
            <div className="cd">Token tamper nahi hua — verify karta hai.<br /><br />Header + Payload + Secret Key se banta hai.<br /><br />Jaise official stamp on ticket!</div>
          </div>
        </div>

        <div className="cb">
          <span className="lb">JWT Format</span>
          <pre>{`JWT = Base64(Header) + "." + Base64(Payload) + "." + Signature

// Real Example:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJ1c2VySWQiOjEwMSwicm9sZSI6ImFkbWluIn0.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`}</pre>
        </div>

        <div className="alert tip" style={{ marginTop: "1rem" }}>
          <span className="ai">🎟️</span>
          <div className="ab"><strong>Movie Ticket Analogy!</strong> Header = Ticket type (Cinema ka naam). Payload = Tumhara seat number. Signature = Official stamp (fake nahi kar sakte). Ticket dikhao → andar jao — baar baar verify nahi!</div>
        </div>
      </section>

      <hr className="div" />

      {/* Part 3: JWT Flow */}
      <section className="section">
        <div className="s-tag">Part 3 — 60 se 90 Minute</div>
        <h2 className="s-title">JWT Authentication Flow — Step by Step! 🔄</h2>
        <p className="s-desc">Kaise JWT kaam karta hai REST APIs mein — pura flow samjho!</p>

        <div className="steps" style={{ marginBottom: "1.5rem" }}>
          <div className="step"><div className="sn">1</div><div><div className="st">User Login Karta Hai</div><div className="sd">Username aur password server ko bhejta hai POST /login se.</div></div></div>
          <div className="step"><div className="sn">2</div><div><div className="st">Server Credentials Verify Karta Hai</div><div className="sd">Database se username/password match karta hai.</div></div></div>
          <div className="step"><div className="sn">3</div><div><div className="st">Server JWT Generate Karta Hai</div><div className="sd">Token bana ke client ko bhejta hai — {"{ token: \"eyJhbG...\" }"}.</div></div></div>
          <div className="step"><div className="sn">4</div><div><div className="st">Client Token Store Karta Hai</div><div className="sd">LocalStorage ya HttpOnly cookie mein save karta hai.</div></div></div>
          <div className="step"><div className="sn">5</div><div><div className="st">Protected Route Access Karo</div><div className="sd">Har request mein token bhejo: Authorization: Bearer &lt;token&gt;</div></div></div>
          <div className="step"><div className="sn">6</div><div><div className="st">Server Token Verify Karta Hai</div><div className="sd">Signature check karta hai, expiry check karta hai — access grant ya deny!</div></div></div>
        </div>

        <div className="cb">
          <span className="lb">Login Request &amp; Response</span>
          <pre>{`// Step 1: Client Login Request
POST /login
{
  "username": "Ali",
  "password": "1234"
}

// Step 3: Server Response (JWT)
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Step 5: Protected Route Access
GET /api/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}</pre>
        </div>
      </section>

      <hr className="div" />

      {/* Part 4: Advantages & Best Practices */}
      <section className="section">
        <div className="s-tag">Part 4 — 90 se 120 Minute</div>
        <h2 className="s-title">JWT ke Fayde, Nuqsanaat aur Best Practices ⚖️</h2>

        <div className="g2" style={{ marginBottom: "1.5rem" }}>
          <div className="cc green">
            <div className="ci">✅</div><div className="ct">JWT ke Fayde</div>
            <div className="cd">✅ Stateless — server pe kuch store nahi<br />✅ Scalable — alag servers bhi verify kar sakte hain<br />✅ Fast authentication<br />✅ Multiple domains mein kaam karta hai<br />✅ Mobile apps ke saath perfectly kaam karta hai</div>
          </div>
          <div className="cc red">
            <div className="ci">❌</div><div className="ct">JWT ke Nuqsanaat</div>
            <div className="cd">❌ Token easily revoke nahi hota<br />❌ Token size bara ho sakta hai<br />❌ Agar chori ho jaye — expire hone tak risk<br />❌ Payload readable hai — sensitive data mat dalo</div>
          </div>
        </div>

        <h3 style={{ fontFamily: "'Baloo Bhaijaan 2',cursive", margin: "1.5rem 0 0.8rem", color: "var(--accent)" }}>🔒 Security Best Practices</h3>
        <div className="g4">
          <div className="cc blue"><div className="ci">🔒</div><div className="ct">HTTPS Use Karo</div><div className="cd">Token theft se bachao — sirf encrypted connection pe send karo.</div></div>
          <div className="cc yellow"><div className="ci">⏳</div><div className="ct">Expiry Time Set Karo</div><div className="cd">Tokens expire honay chahiye — long-living tokens risk hain!</div></div>
          <div className="cc green"><div className="ci">🔑</div><div className="ct">Strong Secret Key</div><div className="cd">Signature ke liye complex secret key use karo — hacking se bachao.</div></div>
          <div className="cc red"><div className="ci">🔄</div><div className="ct">Refresh Tokens</div><div className="cd">Long sessions ke liye refresh tokens use karo — security maintain karo.</div></div>
        </div>

        <div className="alert warn" style={{ marginTop: "1.5rem" }}>
          <span className="ai">⚠️</span>
          <div className="ab"><strong>Important!</strong> Payload mein sensitive data mat dalo (jaise password) — kyunki payload base64 encode hai, easily readable hai. Sirf userId, role, expiry daalo!</div>
        </div>
      </section>

      <hr className="div" />

      {/* Quiz */}
      <section className="section">
        <div className="s-tag">Practice Quiz</div>
        <h2 className="s-title">Quiz — JWT Samjha? 🧩</h2>
        <p className="s-desc">Click karke jawab reveal karo!</p>
        <QuizSection />
      </section>

      <hr className="div" />

      {/* Recap */}
      <section className="section">
        <div className="s-tag">Quick Recap</div>
        <h2 className="s-title">Key Takeaways — Yaad Raho! 🔑</h2>
        <div className="steps">
          <div className="step"><div className="sn">1</div><div><div className="st">JWT = Header + Payload + Signature</div><div className="sd">Teen parts — har ek ka alag kaam hai!</div></div></div>
          <div className="step"><div className="sn">2</div><div><div className="st">REST ke saath JWT perfect hai</div><div className="sd">Kyunki JWT stateless hai — REST bhi stateless hai!</div></div></div>
          <div className="step"><div className="sn">3</div><div><div className="st">Authentication ≠ Authorization</div><div className="sd">Pehle verify karo kaun ho (AuthN), phir kya kar sakte ho (AuthZ).</div></div></div>
          <div className="step"><div className="sn">4</div><div><div className="st">HTTPS + Expiry + Strong Key = Secure JWT</div><div className="sd">Yeh teen cheezein hamesha yaad rakho!</div></div></div>
          <div className="step"><div className="sn">5</div><div><div className="st">Payload readable hai</div><div className="sd">Sensitive data payload mein mat dalo — sirf userId, role, expiry!</div></div></div>
        </div>
        <div className="alert exam" style={{ marginTop: "1.5rem" }}>
          <span className="ai">🎯</span>
          <div className="ab"><strong>Exam Tip!</strong> "JWT kyun use karte hain REST mein?" → Kyunki REST stateless hai, JWT server pe session store karne ki zaroorat khatam karta hai — scalability badhti hai!<br /><br />"JWT ke 3 parts?" → Header (algorithm), Payload (user data), Signature (tamper protection).</div>
        </div>
      </section>
    </>
  );
}
