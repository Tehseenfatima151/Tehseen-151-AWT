// ─── Lectures Data — Roman Urdu Content ───

// NOTE: id:1 uses a special component (LectureOne) rendered directly in LectureContent.jsx
// id:2 → Node.js Architecture (was formerly id:1)
// id:3 → HTTP Server & FS (was formerly id:2)
// id:4 → Express.js Masterclass HTML Weaver content
// id:5 → Express.js Middleware & Routing Roman Urdu (was formerly id:3)

export const lecturesData = [
  {
    id: 1,
    title: "Course Intro — Full Stack ka Safar",
    badge: "CSC337 — Lecture 1",
    icon: "🎓",
    stats: [
      { n: "4", l: "Topics" },
      { n: "1", l: "Ghanta" },
      { n: "0", l: "Code Examples" },
    ],
    heroTitle: "AWT Lecture 1 — Course Intro! 🎓",
    heroDesc:
      "Course ka roadmap, ahmiyat, Full Stack concepts, aur technology ki tez daur — sab Roman Urdu mein!",
    sections: [
      {
        tag: "Part A — Course Overview",
        title: "Course Roadmap 🗺️",
        desc: "Poore course ka overview — kya seekhenge, kab seekhenge, aur kis order mein.",
        steps: [
          { n: "1", title: "Front-end Bunyaad", desc: "HTML, CSS, JS se shuruaat." },
          { n: "2", title: "Modern Tools", desc: "React aur Node.js — full-stack tools." },
          { n: "3", title: "Data Handling", desc: "Databases aur APIs — data ka safar." },
          { n: "4", title: "Practical Kaam", desc: "Deployment aur real-world projects." },
        ],
        alert: { type: "tip", icon: "💡", title: "Guide", text: "Roadmap ek guide hai — seekhne ki speed tumhari apni hogi. Har module mein projects aur quizzes honge." }
      },
      {
        tag: "Part B — Career & Skills",
        title: "Is Course Ki Ahmiyat 🌟",
        desc: "Kyun yeh course tumhare liye zaroori hai — career, skills, aur future.",
        cards: [
          { color: "blue", icon: "💼", title: "High Demand", desc: "Market mein full stack developers ki demand bahut zyada hai." },
          { color: "green", icon: "🚀", title: "Startup & Product", desc: "Apna khud ka startup ya product bana sako." },
          { color: "yellow", icon: "🏠", title: "Freelancing", desc: "Freelancing se ghar baithe kamana mumkin ho jata hai." },
          { color: "red", icon: "🧠", title: "Problem Solving", desc: "Problem-solving aur logical thinking sharpen hoti hai." },
        ]
      },
      {
        tag: "Part C — Architecture",
        title: "Full Stack Ke Bunyaadi Concepts 🏗️",
        desc: "Front-end kya hota hai? Back-end kya hai? Dono mil kar kaise kaam karte hain?",
        flow: ["Client (Browser)", "→", "API / Server (Node.js)", "→", "Database"],
        cards: [
          { color: "blue", icon: "🖥️", title: "Front-end", desc: "Jo user ko dikhta hai — HTML, CSS, JavaScript, React." },
          { color: "green", icon: "⚙️", title: "Back-end", desc: "Jo peeche hota hai — Node.js, Express, databases." },
          { color: "yellow", icon: "🗄️", title: "Database & API", desc: "Data store karne ki jagah aur front-end/back-end ke beech ka rasta." }
        ]
      },
      {
        tag: "Part D — Future Proofing",
        title: "Technology Ki Tez Daur 🚀",
        desc: "Duniya mein technology kitni tezi se badal rahi hai aur hum kaise relevant rahein.",
        steps: [
          { n: "1", title: "Constant Evolution", desc: "Har saal naye frameworks aur tools aate hain." },
          { n: "2", title: "AI Revolution", desc: "AI ab coding mein madad karta hai — GitHub Copilot, ChatGPT." },
          { n: "3", title: "Adaptability", desc: "Sirf ek technology pe mat ruko — adaptable bano." }
        ],
        alert: { type: "warn", icon: "⚠️", title: "Golden Rule", text: "Jo seekhna band kare, woh peeche reh jata hai. Yeh race threat nahi — opportunity hai agar tum tayyar ho." }
      }
    ],
  },

  {
    id: 2,
    title: "Node.js Architecture, Core Features & Modules",
    badge: "CSC337 — Lecture 2",
    icon: "⚙️",
    stats: [
      { n: "4", l: "Topics" },
      { n: "2", l: "Ghante" },
      { n: "3", l: "Activities" },
    ],
    heroTitle: "Node.js Basics Seekhain! ⚙️",
    heroDesc:
      "Node.js kya hai, kaise kaam karta hai, modules kya hote hain, aur NPM ka use — sab kuch simple Roman Urdu mein!",
    sections: [
      {
        tag: "Part A — 0 se 30 Minute",
        title: "Node.js kya hai? 🌐",
        desc:
          "Node.js ek open-source runtime environment hai jo JavaScript ko browser ke bahar chalata hai. Ye Google Chrome ke V8 engine par bana hua hai.",
        flow: ["Client Request", "→", "Node.js Server", "→", "Response"],
        cards: [
          {
            color: "blue",
            icon: "🚀",
            title: "Asynchronous & Non-Blocking",
            desc:
              "Node.js ek waqt mein kai requests handle kar sakta hai bina rukay. Jaise ek waiter ek sath kai orders leta hai aur jab khana ready ho tab deta hai!",
          },
          {
            color: "green",
            icon: "⚡",
            title: "Fast Performance",
            desc:
              "V8 engine JavaScript ko seedha machine code mein convert karta hai — isliye Node.js bahut fast hota hai.",
          },
          {
            color: "yellow",
            icon: "🔄",
            title: "Single-Threaded but Scalable",
            desc:
              "Ek hi thread hoti hai lekin event-driven architecture ki wajah se hazaron requests manage ho jaati hain!",
          },
          {
            color: "accent",
            icon: "💻",
            title: "Cross-Platform",
            desc: "Windows, Linux, macOS — sab par chalta hai. Ek baar likho, kahin bhi chalao!",
          },
        ],
        alert: {
          type: "tip",
          icon: "💡",
          title: "Real-Life Misaal",
          text: "Traditional server (blocking): Ek waiter ek customer ka order leta hai, khana aane tak rukta hai, phir agla order leta hai. Node.js (non-blocking): Waiter sab orders ek sath leta hai, jab khana tayyar ho tab deta hai. Zyada efficient!",
        },
      },
      {
        tag: "Part B — 30 se 60 Minute",
        title: "Node.js Architecture & Modules 🏗️",
        desc:
          "Node.js event-driven aur non-blocking I/O architecture follow karta hai. Modules code ke reusable pieces hote hain — jaise book ke chapters!",
        flow: [
          "Client Request",
          "→",
          "Event Queue",
          "→",
          "Event Loop",
          "→",
          "Background Threads",
          "→",
          "Response",
        ],
        cards: [
          {
            color: "red",
            icon: "📦",
            title: "Core Modules",
            desc: "Node.js ke sath built-in aate hain. Install karne ki zaroorat nahi. Misal: fs (files), http (server), path, os.",
          },
          {
            color: "blue",
            icon: "🗂️",
            title: "Local Modules",
            desc: "Aap khud banate hain apna code organize karne ke liye. Jaise book mein alag alag chapters.",
          },
          {
            color: "green",
            icon: "🌐",
            title: "Third-Party Modules",
            desc: "NPM se install hote hain. Maslan: express, mongoose, lodash — dunya ke developers ne banaye hain.",
          },
        ],
        alert: {
          type: "exam",
          icon: "🎯",
          title: "Exam Tip!",
          text: "Har Node.js file ek module hoti hai. Core modules ke liye install ki zaroorat nahi. require() se modules import hote hain.",
        },
      },
      {
        tag: "Part C — 60 se 90 Minute",
        title: "Event Loop, Callbacks & Event Emitters 🔄",
        desc:
          "Event Loop Node.js ka dil hai. Ye asynchronous operations ko manage karta hai. Callback woh function hai jo kisi kaam ke khatam hone par chalta hai.",
        steps: [
          {
            n: "1",
            title: "Event Loop",
            desc: "Traffic police ki tarah — decide karta hai kaun si request pehle jaaye. Call stack, event queue, callback queue check karta rehta hai.",
          },
          {
            n: "2",
            title: "Callbacks",
            desc: "Aap khana order karte hain — waiter ko call karte hain. Jab khana ready ho, waiter aapko call karta hai. Yahi callback hai!",
          },
          {
            n: "3",
            title: "Event Emitters",
            desc: "Observer pattern par based. Events emit hote hain (file upload, button click) aur listeners respond karte hain.",
          },
        ],
        alert: {
          type: "warn",
          icon: "⚠️",
          title: "Common Galti!",
          text: "Event loop ko block mat karo! Heavy computation synchronous code se likhne par poora server ruk jaata hai. Always async patterns use karo.",
        },
      },
      {
        tag: "Part D — 90 se 120 Minute",
        title: "NPM — Node Package Manager 📦",
        desc:
          "NPM duniya ka sabse bada software registry hai. Isse packages install karte hain, dependencies manage hoti hain aur project configure hota hai.",
        table: {
          headers: ["Command", "Kaam"],
          rows: [
            ["npm init", "Naya project banao"],
            ["npm install", "Sari dependencies install karo"],
            ["npm install express", "Specific package install karo"],
            ["npm uninstall express", "Package remove karo"],
            ["npm -v", "NPM version check karo"],
            ["npm run dev", "Dev server chalao"],
          ],
        },
        cards: [
          {
            color: "blue",
            icon: "📋",
            title: "package.json",
            desc: "Project ki shopping list! Project name, version, dependencies, scripts — sab yahan hoti hain.",
          },
          {
            color: "green",
            icon: "🔒",
            title: "package-lock.json",
            desc: "Exact versions lock hoti hain taki team mein sab ka same environment ho.",
          },
        ],
        alert: {
          type: "tip",
          icon: "💡",
          title: "Summary",
          text: "Node.js fast, scalable aur event-driven hai. Event Loop asynchronous processing karta hai. Modules code organize karte hain. NPM dependencies efficiently manage karta hai.",
        },
      },
    ],
  },

  {
    id: 3,
    title: "HTTP Server, URL Module & File System (FS)",
    badge: "CSC337 — Lecture 3",
    icon: "🌐",
    stats: [
      { n: "5", l: "Topics" },
      { n: "2", l: "Ghante" },
      { n: "5", l: "Code Examples" },
    ],
    heroTitle: "HTTP Server & File System Seekhain! 🌐",
    heroDesc:
      "Node.js se HTTP server banana, URL module se parsing karna, aur FS module se files padhna likhna — sab Roman Urdu mein!",
    sections: [
      {
        tag: "Part A — 0 se 20 Minute",
        title: "HTTP Server kya hota hai? 🖥️",
        desc:
          "Node.js mein http module se aap bina kisi framework ke apna web server bana sakte hain. Har request par aapko do objects milte hain: req (request) aur res (response).",
        code: {
          label: "server.js",
          content: `const http = require('http');
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello from Node HTTP Server!\\n');
});
server.listen(3000, () => {
  console.log('Server chal raha hai: http://localhost:3000/');
});`,
        },
        alert: {
          type: "tip",
          icon: "💡",
          title: "Mental Model",
          text: "req = customer ka order (method, URL, headers). res = waiter ka jawab (status, body). Har aane wali request par ye dono objects milte hain!",
        },
      },
      {
        tag: "Part B — 20 se 50 Minute",
        title: "HTTP Basics & URL Module 🔗",
        desc:
          "HTTP request/response protocol hai. Client request bhejta hai, server response deta hai. URL module se URL ko alag alag parts mein tod sakte hain.",
        table: {
          headers: ["Status Code", "Matlab"],
          rows: [
            ["200 OK", "Request successful rahi"],
            ["201 Created", "Naya resource ban gaya"],
            ["400 Bad Request", "Client ki galti"],
            ["404 Not Found", "Resource mila nahi"],
            ["500 Server Error", "Server side problem"],
          ],
        },
        code: {
          label: "url-parsing.js",
          content: `const { URL } = require('url');
function parseUrl(req) {
  const base = \`http://\${req.headers.host}\`;
  return new URL(req.url, base);
}
// Example:
const u = parseUrl(req);
console.log(u.pathname);              // '/search'
console.log(u.searchParams.get('q')); // 'node'`,
        },
        alert: {
          type: "warn",
          icon: "⚠️",
          title: "Common Galti!",
          text: "req.url sirf path+query deta hai, poora URL nahi. Isliye URL class use karo aur base URL dena zaroori hai! Manual string splitting error-prone hoti hai.",
        },
      },
      {
        tag: "Part C — 50 se 80 Minute",
        title: "Routing & File System (FS) 🗺️",
        desc:
          "Routing ka matlab hai: kaunsi URL par kaunsa function chale. FS module se files padhte aur likhte hain — synchronous ya asynchronous tareekon se.",
        code: {
          label: "routing.js",
          content: `const http = require('http');
const { URL } = require('url');
const routes = {
  'GET /': (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Home Page\\n');
  },
  'GET /api/time': (req, res) => {
    const payload = { now: new Date().toISOString() };
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(payload));
  }
};
function handler(req, res) {
  const u = new URL(req.url, \`http://\${req.headers.host}\`);
  const key = \`\${req.method} \${u.pathname}\`;
  const fn = routes[key];
  if (!fn) {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    return res.end('404 Not Found\\n');
  }
  fn(req, res, u);
}
http.createServer(handler).listen(3000);`,
        },
        cards: [
          {
            color: "red",
            icon: "🔄",
            title: "Synchronous FS",
            desc: "fs.readFileSync() — code rukta hai jab tak file na padh le. Server mein use mat karo!",
          },
          {
            color: "blue",
            icon: "⚡",
            title: "Async FS (Callback)",
            desc: "fs.readFile(path, cb) — file read ho rahi ho tab bhi server dusri requests handle karta hai.",
          },
          {
            color: "green",
            icon: "🌊",
            title: "Stream-based FS",
            desc: "fs.createReadStream() — bade files ke liye best! Data chunks mein aata hai, poora RAM mein load nahi hota.",
          },
        ],
        alert: {
          type: "exam",
          icon: "🎯",
          title: "Exam Tip!",
          text: "Server mein ALWAYS async FS use karo. Sync I/O event loop ko block karta hai — poora server ruk jaata hai!",
        },
      },
      {
        tag: "Part D — 80 se 100 Minute",
        title: "Streams & pipe() — Bade Files ke liye 🌊",
        desc:
          "Streams data ko chunks mein process karte hain. Large files ke liye best option! HTTP response ek writable stream hai, isliye file directly pipe ki ja sakti hai.",
        code: {
          label: "stream-file.js",
          content: `const fs = require('fs');
function streamFileToResponse(filePath, res) {
  const fileStream = fs.createReadStream(filePath);
  fileStream.on('error', (err) => {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('File nahi mili\\n');
  });
  res.writeHead(200, {'Content-Type': 'application/octet-stream'});
  fileStream.pipe(res); // chunks mein bhejta hai!
}`,
        },
        alert: {
          type: "warn",
          icon: "⚠️",
          title: "Security Warning!",
          text: "Static files serve karte waqt path traversal se bachao! User '../secret.txt' jaise paths send kar sakta hai. path.normalize() use karo aur check karo ke final path public folder ke andar hi rahe.",
        },
      },
      {
        tag: "Part E — Recap",
        title: "5 Key Baatein Yaad Karo 🔑",
        desc: "Aaj ke lecture ka summary — ye points yaad rakho!",
        steps: [
          {
            n: "1",
            title: "http.createServer() se low-level control milta hai",
            desc: "req aur res objects se request/response manually handle hoti hai.",
          },
          {
            n: "2",
            title: "URL class se parsing karo",
            desc: "new URL(req.url, base) se pathname aur query parameters cleanly milte hain.",
          },
          {
            n: "3",
            title: "Routing = method + pathname → handler",
            desc: "Frameworks (Express) ye automatically karte hain, lekin base concept yahi hai!",
          },
          {
            n: "4",
            title: "Async FS server ko responsive rakhta hai",
            desc: "Sync I/O event loop block karta hai — server mein avoid karo.",
          },
          {
            n: "5",
            title: "Streams + pipe() large data ke liye best",
            desc: "Memory efficient, backpressure automatically handle hoti hai!",
          },
        ],
        alert: {
          type: "tip",
          icon: "💡",
          title: "Real-World Connection",
          text: "Express.js in sab cheezoon ko internally use karta hai! Agar aap ye samjh jaao to Express aur koi bhi framework samajhna bohat aasaan ho jaata hai.",
        },
      },
    ],
  },

  {
    id: 4,
    title: "Express.js — Middleware, Routing & Architecture (Weaver)",
    badge: "CSC337 — Lecture 4",
    icon: "🏗️",
    useSpecialComponent: "Lecture04Weaver",
    stats: [
      { n: "4", l: "Topics" },
      { n: "2", l: "Ghante" },
      { n: "10", l: "Quiz Questions" },
    ],
    heroTitle: "Express.js Masterclass! 🏗️",
    heroDesc:
      "Middleware, Routing, aur Architecture — Express.js ke core concepts ek detailed interactive lecture mein!",
    sections: [],
  },

  {
    id: 5,
    title: "Express.js — Middleware, Routing & Application Architecture",
    badge: "CSC337 — Lecture 5",
    icon: "🚂",
    stats: [
      { n: "5", l: "Topics" },
      { n: "2", l: "Ghante" },
      { n: "4", l: "Code Examples" },
    ],
    heroTitle: "Express.js Master Karo! 🚂",
    heroDesc:
      "Express.js kya hai, Middleware kaise kaam karta hai, Routing kaise hoti hai, aur scalable app kaise banate hain — sab Roman Urdu mein!",
    sections: [
      {
        tag: "Part A — 0 se 20 Minute",
        title: "Express.js kya hai? 🟢",
        desc:
          "Express.js Node.js par bana ek minimal aur flexible web framework hai. Ye web servers aur APIs banana bahut aasaan bana deta hai.",
        flow: ["Client (Browser)", "→", "Express App", "→", "Middleware", "→", "Route Handler", "→", "Response"],
        code: {
          label: "app.js — Basic Express Setup",
          content: `const express = require('express');
const app = express();

// Route — GET / pe response bhejo
app.get('/', (req, res) => {
  res.send('Welcome to Express!');
});

// Server start karo
app.listen(3000, () => {
  console.log('Server chal raha hai port 3000 par');
});`,
        },
        cards: [
          {
            color: "blue",
            icon: "📱",
            title: "Customers = Clients",
            desc: "Browser ya Postman jo request bhejta hai.",
          },
          {
            color: "green",
            icon: "🍽️",
            title: "Waiter = Middleware",
            desc: "Request receive karta hai, process karta hai, phir aage bhejta hai.",
          },
          {
            color: "yellow",
            icon: "👨‍🍳",
            title: "Kitchen = Server Logic",
            desc: "Actual kaam yahan hota hai — database, calculations, etc.",
          },
          {
            color: "red",
            icon: "👔",
            title: "Manager = Express",
            desc: "Sab kuch coordinate karta hai — routes, middleware, errors.",
          },
        ],
      },
      {
        tag: "Part B — 20 se 40 Minute",
        title: "Middleware — Request ke Bich mein kya hota hai? 🔧",
        desc:
          "Middleware woh function hai jo request receive hone ke baad aur response bhejne se pehle chalta hai. Iske paas req, res, aur next() ka access hota hai.",
        steps: [
          {
            n: "1",
            title: "Application-Level Middleware",
            desc: "app.use() se register hota hai — poori app par laagu hota hai. Logging, body parsing yahan hota hai.",
          },
          {
            n: "2",
            title: "Router-Level Middleware",
            desc: "Sirf specific router par laagu hota hai. Modular applications ke liye.",
          },
          {
            n: "3",
            title: "Built-in Middleware",
            desc: "express.json() — JSON body parse karta hai. express.static() — static files serve karta hai.",
          },
          {
            n: "4",
            title: "Error-Handling Middleware",
            desc: "4 parameters hote hain: (err, req, res, next). Sab errors yahan catch hote hain.",
          },
        ],
        code: {
          label: "middleware-examples.js",
          content: `// 1. Application-Level Middleware
app.use((req, res, next) => {
  console.log('Request aayi:', req.method, req.url);
  next(); // Aage bhejo zaroori hai!
});

// 2. Built-in — JSON parsing
app.use(express.json());

// 3. Error Handling Middleware (4 params!)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Kuch galat ho gaya!');
});`,
        },
        alert: {
          type: "warn",
          icon: "⚠️",
          title: "Common Galti!",
          text: "next() call karna bhool jaao to request wahan ruk jaati hai aur response kabhi nahi aata! Error middleware mein exactly 4 parameters zaroori hain.",
        },
      },
      {
        tag: "Part C — 40 se 60 Minute",
        title: "Routing in Express 🗺️",
        desc:
          "Routing decide karti hai: kaunsi URL par kaunsa code chale. Express mein GET, POST, PUT, DELETE sab HTTP methods support hote hain.",
        table: {
          headers: ["HTTP Method", "Kaam", "Example"],
          rows: [
            ["GET", "Data padhna", "app.get('/users', ...)"],
            ["POST", "Naya data banana", "app.post('/users', ...)"],
            ["PUT", "Poora data update karna", "app.put('/users/:id', ...)"],
            ["DELETE", "Data delete karna", "app.delete('/users/:id', ...)"],
          ],
        },
        code: {
          label: "routes.js",
          content: `// Basic Routes
app.get('/about', (req, res) => {
  res.send('About Page');
});

// Route Parameters — dynamic values
app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  res.send(\`User ID: \${userId}\`);
});
// /user/5 → "User ID: 5"

// Query Parameters
app.get('/search', (req, res) => {
  const query = req.query.q;
  res.send(\`Search: \${query}\`);
});
// /search?q=node → "Search: node"`,
        },
        alert: {
          type: "exam",
          icon: "🎯",
          title: "Exam Tip!",
          text: "Route Parameters (:id) URL ka hissa hote hain — req.params se milte hain. Query Parameters (?q=value) — req.query se milte hain. Dono alag cheezain hain!",
        },
      },
      {
        tag: "Part D — 70 se 90 Minute",
        title: "Express Router — Code Organize Karo! 📁",
        desc:
          "Router alag files mein routes likhne deta hai. 50 routes ek file mein likhna messy hota hai — Router se modular aur scalable app banta hai. Jaise university ke alag alag departments!",
        code: {
          label: "routes/user.js + app.js",
          content: `// ── routes/user.js ──
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Sare Users');
});

router.get('/:id', (req, res) => {
  res.send('Single User: ' + req.params.id);
});

module.exports = router;

// ── app.js ──
const userRoutes = require('./routes/user');
app.use('/users', userRoutes);
// Ab ye kaam karta hai:
// GET /users     → Sare Users
// GET /users/10  → Single User: 10`,
        },
        alert: {
          type: "tip",
          icon: "💡",
          title: "Real-Life Misaal",
          desc: "Router university departments ki tarah hai: Admissions Office → /admissions, Accounts → /accounts, Exams → /exams. Har department apna kaam khud sambhalta hai!",
        },
      },
      {
        tag: "Part E — 90 se 110 Minute",
        title: "Application Architecture — Scalable App Kaise Banate Hain 🏗️",
        desc:
          "Badi applications ke liye sahi folder structure zaroori hai. Express MVC pattern support karta hai — Model (database), View (frontend), Controller (business logic).",
        cards: [
          {
            color: "blue",
            icon: "📂",
            title: "Folder Structure",
            desc: "project/ → app.js, routes/ (user.js, product.js), middleware/ (auth.js, logger.js), controllers/, models/",
          },
          {
            color: "green",
            icon: "🎯",
            title: "MVC Pattern",
            desc: "Model = Database logic. View = React/EJS. Controller = Business logic. Sab alag alag responsibilities!",
          },
          {
            color: "yellow",
            icon: "⚡",
            title: "Middleware Order",
            desc: "Express middleware order mein execute hota hai. Auth fail ho to route kabhi execute nahi hoga. Order bahut important hai!",
          },
          {
            color: "red",
            icon: "🔒",
            title: "Auth Middleware",
            desc: "app.use(logger) → app.use(auth) → app.use('/users', userRoutes). Pehle logging, phir authentication, phir routes!",
          },
        ],
        alert: {
          type: "exam",
          icon: "🎯",
          title: "Summary — Aaj kya sikha!",
          text: "Express.js Node.js par flexible framework hai. Middleware = request-response ke bich wala code. Routing = URL ko handler se map karna. Router = code ko organize karta hai. Middleware order matter karta hai!",
        },
      },
    ],
  },
];

