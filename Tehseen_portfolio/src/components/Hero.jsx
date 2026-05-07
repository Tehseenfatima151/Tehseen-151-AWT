import React from 'react';
import { motion, useMotionValue, useSpring, useTransform, motionValue } from 'framer-motion';
import { FiDownload, FiArrowUpRight } from 'react-icons/fi';
import { SiWhatsapp, SiReact, SiFlutter, SiFirebase, SiJavascript, SiTailwindcss, SiLaravel, SiNodedotjs } from 'react-icons/si';
import FireworksCanvas from './FireworksCanvas';

// ── Stable variant references (defined outside component) ──────────────────

const nameContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.045, delayChildren: 0.3 }
  }
};

const nameLetter = {
  hidden: { opacity: 0, x: -22, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const roleContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.055, delayChildren: 1.05 }
  }
};

const roleLetter = {
  hidden: { opacity: 0, x: -18, filter: 'blur(5px)' },
  visible: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: 'easeOut' }
});

// ──────────────────────────────────────────────────────────────────────────
const roles = ["Software Engineer", "Web Developer", "Mobile App Developer", "AI Enthusiast"];

const Hero = () => {
  const [roleIndex, setRoleIndex] = React.useState(0);
  const [displayText, setDisplayText] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [typingSpeed, setTypingSpeed] = React.useState(150);

  // 3D Tilt Values
  const x = motionValue(0);
  const y = motionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  React.useEffect(() => {
    const handleTyping = () => {
      const currentRole = roles[roleIndex];
      if (isDeleting) {
        setDisplayText(currentRole.substring(0, displayText.length - 1));
        setTypingSpeed(50);
      } else {
        setDisplayText(currentRole.substring(0, displayText.length + 1));
        setTypingSpeed(150);
      }

      if (!isDeleting && displayText === currentRole) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && displayText === "") {
        setIsDeleting(false);
        setRoleIndex((prev) => (prev + 1) % roles.length);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, roleIndex, typingSpeed]);

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-24 overflow-hidden">

      <FireworksCanvas />

      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(5,8,22,0.15) 0%, rgba(5,8,22,0.55) 100%)' }}
      />

      <div className="w-full relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto px-4">

        {/* ── Advanced 3D Interactive Profile Section ── */}
        <motion.div
          {...fadeUp(0)}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative mb-12 mt-8 group cursor-none perspective-1000"
        >
          {/* Levitation Wrapper (Floating Motion) */}
          <motion.div
            animate={{ y: [-10, 10, -10], rotate: [-1, 1, -1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            {/* Layer 1: Deep Aura Glow (Reactive) */}
            <div className="absolute inset-[-20px] bg-gradient-to-tr from-[#00f0ff] via-[#8a2be2] to-[#00f0ff] rounded-full blur-[60px] opacity-20 group-hover:opacity-50 transition-all duration-1000"></div>
            
            {/* Layer 2: Rotating Cyber Ring (Thin Neon) */}
            <div className="absolute inset-[-15px] rounded-full p-[1px] animate-[spin_10s_linear_infinite] opacity-60">
              <div className="w-full h-full rounded-full bg-gradient-to-r from-[#00f0ff] via-transparent to-[#00f0ff]"></div>
            </div>
            
            {/* Layer 3: Perfectly Balanced & Colorful Tech Orbit */}
            {[
              { Icon: SiReact, color: "#61DAFB" },
              { Icon: SiFlutter, color: "#02569B" },
              { Icon: SiLaravel, color: "#FF2D20" },
              { Icon: SiNodedotjs, color: "#339933" },
              { Icon: SiJavascript, color: "#F7DF1E" },
            ].map((skill, index) => (
              <motion.div 
                key={index}
                initial={{ rotate: index * 72 }}
                animate={{ rotate: index * 72 + 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-15px] rounded-full pointer-events-none"
              >
                <motion.div
                  initial={{ rotate: -(index * 72) }}
                  animate={{ rotate: -(index * 72 + 360) }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border border-white/20 flex items-center justify-center bg-[#050816] transition-all shadow-lg overflow-visible"
                  style={{ 
                    boxShadow: `0 0 12px ${skill.color}66`,
                  }}
                >
                  {/* Ultra-Balanced Icon */}
                  <skill.Icon style={{ color: skill.color }} size={12} className="drop-shadow-[0_0_3px_rgba(255,255,255,0.3)]" />
                  
                  {/* Subtle Energy Aura */}
                  <div className="absolute inset-0 rounded-full animate-ping opacity-20 scale-150" style={{ backgroundColor: skill.color }}></div>
                </motion.div>
              </motion.div>
            ))}

            {/* Layer 4: Inner Glass Border & Main Image (Resized for better balance) */}
            <div 
              style={{ transform: "translateZ(50px)" }}
              className="relative z-10 w-40 h-40 md:w-48 md:h-48 rounded-full p-[3px] bg-gradient-to-tr from-[#00f0ff] via-[#8a2be2] to-[#00f0ff] bg-[length:200%_200%] animate-[shimmer_4s_linear_infinite] shadow-[0_0_40px_rgba(0,240,255,0.2)] group-hover:shadow-[0_0_80px_rgba(0,240,255,0.5)] transition-all duration-500"
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-[#050816] relative">
                <img 
                  src="/tehseen.jpeg" 
                  alt="Tehseen Fatima" 
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-all duration-700 ease-out" 
                />
                {/* Subtle Scanline Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20"></div>
              </div>
            </div>

            {/* Custom Interactive Follower (Talent Flex) */}
            <div className="absolute -inset-4 bg-white/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          </motion.div>
        </motion.div>

        {/* ── Name: Tehseen Fatima — letter by letter ── */}
        <motion.div
          variants={nameContainer}
          initial="hidden"
          animate="visible"
          className="flex justify-center flex-wrap mb-3"
          style={{ textShadow: '0 0 30px rgba(0,240,255,0.4)' }}
        >
          {"Tehseen Fatima".split("").map((char, i) => (
            <motion.span
              key={i}
              variants={nameLetter}
              className="text-white font-bold font-poppins text-4xl md:text-6xl tracking-tight inline-block"
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.div>

        {/* ── Role: Software Engineer — Typewriter Effect ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center flex-wrap mb-4 h-8"
        >
          <span 
            className="font-bold text-xl md:text-2xl tracking-widest uppercase font-poppins inline-block min-w-[300px]"
            style={{ color: '#00f0ff', textShadow: '0 0 15px rgba(0,240,255,0.7)' }}
          >
            {displayText}
            <span className="animate-pulse ml-1 text-white">|</span>
          </span>
        </motion.div>

        {/* ── Description ── */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.0 }}
          className="text-slate-300 text-sm md:text-base max-w-xl mx-auto mb-10 leading-relaxed font-light"
        >
          Web and Mobile App Developer specializing in React, Flutter, and AI focused on building modern applications with intuitive design and seamless user experiences.
        </motion.p>

        {/* ── Buttons with Updated Styling ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full sm:w-auto pb-8"
        >
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="https://drive.google.com/file/d/13Wl2y2wJRm_tomxUqTefwk49XlsMPRHb/view?usp=drive_link"
            target="_blank"
            rel="noopener noreferrer"
            className="relative overflow-hidden w-full sm:w-52 h-14 rounded-xl bg-gradient-to-r from-[#00f0ff] via-[#8a2be2] to-[#00f0ff] bg-[length:200%_auto] animate-[shimmer_3s_linear_infinite] p-[1px] group shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all"
          >
            <div className="w-full h-full bg-transparent rounded-xl flex items-center justify-center gap-2 transition-all">
              <FiDownload className="text-white group-hover:scale-110 transition-transform" size={20} />
              <span className="text-white font-bold tracking-wider text-sm md:text-base uppercase">Download CV</span>
            </div>
          </motion.a>

          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="https://wa.me/923087991947"
            target="_blank"
            rel="noopener noreferrer"
            className="relative overflow-hidden w-full sm:w-52 h-14 rounded-xl bg-gradient-to-r from-[#00f0ff] via-[#8a2be2] to-[#00f0ff] bg-[length:200%_auto] animate-[shimmer_3s_linear_infinite] p-[1px] group transition-all"
          >
            <div className="w-full h-full bg-[#050816]/90 rounded-xl flex items-center justify-center gap-3 hover:bg-transparent transition-all">
              <span className="text-white font-bold tracking-wider text-sm md:text-base uppercase">Hire Me</span>
              <FiArrowUpRight className="text-white group-hover:scale-110 transition-transform" size={22} />
            </div>
          </motion.a>

          <style>{`
            @keyframes shimmer {
              0% { background-position: 0% 50%; }
              100% { background-position: 200% 50%; }
            }
          `}</style>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;
