import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEye, FiExternalLink } from 'react-icons/fi';
import { SiGithub } from 'react-icons/si';
import ProjectModal from './ProjectModal';

// ── Category filter definitions ───────────────────────────────────────────────
const FILTERS = [
  { key: 'All',       label: 'All',          accent: '#00f0ff' },
  { key: 'Web',       label: 'Web',          accent: '#61DAFB' },
  { key: 'React',     label: 'React',        accent: '#61DAFB' },
  { key: 'Mobile',    label: 'Mobile App',   accent: '#54C5F8' },
  { key: 'Node',      label: 'Node.js',      accent: '#339933' },
  { key: 'WordPress', label: 'WordPress',    accent: '#21759B' },
  { key: 'Desktop',   label: 'Desktop',      accent: '#8a2be2' },
];

// ── Project data with category tags ──────────────────────────────────────────
const ALL_PROJECTS = [
  {
    title: "Scent Aura",
    fullTitle: "Scent Aura – Fragrance Store",
    type: "WordPress eCommerce Store",
    category: "WordPress",
    description: "A modern WooCommerce fragrance store featuring premium perfume collections and responsive shop layouts.",
    fullDescription: "A modern eCommerce fragrance store built with WordPress and WooCommerce, featuring premium perfume collections, responsive design, product management, and a seamless shopping experience.",
    image: "/wordpress store.jpeg",
    images: ["/6.PNG", "/7.PNG", "/8.PNG", "/9.PNG"],
    tags: ["WordPress", "WooCommerce", "Elementor", "XAMPP"],
    features: [
      "Elegant and responsive homepage design",
      "Product catalog with perfume listings",
      "Product categories, brands, and tags",
      "Shopping cart functionality",
      "User-friendly navigation",
      "About, Contact, Gallery, and Blog pages",
      "Mobile-friendly design",
      "WooCommerce-powered eCommerce system"
    ],
  },
  {
    title: "VoteSphere",
    fullTitle: "VoteSphere – Secure Online Election Management System",
    type: "Full Stack Election Platform",
    category: "React",
    description: "A secure online election platform supporting anonymous voting, role-based access, and real-time results.",
    fullDescription: "Developed a full-stack election management platform that enables organizations to create, manage, and conduct secure online elections. The system supports role-based access (Admin, Election Creator, Voter), anonymous voting, voter verification, election approvals, real-time results, audit trails, and secure election workflows.",
    image: "/ems1.PNG",
    images: ["/ems2.PNG", "/ems3.PNG", "/ems4.PNG", "/ems5.PNG"],
    github: "https://github.com/Tehseenfatima151/Tehseen-151-AWT/tree/main/EMS",
    tags: [
      "React.js",
      "TypeScript",
      "Tailwind CSS",
      "ShadCN UI",
      "Zustand",
      "Supabase",
      "PostgreSQL",
      "Recharts"
    ],
    features: [
      "Multi-role Authentication (Super Admin, Election Creator, Voter)",
      "Email Verification & Two-Factor Authentication (2FA)",
      "Election Creation & Approval Workflow",
      "Candidate Management System",
      "Secure Secret Voter ID Generation",
      "Anonymous One-Person-One-Vote Mechanism",
      "Real-Time Vote Counting & Election Results",
      "Voter Registration, Capacity Limits & Waitlists",
      "Row-Level Security (RLS) with Supabase",
      "Audit Logs & Transparency Dashboard",
      "Live Notifications & Election Reminders",
      "Responsive Dashboard for All User Roles",
      "Real-Time Analytics & Reporting",
      "Public Election Showcase with Audit Ledger",
      "Mobile Responsive Modern SaaS UI"
    ],
  },
  {
    title: "TrustCircle",
    fullTitle: "TrustCircle – Smart Committee Management & Trust-Based Financial Platform",
    type: "Full Stack Fintech Web Application",
    category: "Web",
    description: "A modern committee management platform that digitizes traditional committee and chit-fund operations.",
    fullDescription: "TrustCircle is a modern committee management platform that digitizes traditional committee/chit-fund operations. The platform enables users to create and join committees, manage monthly contributions, automate payout selection through a secure toss system, complete KYC verification, track trust scores, detect fraudulent activity, and monitor financial performance through real-time analytics dashboards.",
    image: "/cms0.PNG",
    images: ["/cms2.PNG", "/cms3.PNG", "/cms4.PNG", "/cms5.PNG"],
    github: "https://github.com/Tehseenfatima151/Tehseen-151-AWT/tree/main/CMS/cms-frontend",
    tags: [
      "Angular 17",
      "TypeScript",
      "SCSS",
      "Angular Material",
      "Firebase Authentication",
      "Cloud Firestore",
      "Firebase Hosting",
      "Cloudinary",
      "Chart.js",
      "RxJS"
    ],
    features: [
      "Committee Creation & Management",
      "Automated Payout Toss System",
      "Trust Score & Reputation Engine",
      "Multi-Step KYC Verification",
      "Fraud Detection & Monitoring",
      "Real-Time Notifications",
      "Committee Lifecycle Tracking",
      "Analytics Dashboard",
      "Admin Control Center",
      "Public Trust Leaderboard",
      "Fintech Landing Page"
    ],
  },
  {
    title: "TravelLand",
    type: "Web Application",
    category: "Web",
    description: "Online Travel System providing comprehensive booking and trip management features.",
    image: "/traveland.png",
    images: ["/traveland.png", "/traveland.png"],
    tags: ["Laravel", "PHP", "MySQL", "Bootstrap"],
    features: [
      "Comprehensive flight and hotel booking system.",
      "User dashboard for managing trips and reservations.",
      "Secure checkout process.",
      "Admin panel for managing packages and users."
    ],
    github: "https://github.com/Tehseenfatima151/Tehseen-151-WT",
  },
  {
    title: "Home Service App",
    type: "Mobile & Web App",
    category: "Mobile",
    description: "A dual-platform Web & Mobile App for booking and managing home-based services.",
    image: "/home service.jpeg",
    images: ["/home service.jpeg", "/home service.jpeg"],
    tags: ["Flutter", "Firebase", "Node.js"],
    features: [
      "Cross-platform support for Android, iOS, and Web.",
      "Real-time service booking and tracking.",
      "Separate provider and customer dashboards.",
      "In-app chat and push notifications."
    ],
    github: "https://github.com/Tehseenfatima151/FA23-BSE-151-Tehseen-/tree/main/Handyman_service_App/handyman_service_web_v11.14.3",
  },
  {
    title: "Smart Task Manager",
    type: "Mobile Application",
    category: "Mobile",
    description: "Intelligent task management application designed for productivity and organization.",
    image: "/taskmanager.jpeg",
    images: ["/taskmanager.jpeg", "/taskmanager.jpeg"],
    tags: ["Flutter", "Dart", "Local Storage"],
    features: [
      "Create, edit, and organize daily tasks.",
      "Custom categories and priority levels.",
      "Offline capability with secure local storage.",
      "Performance analytics and tracking."
    ],
    github: "https://github.com/Tehseenfatima151/FA23-BSE-151-Tehseen-/tree/main/Task%20manager%20app",
  },
  {
    title: "Foodify – Online Food Ordering",
    type: "Full-Stack Web App",
    category: "Node",
    description: "A full-stack online food ordering system where users can browse restaurants, view menus, and place orders.",
    image: "/foodify.PNG",
    images: ["/foodify.PNG", "/foodify.PNG"],
    tags: ["React", "Node.js", "Express", "MongoDB"],
    features: [
      "Interactive restaurant menus with filtering.",
      "Real-time cart and order management.",
      "Secure user authentication and profiles.",
      "Responsive, modern UI tailored for fast browsing."
    ],
    github: "https://github.com/Tehseenfatima151/Tehseen-151-AWT/tree/main/foodify",
  },
  {
    title: "CuiskillSphere – Learning Platform",
    type: "EdTech Platform",
    category: "React",
    description: "An online learning platform designed to help users explore and learn different skills through structured courses.",
    image: "/cuiskill.PNG",
    images: ["/cuiskill.PNG", "/cuiskill.PNG"],
    tags: ["React", "Node.js", "Supabase", "Tailwind"],
    features: [
      "Structured course modules and video integration.",
      "User progress tracking and skill assessments.",
      "Modern glassmorphism UI design.",
      "Real-time database integration via Supabase."
    ],
    github: "https://github.com/Tehseenfatima151/Tehseen-151-AWT/tree/main/university_skills",
    live: "https://cuiskillsphere.vercel.app/"
  },
  {
    title: "Tehseen Portfolio & CV Builder",
    type: "Web Application",
    category: "React",
    description: "A personal portfolio and CV builder project where users can create, customize, and showcase their professional resume.",
    image: "/tf portfolio.PNG",
    images: ["/tf portfolio.PNG", "/tf portfolio.PNG"],
    tags: ["React", "JavaScript", "Tailwind CSS"],
    features: [
      "Dynamic resume generation with custom templates.",
      "Export to PDF functionality.",
      "Fully responsive, dark-themed premium design.",
      "Smooth scroll and animated page transitions."
    ],
    github: "https://github.com/Tehseenfatima151/Tehseen-151-AWT/tree/main/Tehseen_portfolio",
    live: "https://tehseencv.vercel.app/"
  },
  {
    title: "POS Management System",
    type: "Enterprise Software",
    category: "Mobile",
    description: "Inventory Management System for retail points of sale with real-time tracking.",
    image: "/pos app.jpeg",
    images: ["/pos app.jpeg", "/pos app.jpeg"],
    tags: ["Flutter", "Firebase", "Firestore"],
    features: [
      "Real-time inventory and stock tracking.",
      "Sales analytics and reporting dashboard.",
      "Barcode scanning integration.",
      "Role-based access control for employees."
    ],
    github: "https://github.com/Tehseenfatima151/FA23-BSE-151-Tehseen-/tree/main/POS%20Full%20Inventory%20App",
  },
  {
    title: "Bear Runner",
    type: "Mobile Game",
    category: "Mobile",
    description: "An Endless Adventure mobile game with engaging mechanics and graphics.",
    image: "/bear runner.jpeg",
    images: ["/bear runner.jpeg", "/bear runner.jpeg"],
    tags: ["Flutter", "Flame Engine", "Dart"],
    features: [
      "Smooth 2D animations and endless level generation.",
      "Interactive obstacles and power-ups.",
      "Global high-score tracking.",
      "Optimized rendering for 60fps gameplay."
    ],
    github: "https://github.com/Tehseenfatima151/FA23-BSE-151-Tehseen-",
  },
  {
    title: "Smart CGPA Calculator",
    type: "Utility App",
    category: "Mobile",
    description: "Utility application for students to accurately calculate and predict CGPA.",
    image: "/cgpa.jpeg",
    images: ["/cgpa.jpeg", "/cgpa.jpeg"],
    tags: ["Flutter", "Dart", "Local Storage"],
    features: [
      "Semester-wise GPA calculation.",
      "Overall CGPA prediction based on target grades.",
      "Dark mode support.",
      "Save and export academic history."
    ],
    github: "https://github.com/Tehseenfatima151/FA23-BSE-151-Tehseen-/tree/main/CGPA%20Calculator",
  },
  // WordPress & Desktop projects will be added here by user
];