// Lecture 6 — App Dev & REST Principles
lecturesData.push({
  id: 6,
  title: "App Dev & REST Principles",
  badge: "CSC337 — Lecture 6",
  icon: "📘",
  useSpecialComponent: "Lecture06",
  stats: [
    { n: "4", l: "Core Topics" },
    { n: "2", l: "Ghante" },
    { n: "5", l: "Quiz MCQs" },
  ],
  heroTitle: "App Development aur REST Seekhain! 🔥",
  heroDesc: "View Generators, Bootstrap, REST Architecture, Statelessness, Idempotent, aur URI Design — sab kuch aasaan Roman Urdu mein! 🇵🇰",
  sections: [],
});

// Lecture 7 — REST API Design, Implementation & Security
lecturesData.push({
  id: 7,
  title: "REST API — Design, Implementation & Security",
  badge: "CSC337 — Lecture 7",
  icon: "📡",
  useSpecialComponent: "Lecture07",
  stats: [
    { n: "4", l: "Parts" },
    { n: "2", l: "Ghante" },
    { n: "5", l: "Quiz MCQs" },
  ],
  heroTitle: "REST API Design aur Implementation! 📡",
  heroDesc: "API design, Online Bookstore case study, Node.js implementation, aur REST Security (CORS, XSS, DDoS) — sab Roman Urdu mein! 🇵🇰",
  sections: [],
});

