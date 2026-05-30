import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheckCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const ProjectModal = ({ project, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!project) return null;

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === project.images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? project.images.length - 1 : prev - 1));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0f0c29]/80 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-[#1a1625] rounded-3xl overflow-y-auto shadow-[0_0_50px_rgba(138,43,226,0.15)] border border-white/10 z-10 custom-scrollbar"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors backdrop-blur-md"
          >
            <FiX size={24} />
          </button>

          {/* Carousel Header */}
          <div className="relative w-full h-64 sm:h-80 md:h-96 bg-black group overflow-hidden">
            <AnimatePresence initial={false} mode="wait">
              <motion.img
                key={currentImageIndex}
                src={project.images[currentImageIndex]}
                alt={`${project.title} screenshot ${currentImageIndex + 1}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full object-cover object-center"
              />
            </AnimatePresence>

            {/* Gradient Overlay for bottom blending */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1625] via-transparent to-transparent opacity-90" />

            {/* Carousel Controls */}
            {project.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-[#8a2be2]/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md"
                >
                  <FiChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-[#00f0ff]/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md"
                >
                  <FiChevronRight size={24} />
                </button>

                {/* Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {project.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentImageIndex ? "bg-[#00f0ff] w-6" : "bg-white/50 hover:bg-white"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Modal Content */}
          <div className="p-6 sm:p-10 -mt-12 relative z-10">
            {/* Platform / App Type Tag */}
            <div className="inline-block px-3 py-1 mb-4 bg-white/5 border border-white/10 rounded-full text-xs font-semibold tracking-wider text-[#00f0ff] uppercase">
              {project.type || "Web & Mobile App"}
            </div>

            <h2 className="text-3xl md:text-4xl font-bold font-poppins text-white mb-4 leading-tight">
              {project.fullTitle || project.title}
            </h2>
            
            <p className="text-slate-300 text-lg leading-relaxed mb-8">
              {project.fullDescription || project.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Features Section */}
              {project.features && project.features.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold font-poppins text-white mb-4 flex items-center gap-2">
                    <FiCheckCircle className="text-[#8a2be2]" />
                    Key Features
                  </h3>
                  <ul className="space-y-3">
                    {project.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-[#8a2be2]/30 transition-colors">
                        <FiCheckCircle className="text-[#00f0ff] mt-1 shrink-0" />
                        <span className="text-slate-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tech Stack Section */}
              <div>
                <h3 className="text-lg font-semibold font-poppins text-white mb-4 flex items-center gap-2">
                  <span className="text-[#00f0ff]">⚙</span> Tech Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="px-4 py-2 bg-[#8a2be2]/10 text-[#00f0ff] border border-[#00f0ff]/20 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Bottom Actions if needed */}
            <div className="mt-10 pt-6 border-t border-white/10 flex justify-end">
               {project.live && (
                 <a 
                   href={project.live} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="px-6 py-2 bg-gradient-to-r from-[#00f0ff] to-[#8a2be2] text-white rounded-full font-medium hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all flex items-center gap-2"
                 >
                   <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                   Visit Live Project
                 </a>
               )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProjectModal;
