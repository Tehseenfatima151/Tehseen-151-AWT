import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHtml5, FaCss3Alt, FaBootstrap, FaJs, FaReact,
  FaLaravel, FaNodeJs, FaGitAlt, FaGithub, FaAngular, FaSass, FaPlug,
  FaApple, FaAndroid, FaMobileScreen
} from 'react-icons/fa6';
import {
  SiTailwindcss, SiExpress, SiFlutter, SiDart,
  SiAndroidstudio, SiCanva, SiFirebase, SiXampp,
  SiMysql, SiMongodb, SiFlask, SiVercel, SiPostman, SiSupabase
} from 'react-icons/si';
import { VscVscode } from 'react-icons/vsc';

// ── Skill data ────────────────────────────────────────────────────────────────
const ALL_SKILLS = {
  Frontend: [
    { name: 'HTML5',      icon: <FaHtml5 />,      color: '#E34F26' },
    { name: 'CSS3',       icon: <FaCss3Alt />,     color: '#1572B6' },
    { name: 'Bootstrap',  icon: <FaBootstrap />,   color: '#7952B3' },
    { name: 'JavaScript', icon: <FaJs />,          color: '#F7DF1E' },
    { name: 'React',      icon: <FaReact />,       color: '#61DAFB' },
    { name: 'Angular',    icon: <FaAngular />,     color: '#DD0031' },
    { name: 'Tailwind',   icon: <SiTailwindcss />, color: '#06B6D4' },
    { name: 'Sass',       icon: <FaSass />,        color: '#CC6699' },
  ],
  Backend: [
    { name: 'Laravel',    icon: <FaLaravel />,     color: '#FF2D20' },
    { name: 'Node.js',    icon: <FaNodeJs />,      color: '#339933' },
    { name: 'Express.js', icon: <SiExpress />,     color: '#ffffff' },
    { name: 'Flask',      icon: <SiFlask />,       color: '#ffffff' },
    { name: 'REST APIs',  icon: <FaPlug />,        color: '#00f0ff' },
    { name: 'MySQL',      icon: <SiMysql />,       color: '#4479A1' },
    { name: 'MongoDB',    icon: <SiMongodb />,     color: '#47A248' },
    { name: 'Firebase',   icon: <SiFirebase />,    color: '#FFCA28' },
  ],
  Mobile: [
    { name: 'Flutter',     icon: <SiFlutter />,      color: '#02569B' },
    { name: 'Dart',        icon: <SiDart />,         color: '#0175C2' },
    { name: 'Firebase',    icon: <SiFirebase />,     color: '#FFCA28' },
    { name: 'Supabase',    icon: <SiSupabase />,     color: '#3ECF8E' },
    { name: 'React Native',icon: <FaReact />,        color: '#61DAFB' },
    { name: 'iOS',         icon: <FaApple />,        color: '#ffffff' },
    { name: 'Android',     icon: <FaAndroid />,      color: '#3DDC84' },
    { name: 'Cross Plat.', icon: <FaMobileScreen />, color: '#8a2be2' },
  ],
  Tools: [
    { name: 'Git',          icon: <FaGitAlt />,        color: '#F05032' },
    { name: 'GitHub',       icon: <FaGithub />,        color: '#ffffff' },
    { name: 'VS Code',      icon: <VscVscode />,       color: '#007ACC' },
    { name: 'Android Studio',icon: <SiAndroidstudio />,color: '#3DDC84' },
    { name: 'Canva',        icon: <SiCanva />,         color: '#00C4CC' },
    { name: 'XAMPP',        icon: <SiXampp />,         color: '#FB7A24' },
    { name: 'Vercel',       icon: <SiVercel />,        color: '#ffffff' },
    { name: 'Postman',      icon: <SiPostman />,       color: '#FF6C37' },
  ],
};

const TABS = [
  { key: 'Frontend', label: 'Frontend',   accent: '#61DAFB' },
  { key: 'Backend',  label: 'Backend',    accent: '#47A248' },
  { key: 'Mobile',   label: 'Mobile App', accent: '#54C5F8' },
  { key: 'Tools',    label: 'Tools',      accent: '#F05032' },
];

// Float presets — 8 unique gentle float paths
const FLOAT_PRESETS = [
  { y: [-6, 6],   dur: 3.2 },
  { y: [-8, 4],   dur: 3.8 },
  { y: [-4, 8],   dur: 4.1 },
  { y: [-7, 5],   dur: 3.5 },
  { y: [-5, 7],   dur: 4.4 },
  { y: [-9, 3],   dur: 3.0 },
  { y: [-6, 6],   dur: 4.7 },
  { y: [-4, 9],   dur: 3.6 },
];