// Lecture 8 — JWT in REST APIs
lecturesData.push({
  id: 8,
  title: "JWT in REST APIs — Secure Authentication",
  badge: "CSC337 — Lecture 8",
  icon: "🔐",
  useSpecialComponent: "Lecture08",
  stats: [
    { n: "4", l: "Parts" },
    { n: "2", l: "Ghante" },
    { n: "5", l: "Quiz MCQs" },
  ],
  heroTitle: "JWT — JSON Web Tokens Seekhain! 🔐",
  heroDesc: "Authentication vs Authorization, JWT structure (Header.Payload.Signature), JWT flow, aur security best practices — Roman Urdu mein! 🇵🇰",
  sections: [],
});

// Lecture 9 — TypeScript Classes, Inheritance & Interfaces
lecturesData.push({
  id: 9,
  title: "TypeScript — Classes, Inheritance & Interfaces",
  badge: "CSC337 — Lecture 9",
  icon: "🟦",
  useSpecialComponent: "Lecture09",
  stats: [
    { n: "4", l: "Parts" },
    { n: "2", l: "Ghante" },
    { n: "5", l: "Quiz MCQs" },
  ],
  heroTitle: "TypeScript OOP — Seekhain Roman Urdu Mein! 🟦",
  heroDesc: "Classes, Access Modifiers, Inheritance, Method Overriding, Interfaces — TypeScript ke OOP concepts Roman Urdu mein! 🇵🇰",
  sections: [],
});

