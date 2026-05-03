import React from 'react';
import { motion } from 'framer-motion';
import { FiBookOpen, FiTarget, FiCode } from 'react-icons/fi';

const About = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section id="about" className="py-20 min-h-screen flex items-center">
      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 w-full"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-poppins mb-8 block text-center w-full">
            <span className="text-white">About </span>
            <span className="neon-text">Me</span>
          </h2>
          
          <p className="text-slate-300 text-lg leading-relaxed w-full px-4 md:px-0 text-left">
            I am a passionate <span className="text-[#00f0ff] font-semibold">Web and Mobile App Developer</span> focused on creating modern, responsive, and user-friendly applications. I enjoy turning ideas into structured digital solutions using clean and efficient code. With hands-on experience in React, Flutter, Firebase, and modern technologies, I build scalable applications that combine performance with elegant and intuitive design.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2"
          >
            <div className="relative group perspective-1000">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00f0ff] to-[#8a2be2] rounded-2xl blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500"></div>
              <img 
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Developer Setup" 
                className="relative z-10 w-full h-auto rounded-2xl object-cover glass-card border-white/20 transform transition-transform duration-500 group-hover:rotate-y-6 group-hover:scale-[1.02]"
              />
            </div>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="w-full lg:w-1/2"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
              <motion.div variants={itemVariants} className="glass-card p-6 rounded-xl hover:-translate-y-2 transition-transform duration-300 group flex flex-col h-full">
                <FiBookOpen className="text-3xl text-[#8a2be2] mb-4 group-hover:text-[#00f0ff] transition-colors" />
                <h3 className="text-xl font-bold text-white mb-2 font-poppins">Education</h3>
                <p className="text-slate-400">Bachelor of Science in Software Engineering</p>
                <p className="text-slate-500 text-sm mt-1">Comsats University Islamabad Vehari campus</p>
              </motion.div>

              <motion.div variants={itemVariants} className="glass-card p-6 rounded-xl hover:-translate-y-2 transition-transform duration-300 group flex flex-col h-full">
                <FiTarget className="text-3xl text-[#00f0ff] mb-4 group-hover:text-[#8a2be2] transition-colors" />
                <h3 className="text-xl font-bold text-white mb-2 font-poppins">Objective</h3>
                <p className="text-slate-400 text-sm">
                  To grow as a software developer by building scalable, user-focused applications and continuously improving my technical expertise.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
