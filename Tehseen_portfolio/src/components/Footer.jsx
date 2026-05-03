import React from 'react';
import { Link } from 'react-scroll';
import { SiGithub, SiWhatsapp } from 'react-icons/si';
import { FaLinkedin } from 'react-icons/fa6';

const Footer = () => {
  return (
    <footer className="py-8 border-t border-white/10 mt-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div>
          <Link to="home" smooth={true} duration={500} className="text-2xl font-bold font-poppins neon-text cursor-pointer">
            Tehseen Fatima.
          </Link>
        </div>

        {/* Social Icons */}
        <div className="flex items-center gap-6">
          <a href="https://github.com/Tehseenfatima151/FA23-BSE-151-Tehseen-" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors hover:-translate-y-1 transform inline-block">
            <SiGithub size={20} />
          </a>
          <a href="https://www.linkedin.com/in/tehseenfatima151?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#0A66C2] transition-colors hover:-translate-y-1 transform inline-block">
            <FaLinkedin size={20} />
          </a>
          <a href="https://wa.me/923087991947" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#25D366] transition-colors hover:-translate-y-1 transform inline-block">
            <SiWhatsapp size={20} />
          </a>
        </div>

        {/* Copyright */}
        <p className="text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} Tehseen Fatima. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
