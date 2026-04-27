import { useState } from "react";

function QuizSection() {
  const qs = [
    { q: "TypeScript mein inheritance ke liye kaunsa keyword use hota hai?", opts: ["implement", "extends", "inherit", "super"], ans: 1 },
    { q: "Interface mein kya hota hai?", opts: ["Sirf implementation", "Sirf definitions (contract)", "Constructor bhi hota hai", "Objects create hote hain"], ans: 1 },
    { q: "Access modifier 'private' ka matlab kya hai?", opts: ["Har jagah accessible", "Sirf usi class mein accessible", "Subclasses mein bhi accessible", "Bahar se bhi accessible"], ans: 1 },
    { q: "'implements' keyword kiske saath use hota hai?", opts: ["Inheritance ke liye", "Interface implement karne ke liye", "Constructor banane ke liye", "Method override ke liye"], ans: 1 },
    { q: "Method overriding kab hota hai?", opts: ["Parent class mein naya method banao", "Child class mein parent ka method redefine karo", "Interface mein method banao", "Private method ko public karo"], ans: 1 },
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
            {score === 5 ? "🌟 Perfect! TypeScript Master ho aap!" : score >= 4 ? `🎉 ${score}/5 — Bohat acha!` : `📚 ${score}/5 — Dobara parho!`}
          </div>
        </div>
      )}
    </>
  );
}