// ── Single Skill Bubble ───────────────────────────────────────────────────────
const Bubble = ({ skill, index, accentColor }) => {
  const [hovered, setHovered] = useState(false);
  const fp = FLOAT_PRESETS[index % FLOAT_PRESETS.length];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.4, y: 20 }}
      animate={{ opacity: 1, scale: 1,   y: 0   }}
      exit={{    opacity: 0, scale: 0.4, y: -20  }}
      transition={{ duration: 0.45, delay: index * 0.055, type: 'spring', stiffness: 180, damping: 16 }}
      className="flex flex-col items-center gap-2"
    >
      {/* Floating wrapper */}
      <motion.div
        animate={{ y: fp.y }}
        transition={{ duration: fp.dur, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: index * 0.15 }}
        className="flex flex-col items-center gap-2"
      >
        {/* Bubble icon box */}
        <motion.div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          animate={{ scale: hovered ? 1.2 : 1 }}
          transition={{ duration: 0.2 }}
          className="relative w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-md cursor-default"
          style={{
            background: hovered ? `${skill.color}18` : 'rgba(255,255,255,0.04)',
            border: hovered ? `1.5px solid ${skill.color}99` : '1.5px solid rgba(255,255,255,0.08)',
            boxShadow: hovered ? `0 0 24px 4px ${skill.color}44, inset 0 0 12px ${skill.color}11` : '0 4px 24px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease',
          }}
        >
          {/* Ping aura on hover */}
          {hovered && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0.4 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 0.7, repeat: Infinity }}
              className="absolute inset-0 rounded-2xl"
              style={{ backgroundColor: skill.color }}
            />
          )}
          <span className="text-[1.6rem] relative z-10" style={{ color: skill.color, filter: hovered ? `drop-shadow(0 0 8px ${skill.color})` : 'none' }}>
            {skill.icon}
          </span>
        </motion.div>

        {/* Skill label */}
        <span
          className="text-[10px] font-semibold text-center leading-tight transition-colors duration-200 max-w-[68px]"
          style={{ color: hovered ? skill.color : 'rgba(148,163,184,0.8)' }}
        >
          {skill.name}
        </span>
      </motion.div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const Skills = () => {
  const [active, setActive] = useState('Frontend');
  const skills = ALL_SKILLS[active];
  const accent = TABS.find(t => t.key === active)?.accent ?? '#00f0ff';

  return (
    <section id="skills" className="py-24 relative overflow-hidden">
      {/* BG glows */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-[#00f0ff]/6 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-[#8a2be2]/6 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10">

        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-poppins mb-3">
            <span className="text-white">Technical </span>
            <span className="neon-text">Skills</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm mt-4">
            Technologies I use to build modern, scalable web and mobile applications.
          </p>
        </motion.div>

        {/* ── Filter Tabs ── */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {TABS.map((tab) => {
            const isActive = active === tab.key;
            return (
              <motion.button
                key={tab.key}
                onClick={() => setActive(tab.key)}
                whileTap={{ scale: 0.94 }}
                className="relative px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 overflow-hidden"
                style={{
                  color: isActive ? tab.accent : 'rgba(148,163,184,0.7)',
                  border: isActive ? `1.5px solid ${tab.accent}66` : '1.5px solid rgba(255,255,255,0.06)',
                  background: isActive ? `${tab.accent}12` : 'rgba(255,255,255,0.02)',
                  boxShadow: isActive ? `0 0 18px ${tab.accent}28` : 'none',
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 rounded-full"
                    style={{ background: `radial-gradient(ellipse at center, ${tab.accent}18 0%, transparent 70%)` }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* ── Canvas ── */}
        <div
          className="relative w-full rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(10,10,30,0.95) 0%, rgba(5,8,22,0.98) 100%)',
            border: `1px solid ${accent}22`,
            boxShadow: `0 0 50px ${accent}0a, 0 0 0 1px rgba(255,255,255,0.03), inset 0 0 80px rgba(0,0,0,0.4)`,
            transition: 'border-color 0.5s, box-shadow 0.5s',
          }}
        >
          {/* Top gradient line */}
          <div
            className="absolute top-0 left-0 right-0 h-[1.5px] transition-all duration-500"
            style={{ background: `linear-gradient(to right, transparent, ${accent}88, transparent)` }}
          />

          {/* Dot grid */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}
          />

          {/* Central radial glow */}
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-700"
            style={{ background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${accent}08 0%, transparent 70%)` }}
          />

          {/* Top bar */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3 relative z-10">
            <motion.span
              key={active}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[10px] font-extrabold uppercase tracking-[0.35em] px-3 py-1 rounded-full"
              style={{ color: accent, background: `${accent}15`, border: `1px solid ${accent}33` }}
            >
              {active}
            </motion.span>
            <span className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest">
              {skills.length} skills
            </span>
          </div>

          {/* ── Skills Grid — equal 4×2 layout ── */}
          <div className="px-6 pb-8 pt-2 relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-4 gap-y-8 gap-x-4"
              >
                {skills.map((skill, i) => (
                  <div key={skill.name} className="flex justify-center">
                    <Bubble skill={skill} index={i} accentColor={accent} />
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#050816]/60 to-transparent pointer-events-none" />
        </div>

        {/* Hint */}
        <p className="text-center text-slate-700 text-[10px] mt-5 tracking-[0.3em] uppercase">
          Click a tab · Hover a skill
        </p>
      </div>
    </section>
  );
};

export default Skills;
