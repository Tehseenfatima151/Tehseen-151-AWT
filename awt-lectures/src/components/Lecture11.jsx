import React from 'react';
import QuizSection from './QuizSection';

export default function Lecture11() {
  const quizData = [
    { question: "Angular kya hai?", options: ["Library", "Framework", "Database", "Language"], correctAnswer: 1 },
    { question: "Angular app shuru karne ke liye konsi file main hoti hai?", options: ["app.component.ts", "app.module.ts", "main.ts", "index.html"], correctAnswer: 1 },
    { question: "Component generate karne ki CLI command kya hai?", options: ["ng create component", "ng generate component", "ng make component", "ng new component"], correctAnswer: 1 },
    { question: "ngModel use karne ke liye konsa module import karna zaroori hai?", options: ["BrowserModule", "CommonModule", "FormsModule", "RouterModule"], correctAnswer: 2 },
    { question: "Interpolation ke liye kya syntax use hota hai?", options: ["[ ]", "( )", "{{ }}", "[[ ]]"], correctAnswer: 2 }
  ];

  return (
    <>
      <section className="section">
        <div className="s-tag">Introduction</div>
        <h2 className="s-title">Angular Kyun Seekhein? 🤔</h2>
        <p className="s-desc">Angular ek complete framework hai frontend development ke liye.</p>

        <div className="g3" style={{ marginBottom: "1.5rem" }}>
          <div className="cc blue"><div className="ci">📚</div><div className="ct">Framework vs Library</div><div className="cd">Angular poora framework hai — routing, DI, tooling sab built-in. React sirf library hai. Angular mein sab ready milta hai!</div></div>
          <div className="cc green"><div className="ci">🏢</div><div className="ct">Enterprise ke liye Best</div><div className="cd">Banking apps, HR portals, admin dashboards — bade projects ke liye Angular ideal hai.</div></div>
          <div className="cc yellow"><div className="ci">💪</div><div className="ct">TypeScript First</div><div className="cd">Type safety milti hai, errors compile time pe pakri jaati hain.</div></div>
        </div>
      </section>

      <hr className="div" />

      <section className="section">
        <div className="s-tag">Architecture</div>
        <h2 className="s-title">Angular ka Bada Picture 🗺️</h2>
        
        <div className="steps" style={{ marginBottom: "1.5rem" }}>
          <div className="step"><div className="sn">1</div><div><div className="st">AppModule</div><div className="sd">Configuration map</div></div></div>
          <div className="step"><div className="sn">2</div><div><div className="st">AppComponent</div><div className="sd">Root component</div></div></div>
          <div className="step"><div className="sn">3</div><div><div className="st">Template (HTML)</div><div className="sd">UI Structure</div></div></div>
          <div className="step"><div className="sn">4</div><div><div className="st">DOM</div><div className="sd">Browser rendering</div></div></div>
        </div>

        <h3 style={{ fontFamily: "'Baloo Bhaijaan 2',cursive", margin: "1.5rem 0 0.8rem", color: "var(--green)" }}>Modules aur @NgModule 📦</h3>
        <p className="s-desc">Module Angular ka configuration map hai — batata hai kya compile karna hai, kya use karna hai!</p>
        <div className="cb">
          <span className="lb">app.module.ts</span>
          <pre>{`@NgModule({
  declarations: [AppComponent, UserCardComponent], // Mere components
  imports: [BrowserModule, FormsModule],           // Doosre modules
  providers: [UserService],                        // Services
  bootstrap: [AppComponent]                        // App start point
})
export class AppModule {}`}</pre>
        </div>
      </section>

      <hr className="div" />

      <section className="section">
        <div className="s-tag">Components</div>
        <h2 className="s-title">Components aur @Component 🧩</h2>
        <p className="s-desc">Component ek reusable UI block hai. Selector + template + styles = Component ready!</p>
        
        <div className="cb" style={{ marginBottom: "1rem" }}>
          <span className="lb">user-card.component.ts</span>
          <pre>{`@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.html',
  styleUrls: ['./user-card.css']
})
export class UserCardComponent {
  userName = 'Ali Raza';
}`}</pre>
        </div>
        
        <div className="alert tip">
          <span className="ai">💡</span>
          <div className="ab"><strong>CLI Shortcut:</strong> <code>ng generate component user-card</code> jaldi component banata hai!</div>
        </div>
      </section>

      <hr className="div" />

      <section className="section">
        <div className="s-tag">Binding</div>
        <h2 className="s-title">Data Binding — Angular ka Dil ❤️</h2>
        <div className="g2">
          <div className="cc blue">
            <div className="ci">1️⃣</div><div className="ct">Interpolation {`{{ }}`}</div>
            <div className="cd">TS se HTML. Text dikhana.</div>
          </div>
          <div className="cc green">
            <div className="ci">2️⃣</div><div className="ct">Property Binding [ ]</div>
            <div className="cd">TS se DOM. Element properties set karna.</div>
          </div>
          <div className="cc yellow">
            <div className="ci">3️⃣</div><div className="ct">Event Binding ( )</div>
            <div className="cd">DOM se TS. Actions handle karna.</div>
          </div>
          <div className="cc red">
            <div className="ci">4️⃣</div><div className="ct">Two-Way Binding [( )]</div>
            <div className="cd">TS ↔ HTML. Forms ke liye.</div>
          </div>
        </div>
      </section>

      <hr className="div" />

      <section className="section">
        <div className="s-tag">Practice Quiz</div>
        <h2 className="s-title">Quiz — Angular Basics Seekha? 🧩</h2>
        <QuizSection title="" questions={quizData} />
      </section>
    </>
  );
}