// Lecture 10 — Angular Core Mastery
lecturesData.push({
  id: 10,
  title: "Angular Core Mastery",
  badge: "CSC337 — Lecture 10",
  icon: "🔥",
  useSpecialComponent: "Lecture10",
  stats: [
    { n: "7", l: "Core Topics" },
    { n: "2", l: "Ghante" },
    { n: "5", l: "Quiz MCQs" },
  ],
  heroTitle: "Angular Core Mastery Seekhain! 🔥",
  heroDesc: "Templating, Directives, Pipes, DI, Services, Routing aur Observables — sab kuch aasaan Roman Urdu mein!",
  sections: [],
});

// Lecture 11 — Angular Seekhain
lecturesData.push({
  id: 11,
  title: "Angular Seekhain (Basics)",
  badge: "CSC337 — Lecture 11",
  icon: "🚀",
  useSpecialComponent: "Lecture11",
  stats: [
    { n: "8", l: "Topics" },
    { n: "2", l: "Ghante" },
    { n: "5", l: "Quiz MCQs" },
  ],
  heroTitle: "Angular Seekhain! 🎓",
  heroDesc: "Decorators, Modules, Components aur Data Binding — sab kuch aasaan Roman Urdu mein!",
  sections: [],
});

// Lecture 12 — MEAN Stack Mastery
lecturesData.push({
  id: 12,
  title: "MEAN Stack Mastery",
  badge: "CSC337 — Lecture 12",
  icon: "🌍",
  useSpecialComponent: "Lecture12",
  stats: [
    { n: "6", l: "Concepts" },
    { n: "2", l: "Ghante" },
    { n: "5", l: "Quiz MCQs" },
  ],
  heroTitle: "MEAN Stack Mastery 🚀",
  heroDesc: "React, Node.js, Express aur MongoDB ko mila kar full-stack pipeline samajhna!",
  sections: [],
});

