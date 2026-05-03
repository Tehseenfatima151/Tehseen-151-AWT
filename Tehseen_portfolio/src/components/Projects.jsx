import React from 'react';
import { motion } from 'framer-motion';
import { FiGithub, FiExternalLink } from 'react-icons/fi';

const Projects = () => {
  const projects = [
    {
      title: "TravelLand",
      description: "Online Travel System providing comprehensive booking and trip management features.",
      image: "/traveland.png",
      tags: ["Laravel", "PHP", "MySQL", "Bootstrap", "JavaScript"],
      github: "https://github.com/Tehseenfatima151/Tehseen-151-WT",
      demo: "#"
    },
    {
      title: "Home Service App",
      description: "A dual-platform Web & Mobile App for booking and managing home-based services.",
      image: "/home service.jpeg",
      tags: ["Flutter", "Firebase", "Dart", "Node.js"],
      github: "https://github.com/Tehseenfatima151/FA23-BSE-151-Tehseen-",
      demo: "#"
    },
    {
      title: "Smart Task Manager",
      description: "Intelligent task management application designed for productivity and organization.",
      image: "/taskmanager.jpeg",
      tags: ["Flutter", "Dart", "Local Storage"],
      github: "https://github.com/Tehseenfatima151/FA23-BSE-151-Tehseen-",
      demo: "#"
    },
    {
      title: "Foodify – Online Food Ordering System",
      description: "A full-stack online food ordering system where users can browse restaurants, view menus, add items to cart, and place orders easily with a smooth UI experience.",
      image: "/foodify.PNG",
      tags: ["React", "Node.js", "Express.js", "MongoDB", "Tailwind CSS"],
      github: "https://github.com/Tehseenfatima151",
      demo: "#"
    },
    {
      title: "CuiskillSphere – Skill Learning Platform",
      description: "An online learning platform designed to help users explore and learn different skills through structured courses, interactive content, and progress tracking.",
      image: "/cuiskill.PNG",
      tags: ["React", "Node.js", "Express.js", "Supabase", "Tailwind CSS"],
      github: "https://github.com/Tehseenfatima151",
      demo: "#"
    },
    {
      title: "Tehseen Portfolio & CV Builder",
      description: "A personal portfolio and CV builder project where users can create, customize, and showcase their professional resume and portfolio online.",
      image: "/tf portfolio.PNG",
      tags: ["HTML", "CSS", "JavaScript", "React", "Tailwind CSS"],
      github: "https://github.com/Tehseenfatima151",
      demo: "#"
    },
    {
      title: "POS Management System",
      description: "Inventory Management System for retail points of sale with real-time tracking.",
      image: "/pos app.jpeg",
      tags: ["Flutter", "Dart", "Firebase", "Cloud Firestore"],
      github: "https://github.com/Tehseenfatima151/FA23-BSE-151-Tehseen-",
      demo: "#"
    },
    {
      title: "Bear Runner",
      description: "An Endless Adventure mobile game with engaging mechanics and graphics.",
      image: "/bear runner.jpeg",
      tags: ["Flutter", "Dart", "Game Engine"],
      github: "https://github.com/Tehseenfatima151/FA23-BSE-151-Tehseen-",
      demo: "#"
    },
    {
      title: "Smart CGPA Calculator",
      description: "Utility application for students to accurately calculate and predict CGPA.",
      image: "/cgpa.jpeg",
      tags: ["Flutter", "Dart", "Local Storage"],
      github: "https://github.com/Tehseenfatima151/FA23-BSE-151-Tehseen-",
      demo: "#"
    }
  ];

  return (
    <section id="projects" className="py-20 min-h-screen">
      <div className="w-full">
        {/* ── Marquee Heading ── */}
        <div className="w-full overflow-hidden mb-16 py-4 select-none" style={{ WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)' }}>
          <div className="flex whitespace-nowrap" style={{ animation: 'marqueeScroll 18s linear infinite' }}>
            {/* Duplicate 4× for seamless loop on all screen sizes */}
            {[...Array(4)].map((_, i) => (
              <span key={i} className="flex items-center shrink-0 pr-16">
                <span className="text-5xl md:text-7xl font-extrabold font-poppins text-white tracking-tight">Featured</span>
                <span className="text-5xl md:text-7xl font-extrabold font-poppins neon-text tracking-tight ml-4">
                  Works<span style={{ display: 'inline-block', verticalAlign: 'middle', fontSize: '0.55em', lineHeight: 1, marginBottom: '0.05em' }}>●</span>
                </span>
                <span className="text-5xl md:text-7xl font-extrabold font-poppins text-[#8a2be2] tracking-tight ml-12">
                  Projects<span style={{ display: 'inline-block', verticalAlign: 'middle', fontSize: '0.55em', lineHeight: 1, marginBottom: '0.05em' }}>●</span>
                </span>
                <span className="text-5xl md:text-7xl font-extrabold font-poppins ml-12" style={{ WebkitTextStroke: '1px rgba(0,240,255,0.6)', color: 'transparent' }}>
                  Portfolio<span style={{ display: 'inline-block', verticalAlign: 'middle', fontSize: '0.55em', lineHeight: 1, marginBottom: '0.05em', WebkitTextStroke: '1px rgba(0,240,255,0.6)' }}>●</span>
                </span>
              </span>
            ))}
          </div>

          <style>{`
            @keyframes marqueeScroll {
              0%   { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card rounded-2xl overflow-hidden group hover:-translate-y-2 transition-all duration-300 flex flex-col hover:shadow-[0_0_20px_rgba(138,43,226,0.3)] border border-white/5 hover:border-[#8a2be2]/50"
            >
              {/* Project Image Placeholder */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              {/* Project Details */}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-white mb-2 font-poppins group-hover:text-[#00f0ff] transition-colors">{project.title}</h3>
                <p className="text-slate-400 text-sm mb-4 flex-grow">{project.description}</p>
                
                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className="text-xs font-medium px-2 py-1 bg-white/5 rounded-md text-[#8a2be2] border border-[#8a2be2]/30 hover:bg-[#8a2be2]/20 hover:border-[#8a2be2] hover:-translate-y-1 hover:text-white transition-all cursor-default">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 mt-auto">
                  <a 
                    href={project.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-slate-300 hover:text-[#00f0ff] transition-colors text-sm font-medium"
                  >
                    <FiGithub size={18} />
                    Code
                  </a>
                  {project.demo !== "#" && (
                    <a 
                      href={project.demo} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-slate-300 hover:text-[#00f0ff] transition-colors text-sm font-medium ml-auto"
                    >
                      Live Demo
                      <FiExternalLink size={18} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
