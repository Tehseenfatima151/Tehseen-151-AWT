import React from 'react';
import QuizSection from './QuizSection';

export default function Lecture10() {
  const quizData = [
    { question: "DOM property set karne ke liye kaunsi binding use hoti hai?", options: ["Interpolation {{ }}", "Property Binding [ ]", "Event Binding ( )", "Pipe |"], correctAnswer: 1 },
    { question: "Kaunsa directive structural hai?", options: ["ngClass", "ngStyle", "*ngIf", "ngModel"], correctAnswer: 2 },
    { question: "providedIn: 'root' ka matlab kya hai?", options: ["Har component ka alag instance", "Poori app mein ek singleton instance", "Sirf routing ke liye", "Sirf pipes ke liye"], correctAnswer: 1 },
    { question: "Angular HttpClient kya return karta hai?", options: ["Promise", "Callback", "Observable", "Generator"], correctAnswer: 2 },
    { question: "<router-outlet> kahan rakhna chahiye?", options: ["Service mein", "Pipe mein", "Template mein jahan routed views dikhni hain", "Sirf module mein"], correctAnswer: 2 }
  ];

  return (
    <>
      <section className="section">
        <div className="s-tag">Mental Model</div>
        <h2 className="s-title">Angular ka Mental Model 🧠</h2>
        <p className="s-desc">Angular application ka architecture aur data flow kaise kaam karta hai.</p>

        <div className="g3" style={{ marginBottom: "1.5rem" }}>
          <div className="cc blue"><div className="ci">🏗️</div><div className="ct">Component Structure</div><div className="cd">TS class + HTML template + optional CSS. Teen parts milke ek complete component bante hain!</div></div>
          <div className="cc green"><div className="ci">🔄</div><div className="ct">Change Detection</div><div className="cd">Angular khud detect karta hai kab data badla — aur view automatically update ho jaata hai!</div></div>
          <div className="cc yellow"><div className="ci">🏢</div><div className="ct">Logic Kahan Rakho?</div><div className="cd">API logic component mein NAHI — Service mein rakhni chahiye! Component sirf UI dekhta hai.</div></div>
        </div>
      </section>

      <hr className="div" />

      <section className="section">
        <div className="s-tag">Templating</div>
        <h2 className="s-title">Templating — Data ko UI se Jodo! 📝</h2>
        <p className="s-desc">Angular ke powerful data binding features.</p>

        <div className="g2" style={{ marginBottom: "1.5rem" }}>
          <div className="cc blue">
            <div className="ci">1️⃣</div><div className="ct">Interpolation {`{{ }}`}</div>
            <div className="cd">Component ki value text ki tarah dikhao.</div>
          </div>
          <div className="cc green">
            <div className="ci">2️⃣</div><div className="ct">Property Binding [ ]</div>
            <div className="cd">DOM element ki property set karo. Example: <code>[disabled]="true"</code></div>
          </div>
          <div className="cc yellow">
            <div className="ci">3️⃣</div><div className="ct">Event Binding ( )</div>
            <div className="cd">User actions pakro. Example: <code>(click)="save()"</code></div>
          </div>
          <div className="cc red">
            <div className="ci">4️⃣</div><div className="ct">Two-Way Binding [( )]</div>
            <div className="cd">Dono taraf sync. FormsModule zaroor import karo!</div>
          </div>
        </div>
      </section>

      <hr className="div" />

      <section className="section">
        <div className="s-tag">Directives</div>
        <h2 className="s-title">Directives — DOM ko Control Karo! 🎛️</h2>
        <div className="g2">
          <div className="cc blue">
            <div className="ci">🏗️</div><div className="ct">Structural Directives</div>
            <div className="cd">
              <strong>*ngIf:</strong> Element add/remove karta hai.<br/>
              <strong>*ngFor:</strong> Element repeat karta hai.<br/>
              <strong>*ngSwitch:</strong> Switch-case rendering.
            </div>
          </div>
          <div className="cc green">
            <div className="ci">🎨</div><div className="ct">Attribute Directives</div>
            <div className="cd">
              <strong>[ngClass]:</strong> CSS classes toggle karta hai.<br/>
              <strong>[ngStyle]:</strong> Inline styles apply karta hai.<br/>
              <strong>ngModel:</strong> Form control binding.
            </div>
          </div>
        </div>
      </section>

      <hr className="div" />

      <section className="section">
        <div className="s-tag">Services & DI</div>
        <h2 className="s-title">Dependency Injection + Services 💉</h2>
        <p className="s-desc">DI ka matlab hai Angular khud service objects banata aur deta hai.</p>
        
        <div className="cb">
          <span className="lb">ProductService.ts</span>
          <pre>{`@Injectable({ providedIn: 'root' })
export class ProductService {
  getProducts() { return [...]; }
}

@Component(...)
export class HomeComponent {
  constructor(private ps: ProductService) {}
}`}</pre>
        </div>
      </section>

      <hr className="div" />

      <section className="section">
        <div className="s-tag">Practice Quiz</div>
        <h2 className="s-title">Quiz — Angular Core Samjha? 🧩</h2>
        <QuizSection title="" questions={quizData} />
      </section>
    </>
  );
}
