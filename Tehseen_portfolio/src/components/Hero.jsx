import React from 'react';
import { motion } from 'framer-motion';
import { FiDownload } from 'react-icons/fi';
import { SiWhatsapp } from 'react-icons/si';
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

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-24 overflow-hidden">

      <FireworksCanvas />

      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(5,8,22,0.15) 0%, rgba(5,8,22,0.55) 100%)' }}
      />

      <div className="w-full relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto px-4">

        {/* ── Profile Image ── */}
        <motion.div
          {...fadeUp(0)}
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="relative mb-8 mt-8"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-[#00f0ff] to-[#8a2be2] rounded-full blur-[40px] opacity-60 animate-pulse scale-125" />
          <motion.div
            animate={{ y: [-8, 8, -8] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-48 h-48 md:w-56 md:h-56 rounded-full bg-gradient-to-tr from-[#00f0ff]/30 to-[#8a2be2]/30 border-2 border-white/20 overflow-hidden shadow-[0_0_40px_rgba(0,240,255,0.45)]"
          >
            <img src="/tehseen.jpeg" alt="Tehseen Fatima" className="w-full h-full object-cover rounded-full" />
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

        {/* ── Role: Software Engineer — letter by letter ── */}
        <motion.div
          variants={roleContainer}
          initial="hidden"
          animate="visible"
          className="flex justify-center flex-wrap mb-4"
        >
          {"Software Engineer".split("").map((char, i) => (
            <motion.span
              key={i}
              variants={roleLetter}
              className="font-semibold text-lg md:text-xl tracking-widest uppercase font-poppins inline-block"
              style={{ color: '#00f0ff', textShadow: '0 0 15px rgba(0,240,255,0.7)' }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
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

        {/* ── Buttons ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto pb-8"
        >
          <motion.a
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            href="https://drive.google.com/file/d/13Wl2y2wJRm_tomxUqTefwk49XlsMPRHb/view?usp=drive_link"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-48 h-12 rounded-full bg-[#00f0ff] border border-[#00f0ff] hover:bg-[#00d0dd] transition-all flex items-center justify-center gap-2 group shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:shadow-[0_0_25px_rgba(0,240,255,0.6)]"
          >
            <FiDownload className="text-white group-hover:scale-110 transition-transform" size={18} />
            <span className="text-white font-semibold tracking-wide text-sm md:text-base">Download CV</span>
          </motion.a>

          <motion.a
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            href="https://wa.me/923087991947"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-48 h-12 rounded-full bg-[#8a2be2]/15 backdrop-blur-md border border-[#8a2be2]/30 hover:bg-[#8a2be2]/25 hover:border-[#8a2be2]/80 transition-all flex items-center justify-center gap-3 group shadow-[0_0_15px_rgba(138,43,226,0.15)] hover:shadow-[0_0_20px_rgba(138,43,226,0.4)]"
          >
            <SiWhatsapp className="text-[#25D366] group-hover:scale-110 transition-transform" size={20} />
            <span className="text-white font-medium text-sm md:text-base">Contact Me</span>
          </motion.a>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;
