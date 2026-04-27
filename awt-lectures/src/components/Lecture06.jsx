import { useState } from "react";

function QuizSection() {
  const qs = [
    { q: "MVC mein 'View' ka kya kaam hota hai?", opts: ["Data store karta hai", "Logic handle karta hai", "Data users ko dikhata hai", "Database se connect karta hai"], ans: 2 },
    { q: "REST stateless hone ka kya matlab hai?", opts: ["Server data store karta hai", "Har request mein apni saari info honi chahiye", "Server pehle requests yaad rakhta hai", "Sirf GET requests allow hoti hain"], ans: 1 },
    { q: "Kon sa HTTP method idempotent NAHI hai?", opts: ["GET", "PUT", "DELETE", "POST"], ans: 3 },
    { q: "Sahi REST URI kaun sa hai?", opts: ["/getStudents", "/createStudent", "/students", "/studentList"], ans: 2 },
    { q: "Bootstrap ka grid system kitne columns par based hai?", opts: ["6 columns", "8 columns", "10 columns", "12 columns"], ans: 3 },
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
              const isSelected = done && answers[qi] !== undefined && (isCorrect || (answers[qi] === false && oi === q.opts.indexOf(q.opts[oi])));
              let bg = "var(--card2)", border = "var(--border)", color = "var(--text)";
              if (done && isCorrect) { bg = "rgba(6,214,160,0.2)"; border = "var(--green)"; color = "var(--green)"; }
              else if (done && answers[qi] === false && oi !== q.ans) { bg = "rgba(230,57,70,0.15)"; border = "var(--red)"; color = "#ff8b94"; }
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
            {score === 5 ? "🌟 Perfect 5/5! Aap REST Expert ho!" : score >= 4 ? `🎉 ${score}/5 — Bohat acha!` : score >= 3 ? `📚 ${score}/5 — Dobara parho!` : `💪 ${score}/5 — Koshish karo!`}
          </div>
        </div>
      )}
    </>
  );
}