export default function Lecture09() {
  return (
    <>
      {/* Part 1: Classes */}
      <section className="section">
        <div className="s-tag">Part 1 — 0 se 30 Minute</div>
        <h2 className="s-title">TypeScript Classes — Blueprint of Objects! 🏗️</h2>
        <p className="s-desc">Class ek blueprint hai objects banane ka. Jaise car blueprint se kai gaadi banti hain — class se kai objects bante hain!</p>

        <div className="g3" style={{ marginBottom: "1.5rem" }}>
          <div className="cc blue"><div className="ci">📋</div><div className="ct">Properties</div><div className="cd">Class ke andar variables. Jaise: name, age, balance. Object ka data store karte hain.</div></div>
          <div className="cc green"><div className="ci">⚙️</div><div className="ct">Constructor</div><div className="cd">Object banate waqt call hota hai. Properties ko initialize karta hai — pehla kaam!</div></div>
          <div className="cc yellow"><div className="ci">🔧</div><div className="ct">Methods</div><div className="cd">Class ke andar functions. Jaise: deposit(), withdraw(), display(). Object ka behavior define karte hain.</div></div>
        </div>

        <div className="cb" style={{ marginBottom: "1.5rem" }}>
          <span className="lb">student.ts — Class Example</span>
          <pre>{`class Student {
    name: string;
    age: number;

    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }

    display(): void {
        console.log(\`Name: \${this.name}, Age: \${this.age}\`);
    }
}

// Object banana
const s1 = new Student("Ali", 20);
s1.display(); // Name: Ali, Age: 20`}</pre>
        </div>

        <h3 style={{ fontFamily: "'Baloo Bhaijaan 2',cursive", margin: "1.5rem 0 0.8rem", color: "var(--accent)" }}>🔐 Access Modifiers — Kya Kahan Accessible Hai?</h3>
        <div className="tw" style={{ marginBottom: "1.5rem" }}>
          <table>
            <thead><tr><th>Modifier</th><th>Matlab</th><th>Kahan Access?</th></tr></thead>
            <tbody>
              <tr><td><span className="pill" style={{ background: "rgba(6,214,160,.15)", color: "var(--green)" }}>public</span></td><td>Sab ke liye</td><td>Class ke andar, bahar, subclasses — har jagah</td></tr>
              <tr><td><span className="pill" style={{ background: "rgba(230,57,70,.15)", color: "#ff8b94" }}>private</span></td><td>Sirf usi class</td><td>Sirf us class ke andar — bahar se kuch nahi</td></tr>
              <tr><td><span className="pill" style={{ background: "rgba(255,209,102,.15)", color: "var(--yellow)" }}>protected</span></td><td>Class + Subclasses</td><td>Us class aur uske children mein</td></tr>
            </tbody>
          </table>
        </div>

        <div className="cb">
          <span className="lb">BankAccount.ts — Private Example</span>
          <pre>{`class BankAccount {
    private balance: number; // sirf andar accessible

    constructor(balance: number) {
        this.balance = balance;
    }

    deposit(amount: number) {
        this.balance += amount; // andar access OK ✅
    }

    getBalance(): number {
        return this.balance; // method se access karo
    }
}

const acc = new BankAccount(1000);
acc.deposit(500);
// acc.balance ❌ Error! Private hai bahar se!`}</pre>
        </div>
      </section>

      <hr className="div" />

      {/* Part 2: Inheritance */}
      <section className="section">
        <div className="s-tag">Part 2 — 30 se 60 Minute</div>
        <h2 className="s-title">Inheritance — Wirasat Mein Properties Lena! 🧬</h2>
        <p className="s-desc">Inheritance ek class ko doosri class ki properties aur methods reuse karne deta hai. Jaise bacha parents se traits inherit karta hai!</p>

        <div className="alert tip" style={{ marginBottom: "1.5rem" }}>
          <span className="ai">💡</span>
          <div className="ab"><strong>Real-Life Misal!</strong> Vehicle (parent class) → Car, Bike, Truck (child classes). Saari vehicles mein speed aur brand hoti hai — inhone Vehicle se inherit kiya! extends keyword use hota hai.</div>
        </div>

        <div className="cb" style={{ marginBottom: "1.5rem" }}>
          <span className="lb">inheritance.ts</span>
          <pre>{`// Parent Class
class Animal {
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    move(): void {
        console.log(\`\${this.name} is moving...\`);
    }
}

// Child Class — 'extends' se inherit karo
class Dog extends Animal {
    bark(): void {
        console.log(\`\${this.name} is barking!\`);
    }
}

const dog = new Dog("Tommy");
dog.move();  // ✅ Parent se mila — "Tommy is moving..."
dog.bark();  // ✅ Apna method — "Tommy is barking!"`}</pre>
        </div>

        <h3 style={{ fontFamily: "'Baloo Bhaijaan 2',cursive", margin: "1.5rem 0 0.8rem", color: "var(--yellow)" }}>🔁 Method Overriding — Parent Ka Method Replace Karo</h3>
        <p className="s-desc" style={{ marginBottom: "1rem" }}>Child class parent ka method apne hisaab se redefine kar sakta hai — yahi Method Overriding hai!</p>

        <div className="cb" style={{ marginBottom: "1.5rem" }}>
          <span className="lb">override.ts</span>
          <pre>{`class Animal {
    speak(): void {
        console.log("Animal speaks...");
    }
}

class Cat extends Animal {
    speak(): void { // Override kiya!
        console.log("Cat meows! 🐱");
    }
}

class Dog extends Animal {
    speak(): void { // Override kiya!
        console.log("Dog barks! 🐕");
    }
}

const cat = new Cat();
cat.speak(); // "Cat meows!" — Cat ka apna behavior`}</pre>
        </div>

        <div className="g3">
          <div className="cc blue"><div className="ci">♻️</div><div className="ct">Code Reuse</div><div className="cd">Parent ka code dubara likhne ki zaroorat nahi — inherit karo aur kaam tamam!</div></div>
          <div className="cc green"><div className="ci">🧹</div><div className="ct">Cleaner Structure</div><div className="cd">Code organized aur readable rehta hai — hierarchy clear hoti hai.</div></div>
          <div className="cc yellow"><div className="ci">🔧</div><div className="ct">Easy Maintenance</div><div className="cd">Parent mein change karo — sab children mein automatically reflect hoga!</div></div>
        </div>
      </section>

      <hr className="div" />

      {/* Part 3: Interfaces */}
      <section className="section">
        <div className="s-tag">Part 3 — 60 se 90 Minute</div>
        <h2 className="s-title">Interfaces — Contract Define Karo! 📄</h2>
        <p className="s-desc">Interface ek contract hai jo class ko follow karna hota hai. Jaise job contract — responsibilities define karta hai. implements keyword use hota hai!</p>

        <div className="g2" style={{ marginBottom: "1.5rem" }}>
          <div className="cc blue">
            <div className="ci">📋</div><div className="ct">Interface kya hai?</div>
            <div className="cd">Structure ya contract define karta hai.<br />Class ko yeh properties aur methods ZAROOR implement karni padhti hain.<br /><br />Misal: USB port standard — sab USB devices same interface follow karte hain!</div>
          </div>
          <div className="cc green">
            <div className="ci">🔑</div><div className="ct">implements Keyword</div>
            <div className="cd">Class interface ko 'implements' se follow karti hai.<br /><br />Ek class multiple interfaces implement kar sakti hai!<br /><br />Class A, B {"{ ... }"}</div>
          </div>
        </div>

        <div className="cb" style={{ marginBottom: "1.5rem" }}>
          <span className="lb">interfaces.ts</span>
          <pre>{`// Interface — sirf structure, koi implementation nahi
interface Person {
    name: string;
    age: number;
    greet(): void;
}

// Class interface implement karti hai
class Student implements Person {
    name: string;
    age: number;

    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }

    greet(): void { // zaroori hai — interface mein tha!
        console.log(\`Hello! Main \${this.name} hun.\`);
    }
}

// Multiple Interfaces
interface Shape {
    area(): number;
}

class Circle implements Shape {
    radius: number;
    constructor(radius: number) { this.radius = radius; }

    area(): number {
        return Math.PI * this.radius * this.radius;
    }
}`}</pre>
        </div>
      </section>

      <hr className="div" />

      {/* Part 4: Comparison */}
      <section className="section">
        <div className="s-tag">Part 4 — 90 se 120 Minute</div>
        <h2 className="s-title">Classes vs Interfaces — Farq Samjho! ⚖️</h2>

        <div className="tw" style={{ marginBottom: "1.5rem" }}>
          <table>
            <thead><tr><th>Feature</th><th>Class</th><th>Interface</th></tr></thead>
            <tbody>
              <tr><td>Implementation</td><td>✅ Haan — code likhte hain</td><td>❌ Nahi — sirf structure</td></tr>
              <tr><td>Object Create</td><td>✅ new keyword se</td><td>❌ Direct object nahi banta</td></tr>
              <tr><td>Constructor</td><td>✅ Haan</td><td>❌ Nahi hota</td></tr>
              <tr><td>Inheritance</td><td>✅ extends</td><td>✅ extends (interfaces mein bhi)</td></tr>
              <tr><td>Multiple</td><td>❌ Ek hi extend kar sakte</td><td>✅ Multiple implement kar sakte</td></tr>
              <tr><td>Keyword</td><td>class + extends</td><td>interface + implements</td></tr>
            </tbody>
          </table>
        </div>

        <div className="g2" style={{ marginBottom: "1.5rem" }}>
          <div className="cc blue"><div className="ci">🏗️</div><div className="ct">Class kab use karo?</div><div className="cd">Jab implementation chahiye — actual code likhna ho. Objects create karne ho. Constructor chahiye. Jaise: Student class, BankAccount class.</div></div>
          <div className="cc green"><div className="ci">📄</div><div className="ct">Interface kab use karo?</div><div className="cd">Jab sirf structure ya contract define karna ho. Multiple classes same rules follow karein. Jaise: Shape interface, Printable interface.</div></div>
        </div>

        <div className="cb">
          <span className="lb">combined.ts — Real-Life Example</span>
          <pre>{`// Interface — VehicleRules
interface VehicleRules {
    speed: number;
    fuel(): string;
}

// Class — Car implements interface
class Car implements VehicleRules {
    speed: number;
    brand: string;

    constructor(speed: number, brand: string) {
        this.speed = speed;
        this.brand = brand;
    }

    fuel(): string {
        return "Petrol";
    }
}

// Inheritance — ElectricCar extends Car
class ElectricCar extends Car {
    fuel(): string { // Override!
        return "Electric Battery"; // ✅
    }
}`}</pre>
        </div>

        <div className="alert tip" style={{ marginTop: "1rem" }}>
          <span className="ai">💡</span>
          <div className="ab"><strong>Golden Rule:</strong> Use <strong style={{ color: "var(--accent)" }}>Class</strong> when you need implementation aur objects. Use <strong style={{ color: "var(--green)" }}>Interface</strong> when you need structure/contract define karna ho!</div>
        </div>
      </section>

      <hr className="div" />

      {/* Quiz */}
      <section className="section">
        <div className="s-tag">Practice Quiz</div>
        <h2 className="s-title">Quiz — TypeScript Samjha? 🧩</h2>
        <p className="s-desc">Click karke jawab reveal karo!</p>
        <QuizSection />
      </section>

      <hr className="div" />

      {/* Recap */}
      <section className="section">
        <div className="s-tag">Quick Recap</div>
        <h2 className="s-title">Key Takeaways — Yaad Raho! 🔑</h2>
        <div className="steps">
          <div className="step"><div className="sn">1</div><div><div className="st">Class = Blueprint</div><div className="sd">Properties, Constructor, Methods. extends se inherit karo.</div></div></div>
          <div className="step"><div className="sn">2</div><div><div className="st">Access Modifiers</div><div className="sd">public = sab, private = sirf andar, protected = class + children.</div></div></div>
          <div className="step"><div className="sn">3</div><div><div className="st">Inheritance — extends keyword</div><div className="sd">Child class parent ka code reuse karta hai. Method override bhi kar sakta hai!</div></div></div>
          <div className="step"><div className="sn">4</div><div><div className="st">Interface — implements keyword</div><div className="sd">Contract define karta hai. Class ko sab properties/methods implement karni padti hain.</div></div></div>
          <div className="step"><div className="sn">5</div><div><div className="st">Class vs Interface</div><div className="sd">Class = implementation chahiye. Interface = sirf structure chahiye.</div></div></div>
        </div>
        <div className="alert exam" style={{ marginTop: "1.5rem" }}>
          <span className="ai">🎯</span>
          <div className="ab"><strong>Exam Tip!</strong> "extends vs implements?" → extends = class se inherit (class-to-class ya interface-to-interface). implements = interface ka contract follow karna (class-to-interface).<br /><br />"Method overriding kya hai?" → Child class mein parent ka same method redefine karna apne behavior ke saath!</div>
        </div>
      </section>
    </>
  );
}
