import React from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiBriefcase, FiAward, FiBookOpen } from 'react-icons/fi';

const EXPERIENCES = [
  {
    role: "Full Stack Web & Mobile App Developer",
    company: "Freelance & Open Source Contribution",
    duration: "Jul 2024 - Present",
    accent: "#00f0ff",
    icon: <FiBriefcase size={20} />,
    description: "Developing modern end-to-end applications utilizing bleeding-edge frameworks. Specializing in highly interactive fintech solutions and secure dashboards.",
    bulletPoints: [
      "Built TrustCircle, an Angular 17 & Firebase fintech platform automating traditional committee payout tosses and KYC tracking.",
      "Developed VoteSphere, a Supabase & React-based online election manager featuring row-level security and real-time analytics.",
      "Engineered cross-platform mobile apps using Flutter & Dart, implementing custom state management and native integration capabilities."
    ],
    skills: ["Angular 17", "React.js", "Flutter", "Firebase", "Supabase", "TypeScript"]
  },
  {
    role: "Frontend Developer (Internship)",
    company: "Software Development Hub",
    duration: "Jan 2024 - Jun 2024",
    accent: "#8a2be2",
    icon: <FiAward size={20} />,
    description: "Focused on frontend engineering, interactive web applications, and integration of responsive user interfaces.",
    bulletPoints: [
      "Translated complex Figma designs into modern interactive dashboards using React.js and Tailwind CSS.",
      "Integrated secure third-party RESTful APIs and set up global states using Zustand for high-performance frontend data flow.",
      "Optimized website page performance and core web vitals, improving Lighthouse scores by 25%."
    ],
    skills: ["React.js", "Zustand", "Tailwind CSS", "REST APIs", "Framer Motion"]
  },
  {
    role: "Mobile App Developer",
    company: "Academic Projects & Freelance",
    duration: "Sep 2022 - Dec 2023",
    accent: "#ec4899",
    icon: <FiBookOpen size={20} />,
    description: "Built mobile applications focusing on high-fidelity user interactions, offline storage solutions, and seamless user experiences.",
    bulletPoints: [
      "Created POS Management System and Home Service application using Flutter, Dart, and Cloud Firestore integration.",
      "Developed interactive Flame Engine mobile game 'Bear Runner' showing strong optimization of rendering pipelines.",
      "Managed local storage features in task managers and grade calculators using Hive and SQLite."
    ],
    skills: ["Flutter", "Dart", "Flame Engine", "Hive", "SQLite", "Firebase"]
  }
];

const Experience = () => {
  return (
    <section id="experience" className="py-24 relative overflow-hidden bg-[#050816]">
      {/* Decorative Background Glows */}
      <div className="absolute top-1/4 -right-40 w-96 h-96 bg-[#8a2be2]/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-[#00f0ff]/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-24"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-poppins mb-4 inline-block">
            <span className="text-white">My </span>
            <span className="neon-text">Experience</span>
          </h2>
          <p className="text-[11px] md:text-xs font-bold text-[#00f0ff] uppercase tracking-[0.4em] mt-3">
            A Chronology of Innovation & Building
          </p>
        </motion.div>

        {/* Timeline Layout */}
        <div className="relative w-full">
          
          {/* Central Vertical Timeline Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#00f0ff] via-[#8a2be2] to-[#ec4899] -translate-x-1/2 origin-top" />

          {EXPERIENCES.map((exp, idx) => {
            const isEven = idx % 2 === 0;

            return (
              <div
                key={idx}
                className="relative flex flex-col md:flex-row items-center w-full mb-10 last:mb-0"
              >
                {/* Timeline Connector Dot */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="absolute left-4 md:left-1/2 -translate-x-1/2 top-2 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-[#090918] border-2 shadow-[0_0_15px_rgba(0,0,0,0.8)] cursor-pointer"
                  style={{
                    borderColor: exp.accent,
                    boxShadow: `0 0 12px ${exp.accent}55`
                  }}
                  whileHover={{ scale: 1.15 }}
                >
                  <div 
                    className="flex items-center justify-center text-xs"
                    style={{ color: exp.accent }}
                  >
                    {exp.icon}
                  </div>
                </motion.div>

                {/* Card Container (Responsive Alternating Alignment) */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                  className={`w-full pl-12 md:pl-0 md:w-[44%] relative ${
                    isEven ? "md:mr-auto md:pr-8" : "md:ml-auto md:pl-8"
                  }`}
                >
                  <div
                    className={`glass-card p-4 md:p-5 rounded-xl border border-white/5 hover:border-[var(--glow)]/30 hover:shadow-[0_0_25px_rgba(var(--glow-rgb),0.12)] transition-all duration-300 group bg-gradient-to-tr from-[#130f1e]/85 to-[#1a152d]/85 backdrop-blur-md border-l-4 border-r-0 max-w-[440px] w-full ${
                      isEven ? "md:border-r-4 md:border-l-0" : "md:border-l-4 md:border-r-0"
                    }`}
                    style={{
                      '--glow': exp.accent,
                      '--glow-rgb': exp.accent === '#00f0ff' ? '0, 240, 255' : exp.accent === '#8a2be2' ? '138, 43, 226' : '236, 72, 153',
                      borderLeftColor: isEven ? 'transparent' : exp.accent,
                      borderRightColor: isEven ? exp.accent : 'transparent'
                    }}
                  >
                    {/* Top Row: Company Badge & Duration */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
                      <span
                        className="text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md bg-[var(--glow)]/10 border border-[var(--glow)]/20 text-[var(--glow)]"
                      >
                        {exp.company}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                        <FiCalendar size={11} className="text-[var(--glow)]" />
                        {exp.duration}
                      </div>
                    </div>

                    {/* Role Title */}
                    <h3 className="text-base md:text-lg font-extrabold text-white font-poppins group-hover:text-[var(--glow)] transition-colors duration-300 mb-2">
                      {exp.role}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-400 text-xs leading-relaxed mb-3">
                      {exp.description}
                    </p>

                    {/* Accomplishments */}
                    <ul className="space-y-1.5">
                      {exp.bulletPoints.map((point, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2">
                          <span
                            className="mt-2 w-1 h-1 rounded-full shrink-0"
                            style={{ backgroundColor: exp.accent }}
                          />
                          <span className="text-slate-300 text-xs leading-relaxed">
                            {point}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Experience;