// ── Animated project card ──────────────────────────────────────────────────────
const ProjectCard = ({ project, index, onOpen }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 30, scale: 0.95 }}
    animate={{ opacity: 1, y: 0,  scale: 1    }}
    exit={{    opacity: 0, y: 20, scale: 0.95  }}
    transition={{ duration: 0.4, delay: index * 0.07, type: 'spring', stiffness: 180 }}
    onClick={() => onOpen(project)}
    className="glass-card rounded-2xl overflow-hidden group hover:scale-[1.02] cursor-pointer transition-all duration-300 flex flex-col hover:shadow-[0_10px_30px_rgba(138,43,226,0.2)] border border-white/5 hover:border-[#8a2be2]/40 bg-[#151120]"
  >
    {/* Image */}
    <div className="relative h-44 overflow-hidden">
      <img
        src={project.image}
        alt={project.title}
        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
      />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#151120] to-transparent opacity-50" />
      {/* Category badge on image */}
      <div className="absolute top-3 right-3">
        <span className="text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#00f0ff] border border-[#00f0ff]/30">
          {project.type}
        </span>
      </div>
    </div>

    {/* Content */}
    <div className="p-5 flex flex-col flex-grow relative z-10">
      <div className="flex flex-wrap gap-2 mb-4">
        {project.tags.slice(0, 3).map((tag, i) => (
          <span key={i} className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-[#00f0ff] border border-[#00f0ff]/30 shadow-[0_0_10px_rgba(0,240,255,0.1)]">
            {tag}
          </span>
        ))}
        {project.tags.length > 3 && (
          <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-slate-400 border border-white/10">
            +{project.tags.length - 3}
          </span>
        )}
      </div>

      <h3 className="text-xl font-bold text-white mb-2 font-poppins group-hover:text-[#8a2be2] transition-colors">{project.title}</h3>
      <p className="text-slate-400 text-xs mb-4 flex-grow line-clamp-3">{project.description}</p>

      <div className="flex items-center gap-2 mt-auto pt-4 border-t border-white/5">
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold transition-all group-hover:border-[#8a2be2]/50 group-hover:text-[#00f0ff]">
          <FiEye size={16} /> View Details
        </button>
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 text-white text-sm font-semibold transition-all hover:shadow-[0_0_12px_rgba(255,255,255,0.1)]"
            title="View on GitHub"
          >
            <SiGithub size={16} />
          </a>
        )}
        {project.live && (
          <a
            href={project.live}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-[#8a2be2]/20 hover:bg-[#8a2be2]/30 border border-[#8a2be2]/30 text-white text-sm font-semibold transition-all hover:shadow-[0_0_15px_rgba(138,43,226,0.3)]"
            title="View Live"
          >
            <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse" />
            <FiExternalLink size={15} className="text-[#00f0ff]" />
          </a>
        )}
      </div>
    </div>
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────
const Projects = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);

  const filtered = activeFilter === 'All'
    ? ALL_PROJECTS
    : ALL_PROJECTS.filter(p => p.category === activeFilter);

  return (
    <section id="projects" className="py-20 min-h-screen relative">
      <div className="w-full">

        {/* ── Marquee Heading ── */}
        <div
          className="w-full overflow-hidden mb-12 py-4 select-none"
          style={{ WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)' }}
        >
          <div className="flex whitespace-nowrap" style={{ animation: 'marqueeScroll 18s linear infinite' }}>
            {[...Array(4)].map((_, i) => (
              <span key={i} className="flex items-center shrink-0 pr-16">
                <span className="text-5xl md:text-7xl font-extrabold font-poppins text-white tracking-tight">Featured</span>
                <span className="text-5xl md:text-7xl font-extrabold font-poppins neon-text tracking-tight ml-4">
                  Works<span style={{ display:'inline-block', verticalAlign:'middle', fontSize:'0.55em', lineHeight:1, marginBottom:'0.05em' }}>●</span>
                </span>
                <span className="text-5xl md:text-7xl font-extrabold font-poppins text-[#8a2be2] tracking-tight ml-12">
                  Projects<span style={{ display:'inline-block', verticalAlign:'middle', fontSize:'0.55em', lineHeight:1, marginBottom:'0.05em' }}>●</span>
                </span>
                <span className="text-5xl md:text-7xl font-extrabold font-poppins ml-12 text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#8a2be2]">
                  Portfolio<span style={{ display:'inline-block', verticalAlign:'middle', fontSize:'0.55em', lineHeight:1, marginBottom:'0.05em', WebkitTextFillColor:'#00f0ff' }}>●</span>
                </span>
              </span>
            ))}
          </div>
          <style>{`@keyframes marqueeScroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }`}</style>
        </div>

        {/* ── Filter Tabs ── */}
        <div className="max-w-6xl mx-auto px-6 lg:px-8 mb-10">
          <div className="flex flex-wrap justify-center gap-3">
            {FILTERS.map((f) => {
              const isActive = activeFilter === f.key;
              return (
                <motion.button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  whileTap={{ scale: 0.94 }}
                  className="relative px-5 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-300 overflow-hidden"
                  style={{
                    color: isActive ? f.accent : 'rgba(200,210,230,0.85)',
                    border: isActive ? `1.5px solid ${f.accent}88` : '1.5px solid rgba(255,255,255,0.18)',
                    background: isActive ? `${f.accent}18` : 'rgba(255,255,255,0.05)',
                    boxShadow: isActive ? `0 0 20px ${f.accent}44` : '0 0 0px transparent',
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="filter-active"
                      className="absolute inset-0 rounded-full"
                      style={{ background: `radial-gradient(ellipse at center, ${f.accent}18 0%, transparent 70%)` }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {f.key === 'All' && (
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ background: isActive ? '#00f0ff' : 'rgba(200,210,230,0.5)' }}
                      />
                    )}
                    {f.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── Project Cards Grid ── */}
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeFilter}
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filtered.map((project, index) => (
                <ProjectCard
                  key={project.title}
                  project={project}
                  index={index}
                  onOpen={setSelectedProject}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Empty state */}
          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 text-slate-500"
            >
              <p className="text-lg font-semibold">No projects in this category yet.</p>
              <p className="text-sm mt-2">Check back soon — more projects are on the way! 🚀</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Project Details Modal ── */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </section>
  );
};

export default Projects;
