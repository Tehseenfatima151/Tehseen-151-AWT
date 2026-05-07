import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { FiBookOpen, FiTarget, FiAward, FiZap } from 'react-icons/fi';
import { SiReact, SiFlutter, SiFirebase, SiJavascript, SiDart, SiTailwindcss, SiNodedotjs, SiLaravel, SiMongodb } from 'react-icons/si';

// ── Counter Component (triggers when in view) ──────────────────────────────
const Counter = ({ value, suffix, color }) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let current = 0;
    const step = () => {
      current += 1;
      setCount(current);
      if (current < value) requestAnimationFrame(step);
    };
    const timeout = setTimeout(() => requestAnimationFrame(step), 300);
    return () => clearTimeout(timeout);
  }, [started, value]);

  return (
    <span ref={ref} style={{ color }} className="font-extrabold font-poppins tabular-nums">
      {count}{suffix}
    </span>
  );
};

// ── Tilt Card with cursor-following glow ──────────────────────────────────
const TiltCard = ({ children, borderColor }) => {
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xSpring = useSpring(x, { stiffness: 200, damping: 20 });
  const ySpring = useSpring(y, { stiffness: 200, damping: 20 });
  const rotateX = useTransform(ySpring, [-0.5, 0.5], ['10deg', '-10deg']);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], ['-10deg', '10deg']);
  const [glowPos, setGlowPos] = useState({ x: '50%', y: '50%' });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(px);
    y.set(py);
    setGlowPos({
      x: `${((e.clientX - rect.left) / rect.width) * 100}%`,
      y: `${((e.clientY - rect.top) / rect.height) * 100}%`,
    });
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className="relative glass-card rounded-2xl overflow-hidden cursor-pointer group"
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
    >
      {/* Cursor-Following Glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
        style={{
          background: `radial-gradient(circle 120px at ${glowPos.x} ${glowPos.y}, ${borderColor}22, transparent 80%)`,
        }}
      />
      {/* Left border accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ backgroundColor: borderColor }} />
      <div className="pl-6 pr-5 py-5" style={{ transform: 'translateZ(20px)' }}>
        {children}
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const About = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const stats = [
    { value: 15, suffix: '+', label: 'Projects\nCompleted',  color: '#00f0ff' },
    { value: 100, suffix: '%', label: 'Passion\nLevel',       color: '#8a2be2' },
    { value: 10,  suffix: '+', label: 'Technologies\nMastered', color: '#00f0ff' },
    { value: 24,  suffix: '/7', label: 'Always\nAvailable',   color: '#8a2be2' },
  ];

  return (
    <section id="about" className="py-24 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-[#00f0ff]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-[#8a2be2]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">

        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-poppins mb-3 inline-block">
            <span className="text-white">About </span>
            <span className="neon-text">Me</span>
          </h2>
          <p className="text-[11px] md:text-xs font-bold text-[#00f0ff] uppercase tracking-[0.4em] mt-3">
            Turning Ideas into Digital Reality
          </p>
        </motion.div>

        {/* ── Main Two-Column Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">

          {/* LEFT: Bio + Tilt Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:col-span-7 space-y-7 order-2 lg:order-1"
          >
            <motion.div variants={itemVariants}>
              <p className="text-slate-300 text-lg leading-relaxed text-justify md:text-left">
                I am a passionate{' '}
                <span className="text-[#00f0ff] font-semibold">Web and Mobile App Developer</span>{' '}
                focused on creating modern, responsive, and user-friendly applications.
                With hands-on experience in React, Flutter, and Firebase, I build scalable
                applications that combine high performance with elegant and intuitive design.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <TiltCard borderColor="#8a2be2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-[#8a2be2]/15 flex items-center justify-center text-[#8a2be2]">
                    <FiBookOpen size={18} />
                  </div>
                  <h4 className="text-base font-bold text-white font-poppins">Education</h4>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Bachelor of Science in{' '}
                  <span className="text-white font-semibold">Software Engineering</span>{' '}
                  from Comsats University Islamabad.
                </p>
              </TiltCard>

              <TiltCard borderColor="#00f0ff">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-[#00f0ff]/15 flex items-center justify-center text-[#00f0ff]">
                    <FiTarget size={18} />
                  </div>
                  <h4 className="text-base font-bold text-white font-poppins">Objective</h4>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  To grow as a developer by building{' '}
                  <span className="text-white font-semibold">scalable, user-focused</span>{' '}
                  applications that solve real-world problems.
                </p>
              </TiltCard>
            </motion.div>
          </motion.div>

          {/* RIGHT: 3D Orbit Avatar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 flex justify-center items-center relative py-12 order-1 lg:order-2"
          >
            <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
              {/* Central Image */}
              <div className="relative z-10 w-48 h-48 md:w-60 md:h-60">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#00f0ff] to-[#8a2be2] rounded-full blur-[40px] opacity-40 animate-pulse" />
                <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/20 glass-card p-1">
                  <img
                    src="/tehseen.jpeg"
                    alt="Tehseen Fatima"
                    className="w-full h-full object-cover rounded-full transition-transform duration-700 hover:scale-110"
                  />
                </div>
              </div>

              {/* Orbiting Icons */}
              {[
                { Icon: SiReact,      color: 'text-[#61DAFB]', delay: 0  },
                { Icon: SiFlutter,    color: 'text-[#54C5F8]', delay: 2  },
                { Icon: SiFirebase,   color: 'text-[#FFCA28]', delay: 4  },
                { Icon: SiJavascript, color: 'text-[#F7DF1E]', delay: 6  },
                { Icon: SiDart,       color: 'text-[#0175C2]', delay: 8  },
                { Icon: SiTailwindcss,color: 'text-[#06B6D4]', delay: 10 },
                { Icon: SiNodedotjs,  color: 'text-[#339933]', delay: 12 },
                { Icon: SiLaravel,    color: 'text-[#FF2D20]', delay: 14 },
                { Icon: SiMongodb,    color: 'text-[#47A248]', delay: 16 },
              ].map((skill, index) => (
                <motion.div
                  key={index}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 18, repeat: Infinity, ease: 'linear', delay: skill.delay }}
                  className="absolute inset-0"
                >
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'linear', delay: skill.delay }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-[#0a0a1a]/80 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] z-20 hover:border-[#00f0ff]/50 transition-colors"
                  >
                    <skill.Icon className={`${skill.color} text-2xl md:text-3xl`} />
                  </motion.div>
                </motion.div>
              ))}

              {/* Decorative Rings */}
              <div className="absolute inset-0 border border-white/5 rounded-full animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-[15%] border border-white/5 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
            </div>
          </motion.div>
        </div>

        {/* ── Stats Strip ─────────────────────────────────────────────────── */}
        <div className="mt-20 relative">
          {/* Gradient divider line */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#00f0ff]/30 to-transparent mb-10" />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-white/5">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="flex flex-col items-center justify-center py-8 px-4 group relative overflow-hidden"
              >
                {/* Hover background shimmer */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(ellipse at center, ${stat.color}0d 0%, transparent 70%)` }}
                />

                {/* Number */}
                <div className="text-4xl md:text-5xl font-extrabold font-poppins leading-none mb-2">
                  <Counter value={stat.value} suffix={stat.suffix} color={stat.color} />
                </div>

                {/* Label */}
                <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-center whitespace-pre-line group-hover:text-slate-300 transition-colors">
                  {stat.label}
                </p>

                {/* Bottom accent line on hover */}
                <motion.div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full"
                  style={{ backgroundColor: stat.color }}
                  initial={{ width: 0 }}
                  whileInView={{ width: '60%' }}
                  transition={{ delay: i * 0.15 + 0.4, duration: 0.6 }}
                />
              </motion.div>
            ))}
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#8a2be2]/30 to-transparent mt-10" />
        </div>

      </div>
    </section>
  );
};

export default About;
