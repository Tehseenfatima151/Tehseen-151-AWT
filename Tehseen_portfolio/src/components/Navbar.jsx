import React, { useState, useEffect } from 'react';
import { Link } from 'react-scroll';
import { FiHome, FiUser, FiCode, FiFolder, FiBriefcase, FiMail } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { name: 'Home',     to: 'home',     icon: <FiHome size={18} /> },
  { name: 'About',    to: 'about',    icon: <FiUser size={18} /> },
  { name: 'Skills',   to: 'skills',   icon: <FiCode size={18} /> },
  { name: 'Projects', to: 'projects', icon: <FiFolder size={18} /> },
  { name: 'Services', to: 'services', icon: <FiBriefcase size={18} /> },
  { name: 'Contact',  to: 'contact',  icon: <FiMail size={18} /> },
];

const Navbar = () => {
  const [hovered, setHovered] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-center pt-5">
      {/* Glassmorphism pill — centered */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`flex items-center gap-1 px-4 py-2.5 rounded-full border transition-all duration-300 ${
          scrolled
            ? 'bg-[#050816]/80 border-white/15 shadow-[0_4px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl'
            : 'bg-white/5 border-white/10 backdrop-blur-md'
        }`}
      >
        {navLinks.map((link) => (
          <div
            key={link.name}
            className="relative flex flex-col items-center"
            onMouseEnter={() => setHovered(link.name)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Tooltip */}
            <AnimatePresence>
              {hovered === link.name && (
                <motion.span
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium bg-[#0d1224] text-[#00f0ff] border border-[#00f0ff]/30 rounded-md px-2.5 py-1 pointer-events-none shadow-lg"
                >
                  {link.name}
                  {/* Arrow */}
                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#00f0ff]/30" />
                </motion.span>
              )}
            </AnimatePresence>

            {/* Icon button */}
            <Link
              to={link.to}
              smooth={true}
              duration={500}
              spy={true}
              activeClass="active-nav"
              className="relative w-10 h-10 flex items-center justify-center rounded-full cursor-pointer text-white hover:text-[#00f0ff] transition-all group"
            >
              {/* Active / hover background */}
              <motion.span
                className="absolute inset-0 rounded-full bg-[#00f0ff]/10 opacity-0 group-hover:opacity-100 transition-opacity"
                layoutId="navHoverBg"
              />
              <span className="relative z-10">{link.icon}</span>
            </Link>
          </div>
        ))}
      </motion.div>
    </nav>
  );
};

export default Navbar;