// Lecture 13 — React JS Masterclass
lecturesData.push({
  id: 13,
  title: "React JS Masterclass",
  badge: "CSC337 — Lecture 13",
  icon: "⚛️",
  useSpecialComponent: "Lecture13",
  stats: [
    { n: "5", l: "Key Topics" },
    { n: "2", l: "Ghante" },
    { n: "5", l: "Quiz MCQs" },
  ],
  heroTitle: "React JS Masterclass ⚛️",
  heroDesc: "Mastering the React Ecosystem: Components, Hooks, Routing aur boht kuch!",
  sections: [],
});

// Lecture 14 — React API & Redux Thunk
lecturesData.push({
  id: 14,
  title: "React API & Redux Thunk",
  badge: "CSC337 — Lecture 14",
  icon: "🌐",
  useSpecialComponent: "Lecture14",
  stats: [
    { n: "5", l: "Key Topics" },
    { n: "2", l: "Ghante" },
    { n: "5", l: "Quiz MCQs" },
  ],
  heroTitle: "React API & Redux Thunk 🌐",
  heroDesc: "API Integration seekhein global state management aur asynchronous actions ke saath.",
  sections: [],
});

// Lecture 15 — Unit Testing & MERN Implementation
lecturesData.push({
  id: 15,
  title: "Unit Testing & Complete MERN Implementation",
  badge: "CSC337 — Lecture 15",
  icon: "🏆",
  useSpecialComponent: "Lecture15",
  stats: [
    { n: "5", l: "Key Topics" },
    { n: "2", l: "Ghante" },
    { n: "5", l: "Quiz MCQs" },
  ],
  heroTitle: "MERN Stack aur React Testing 🏆",
  heroDesc: "React Testing Library, Jest mindset, Mocking aur Complete MERN Stack (React → Express → MongoDB) ka integration seekhain!",
  sections: [],
});

