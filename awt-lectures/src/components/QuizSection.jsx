import React, { useState } from 'react';

const QuizSection = ({ title, questions }) => {
  const [answers, setAnswers] = useState({});
  const allDone = Object.keys(answers).length === questions.length;
  const score = Object.values(answers).filter(Boolean).length;
  
  const pick = (qi, oi) => {
    if (answers[qi] !== undefined) return;
    setAnswers(prev => ({ ...prev, [qi]: oi === questions[qi].correctAnswer }));
  };

  return (
    <div className="quiz-section mt-12">
      {title && <h2 className="mb-6">{title}</h2>}
      {questions.map((q, qi) => (
        <div key={qi} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.2rem", marginBottom: "0.9rem" }}>
          <div style={{ fontFamily: "'Baloo Bhaijaan 2',cursive", fontWeight: 700, marginBottom: "0.85rem" }}>
            <span style={{ color: "var(--accent)", marginRight: "0.35rem" }}>Q{qi + 1}.</span>{q.question}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {q.options.map((o, oi) => {
              const done = answers[qi] !== undefined;
              const isCorrect = oi === q.correctAnswer;
              let bg = "var(--card2)", border = "var(--border)", color = "var(--text)";
              
              if (done && isCorrect) { 
                bg = "rgba(6,214,160,0.2)"; 
                border = "var(--green)"; 
                color = "var(--green)"; 
              } else if (done && !answers[qi] && oi !== q.correctAnswer) { 
                bg = "rgba(230,57,70,0.15)"; 
                border = "var(--red)"; 
                color = "#ff8b94"; 
              }
              
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
        <div style={{ background: "var(--card)", border: "1px solid var(--accent)", borderRadius: 14, padding: "1.5rem", textAlign: "center", marginTop: "1rem" }}>
          <div style={{ fontSize: "2.5rem" }}>🏆</div>
          <div style={{ fontFamily: "'Baloo Bhaijaan 2',cursive", fontSize: "1.1rem", fontWeight: 800, marginTop: "0.5rem" }}>
            {score === questions.length ? `🌟 Perfect ${score}/${questions.length}! Aap Expert ho!` : score >= questions.length - 1 ? `🎉 ${score}/${questions.length} — Bohat acha!` : `📚 ${score}/${questions.length} — Dobara parho!`}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizSection;