export default function Lecture06() {
  return (
    <>
      {/* Part 1: View Generators */}
      <section className="section">
        <div className="s-tag">Part 1 — 0 se 30 Minute</div>
        <h2 className="s-title">View Generators kya hote hain? 🖥️</h2>
        <p className="s-desc">Web development mein View woh hissa hota hai jo users ko data dikhata hai. View Generators automatically UI files banate hain — time bachate hain aur errors kam karte hain!</p>

        <h3 style={{ fontFamily: "'Baloo Bhaijaan 2',cursive", marginBottom: "0.7rem", color: "var(--accent)" }}>📐 MVC Architecture — Ek Nazar Mein</h3>
        <div className="flow">
          <div className="fb">🗄️ Model<br /><small style={{ color: "var(--muted)", fontWeight: 400 }}>Data handle karta hai</small></div>
          <span className="fa">→</span>
          <div className="fb">🎛️ Controller<br /><small style={{ color: "var(--muted)", fontWeight: 400 }}>Logic control karta hai</small></div>
          <span className="fa">→</span>
          <div className="fb">👁️ View<br /><small style={{ color: "var(--muted)", fontWeight: 400 }}>Data dikhata hai</small></div>
        </div>

        <div className="alert tip" style={{ margin: "1.5rem 0" }}>
          <span className="ai">💡</span>
          <div className="ab"><strong>Real-Life Misal!</strong> University Management System mein: Model → Student ka database, Controller → Students fetch karta hai, View → Student list page dikhata hai.</div>
        </div>

        <div className="g2" style={{ marginBottom: "1.5rem" }}>
          <div className="cc blue">
            <div className="ci">🏗️</div>
            <div className="ct">Kya automatically banta hai?</div>
            <div className="cd">✅ List View — sab records<br />✅ Create Form — naya record<br />✅ Edit Page — record update<br />✅ Delete Confirmation</div>
          </div>
          <div className="cc green">
            <div className="ci">🛠️</div>
            <div className="ct">Popular Frameworks</div>
            <div className="cd">🐍 <strong>Django</strong> — Python<br />🐘 <strong>Laravel</strong> — PHP<br />💎 <strong>Ruby on Rails</strong><br />🔵 <strong>ASP.NET Core</strong></div>
          </div>
        </div>

        <h3 style={{ fontFamily: "'Baloo Bhaijaan 2',cursive", margin: "1.8rem 0 0.8rem", color: "var(--yellow)" }}>✨ View Generators ke Fayde</h3>
        <div className="g4">
          <div className="cc yellow"><div className="ci">⚡</div><div className="ct">Tez Development</div><div className="cd">Code automatically generate hota hai — waqt bachta hai!</div></div>
          <div className="cc red"><div className="ci">🛡️</div><div className="ct">Errors Kam</div><div className="cd">Generator se consistent code milta hai.</div></div>
          <div className="cc blue"><div className="ci">🎯</div><div className="ct">Design Consistent</div><div className="cd">Sab pages ka ek jaisa design — application professional lagti hai.</div></div>
          <div className="cc green"><div className="ci">🔧</div><div className="ct">Easy Maintenance</div><div className="cd">Ek jagah se changes karo — puri app update!</div></div>
        </div>
      </section>

      <hr className="div" />

      {/* Part 2: Bootstrap */}
      <section className="section">
        <div className="s-tag">Part 2 — 30 se 60 Minute</div>
        <h2 className="s-title">Bootstrap — UI Design Aasaan Karo! 🎨</h2>
        <p className="s-desc">Bootstrap ek front-end framework hai jo responsive websites jaldi design karne mein madad karta hai. CSS, components, aur grid system sab kuch ready milta hai!</p>

        <div className="g2" style={{ marginBottom: "1.5rem" }}>
          <div className="cc red">
            <div className="ci">😓</div><div className="ct">Bootstrap ke BINA</div>
            <div className="cd">❌ Pura CSS khud likhna padta hai<br />❌ Mobile pe theek nahi dikhta<br />❌ Different browsers mein problems<br />❌ Bohot waqt lagta hai</div>
          </div>
          <div className="cc green">
            <div className="ci">😊</div><div className="ct">Bootstrap ke SAATH</div>
            <div className="cd">✅ Professional UI jaldi ban jaata hai<br />✅ Mobile responsive by default<br />✅ Pre-built components ready<br />✅ Cross-browser compatible</div>
          </div>
        </div>

        <h3 style={{ fontFamily: "'Baloo Bhaijaan 2',cursive", margin: "1.8rem 0 0.8rem", color: "var(--yellow)" }}>📐 Bootstrap Grid System — 12 Columns!</h3>
        <div className="tw" style={{ marginBottom: "1.5rem" }}>
          <table>
            <thead><tr><th>Columns</th><th>Width</th><th>Use Case</th></tr></thead>
            <tbody>
              <tr><td><span className="pill">col-12</span></td><td>Full width — 100%</td><td>Hero sections, headings</td></tr>
              <tr><td><span className="pill">col-6</span></td><td>Half width — 50%</td><td>Do equal columns</td></tr>
              <tr><td><span className="pill">col-4</span></td><td>One-third — 33%</td><td>Teen equal columns</td></tr>
              <tr><td><span className="pill">col-3</span></td><td>Quarter — 25%</td><td>Char equal columns</td></tr>
            </tbody>
          </table>
        </div>

        <h3 style={{ fontFamily: "'Baloo Bhaijaan 2',cursive", margin: "1.5rem 0 0.8rem", color: "var(--accent)" }}>🧩 Common Bootstrap Components</h3>
        <div className="g3">
          <div className="cc blue"><div className="ci">🔘</div><div className="ct">Buttons</div><div className="cd">Primary, Secondary, Danger — sab ready-made!</div></div>
          <div className="cc green"><div className="ci">🃏</div><div className="ct">Cards</div><div className="cd">Content ko organized boxes mein dikhao.</div></div>
          <div className="cc yellow"><div className="ci">🧭</div><div className="ct">Navbar</div><div className="cd">Responsive navigation bar — mobile pe collapse!</div></div>
          <div className="cc red"><div className="ci">📋</div><div className="ct">Forms</div><div className="cd">Styled inputs, dropdowns — mobile-friendly!</div></div>
          <div className="cc accent"><div className="ci">🪟</div><div className="ct">Modals</div><div className="cd">Popup windows — confirmation, forms, details!</div></div>
          <div className="cc blue"><div className="ci">⚠️</div><div className="ct">Alerts</div><div className="cd">Success, Warning, Danger — colorful messages!</div></div>
        </div>
      </section>

      <hr className="div" />

      {/* Part 3: REST */}
      <section className="section">
        <div className="s-tag">Part 3 — 60 se 90 Minute</div>
        <h2 className="s-title">REST Architecture Principles 🌐</h2>
        <p className="s-desc">REST ka matlab hai <strong style={{ color: "var(--accent)" }}>Representational State Transfer</strong>. Yeh web services design karne ka ek architectural style hai — Roy Fielding ne 2000 mein introduce kiya!</p>

        <div className="g3" style={{ marginBottom: "1.5rem" }}>
          <div className="cc blue"><div className="ci">📡</div><div className="ct">REST kya hai?</div><div className="cd">Web APIs design karne ka standard tarika. HTTP methods properly use karta hai — GET, POST, PUT, DELETE.</div></div>
          <div className="cc green"><div className="ci">👨‍🎓</div><div className="ct">Roy Fielding</div><div className="cd">REST architecture 2000 mein Roy Fielding ki doctoral dissertation se aaya!</div></div>
          <div className="cc yellow"><div className="ci">🔑</div><div className="ct">Key Principles</div><div className="cd">Statelessness, Idempotent operations, aur HTTP Method selection!</div></div>
        </div>

        <h3 style={{ fontFamily: "'Baloo Bhaijaan 2',cursive", margin: "1.8rem 0 0.8rem", color: "var(--blue)" }}>1️⃣ Statelessness — Server ko Yaad Nahi! 🧠</h3>
        <div className="g2" style={{ marginBottom: "1.2rem" }}>
          <div className="cc blue"><div className="ci">🏧</div><div className="ct">Real-Life Misal — ATM!</div><div className="cd">ATM machine ko har transaction mein card + PIN chahiye. Machine pehle wale customer ko yaad nahi rakhti. Har baar fresh start — yahi statelessness hai!</div></div>
          <div className="cc accent"><div className="ci">🌐</div><div className="ct">Web API mein Statelessness</div><div className="cd">Har request mein yeh sab hona chahiye:<br />🔑 Authentication Token<br />📋 Required Parameters<br />📦 Request Body (POST/PUT)</div></div>
        </div>

        <div className="alert tip"><span className="ai">💡</span><div className="ab"><strong>Kyun zaroori hai Statelessness?</strong> Server pe load kam hota hai. Alag alag servers requests handle kar sakte hain (load balancing). Application zyada scalable hoti hai!</div></div>

        <h3 style={{ fontFamily: "'Baloo Bhaijaan 2',cursive", margin: "1.8rem 0 0.8rem", color: "var(--green)" }}>2️⃣ Idempotent — Baar Baar Same Result! 🔁</h3>
        <p style={{ color: "var(--muted)", marginBottom: "1rem", lineHeight: 1.7 }}><strong style={{ color: "var(--text)" }}>Definition:</strong> Ek operation idempotent hota hai agar use kai dafa perform karo to bhi result same rahe!</p>

        <div className="tw">
          <table>
            <thead><tr><th>HTTP Method</th><th>Idempotent?</th><th>Wajah</th></tr></thead>
            <tbody>
              <tr><td><span className="pill" style={{ background: "rgba(6,214,160,.15)", color: "var(--green)" }}>GET</span></td><td>✅ Haan</td><td>Sirf data dekhta hai — kuch badlta nahi</td></tr>
              <tr><td><span className="pill">PUT</span></td><td>✅ Haan</td><td>Same data se update — result same rahega</td></tr>
              <tr><td><span className="pill" style={{ background: "rgba(230,57,70,.15)", color: "#ff8b94" }}>DELETE</span></td><td>✅ Haan</td><td>Ek baar delete — baad mein bhi deleted</td></tr>
              <tr><td><span className="pill" style={{ background: "rgba(230,57,70,.15)", color: "#ff8b94" }}>POST</span></td><td>❌ Nahi</td><td>Har baar naya record banta hai!</td></tr>
            </tbody>
          </table>
        </div>

        <h3 style={{ fontFamily: "'Baloo Bhaijaan 2',cursive", margin: "1.8rem 0 0.8rem", color: "var(--yellow)" }}>3️⃣ HTTP Method Selection — Sahi Method Chunno! 📋</h3>
        <div className="tw">
          <table>
            <thead><tr><th>HTTP Method</th><th>Kaam</th><th>Misal — Online Store</th></tr></thead>
            <tbody>
              <tr><td><span className="pill" style={{ background: "rgba(6,214,160,.15)", color: "var(--green)" }}>GET</span></td><td>Data retrieve karo</td><td>Products ki list dekho</td></tr>
              <tr><td><span className="pill">POST</span></td><td>Naya data create karo</td><td>Naya product add karo</td></tr>
              <tr><td><span className="pill">PUT</span></td><td>Data update karo</td><td>Product detail update karo</td></tr>
              <tr><td><span className="pill" style={{ background: "rgba(230,57,70,.15)", color: "#ff8b94" }}>DELETE</span></td><td>Data remove karo</td><td>Product delete karo</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <hr className="div" />

      {/* Part 4: URI Design */}
      <section className="section">
        <div className="s-tag">Part 4 — 90 se 120 Minute</div>
        <h2 className="s-title">Resource & URI Identification 🔗</h2>
        <p className="s-desc">REST mein har cheez ek Resource hoti hai. URI se hum in resources ko identify karte hain. Sahi URI design karna bohot zaroori hai!</p>

        <div className="g4" style={{ marginBottom: "1.5rem" }}>
          <div className="cc blue"><div className="ci">👨‍🎓</div><div className="ct">Student</div><div className="cd">University system mein student ek resource hai</div></div>
          <div className="cc green"><div className="ci">📚</div><div className="ct">Course</div><div className="cd">Courses bhi resources hain — noun hai!</div></div>
          <div className="cc yellow"><div className="ci">🛍️</div><div className="ct">Product</div><div className="cd">E-commerce mein product ek resource hai</div></div>
          <div className="cc red"><div className="ci">📦</div><div className="ct">Order</div><div className="cd">Online store mein order bhi resource hai</div></div>
        </div>

        <h3 style={{ fontFamily: "'Baloo Bhaijaan 2',cursive", margin: "1.5rem 0 0.8rem", color: "var(--green)" }}>📏 URI Design ke Rules</h3>
        <div className="steps" style={{ marginBottom: "1.5rem" }}>
          <div className="step"><div className="sn">1</div><div><div className="st">Nouns use karo — Verbs nahi!</div><div className="sd">✅ /students &nbsp;&nbsp; ❌ /getStudents &nbsp;&nbsp; ❌ /createStudent</div></div></div>
          <div className="step"><div className="sn">2</div><div><div className="st">Plural form use karo</div><div className="sd">✅ /students &nbsp;&nbsp; ❌ /student — Hamesha plural likhna hai!</div></div></div>
          <div className="step"><div className="sn">3</div><div><div className="st">Hierarchical structure banao</div><div className="sd">/students → /students/10 → /students/10/courses</div></div></div>
          <div className="step"><div className="sn">4</div><div><div className="st">HTTP methods se actions batao</div><div className="sd">URI mein action mat likho — GET/POST/PUT/DELETE se pata chalta hai!</div></div></div>
        </div>

        <div className="g2">
          <div>
            <h3 style={{ fontFamily: "'Baloo Bhaijaan 2',cursive", marginBottom: "0.8rem", color: "var(--green)" }}>✅ Acha REST API Design</h3>
            <div style={{ background: "var(--card)", border: "1px solid var(--green)", borderRadius: 12, padding: "1.1rem", fontFamily: "monospace", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div><span className="pill" style={{ background: "rgba(6,214,160,.15)", color: "var(--green)" }}>GET</span> <span style={{ color: "var(--accent)" }}>/students</span> <span style={{ color: "var(--muted)" }}>→ sab students</span></div>
              <div><span className="pill" style={{ background: "rgba(6,214,160,.15)", color: "var(--green)" }}>GET</span> <span style={{ color: "var(--accent)" }}>/students/1</span> <span style={{ color: "var(--muted)" }}>→ ek student</span></div>
              <div><span className="pill">POST</span> <span style={{ color: "var(--accent)" }}>/students</span> <span style={{ color: "var(--muted)" }}>→ naya banao</span></div>
              <div><span className="pill" style={{ background: "rgba(255,209,102,.15)", color: "var(--yellow)" }}>PUT</span> <span style={{ color: "var(--accent)" }}>/students/1</span> <span style={{ color: "var(--muted)" }}>→ update karo</span></div>
              <div><span className="pill" style={{ background: "rgba(230,57,70,.15)", color: "#ff8b94" }}>DELETE</span> <span style={{ color: "var(--accent)" }}>/students/1</span> <span style={{ color: "var(--muted)" }}>→ delete karo</span></div>
            </div>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Baloo Bhaijaan 2',cursive", marginBottom: "0.8rem", color: "var(--red)" }}>❌ Bura REST API Design</h3>
            <div style={{ background: "var(--card)", border: "1px solid var(--red)", borderRadius: 12, padding: "1.1rem", fontFamily: "monospace", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div><span style={{ color: "#ff8b94" }}>❌ /createStudent</span> <span style={{ color: "var(--muted)" }}>— verb mat likho</span></div>
              <div><span style={{ color: "#ff8b94" }}>❌ /deleteStudent</span> <span style={{ color: "var(--muted)" }}>— DELETE method use karo</span></div>
              <div><span style={{ color: "#ff8b94" }}>❌ /updateStudent</span> <span style={{ color: "var(--muted)" }}>— PUT method use karo</span></div>
              <div><span style={{ color: "#ff8b94" }}>❌ /getStudents</span> <span style={{ color: "var(--muted)" }}>— GET method khud batata hai</span></div>
              <div><span style={{ color: "#ff8b94" }}>❌ /student</span> <span style={{ color: "var(--muted)" }}>— singular mat likho</span></div>
            </div>
          </div>
        </div>

        <div className="alert tip" style={{ marginTop: "1.5rem" }}>
          <span className="ai">💡</span>
          <div className="ab"><strong>Yaad Rakhne wali Baat!</strong> URI = KYA (resource) &nbsp;|&nbsp; HTTP Method = KAISE (action). URI mein sirf resource ka naam — koi action nahi!</div>
        </div>
      </section>

      <hr className="div" />

      {/* Quiz */}
      <section className="section">
        <div className="s-tag">Practice</div>
        <h2 className="s-title">Quiz — Apna Ilm Azmaao! 🧩</h2>
        <p className="s-desc">Neeche ke sawaalon ke jawab do — click karo aur fauran pata chale sahi hai ya galat!</p>
        <QuizSection />
      </section>

      <hr className="div" />

      {/* Recap */}
      <section className="section">
        <div className="s-tag">Quick Recap</div>
        <h2 className="s-title">5 Key Baatein Yaad Karo! 🔑</h2>
        <div className="steps">
          <div className="step"><div className="sn">1</div><div><div className="st">View Generators = Scaffolding</div><div className="sd">Automatically List, Create, Edit, Delete pages banate hain — time bachate hain!</div></div></div>
          <div className="step"><div className="sn">2</div><div><div className="st">Bootstrap = Responsive UI Framework</div><div className="sd">12-column grid, ready-made components, mobile-friendly by default!</div></div></div>
          <div className="step"><div className="sn">3</div><div><div className="st">REST = Stateless Architecture</div><div className="sd">Server ko kuch yaad nahi — har request mein apni saari info deni hoti hai!</div></div></div>
          <div className="step"><div className="sn">4</div><div><div className="st">Idempotent = Same Result Baar Baar</div><div className="sd">GET, PUT, DELETE idempotent hain. POST idempotent NAHI!</div></div></div>
          <div className="step"><div className="sn">5</div><div><div className="st">URI mein Nouns — Verbs Nahi!</div><div className="sd">/students ✅ — /getStudents ❌. HTTP Method action batata hai!</div></div></div>
        </div>
        <div className="alert exam" style={{ marginTop: "1.5rem" }}>
          <span className="ai">🎯</span>
          <div className="ab"><strong>Viva / Exam ke liye Perfect Jawab!</strong><br />"REST stateless kyun hai?" → Server ko state yaad rakhni nahi padti — scalability badhti hai, load balancing aasaan hoti hai.<br /><br />"POST idempotent kyun nahi?" → Har baar POST karo — naya resource banta hai. Same request teen baar bheji to teen alag records!</div>
        </div>
      </section>
    </>
  );
}
