import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaHtml5, FaCss3Alt, FaBootstrap, FaJs, FaReact,
  FaLaravel, FaNodeJs, FaGitAlt, FaGithub, FaAngular, FaSass, FaPlug
} from 'react-icons/fa6';
import { 
  SiTailwindcss, SiExpress, SiFlutter, SiDart, 
  SiAndroidstudio, SiCanva, SiFirebase, SiXampp,
  SiMysql, SiMongodb, SiFlask, SiVercel, SiPostman, SiSupabase
} from 'react-icons/si';
import { VscVscode } from 'react-icons/vsc';

const Skills = () => {
  const skillCategories = [
    {
      title: "Frontend",
      skills: [
        { name: "HTML5", icon: <FaHtml5 className="text-[#E34F26]" /> },
        { name: "CSS3", icon: <FaCss3Alt className="text-[#1572B6]" /> },
        { name: "Bootstrap", icon: <FaBootstrap className="text-[#7952B3]" /> },
        { name: "JavaScript", icon: <FaJs className="text-[#F7DF1E]" /> },
        { name: "React", icon: <FaReact className="text-[#61DAFB]" /> },
        { name: "Angular", icon: <FaAngular className="text-[#DD0031]" /> },
        { name: "Tailwind CSS", icon: <SiTailwindcss className="text-[#06B6D4]" /> },
        { name: "Sass (SCSS)", icon: <FaSass className="text-[#CC6699]" /> },
      ]
    },
    {
      title: "Backend & Database",
      skills: [
        { name: "Laravel", icon: <FaLaravel className="text-[#FF2D20]" /> },
        { name: "Node.js", icon: <FaNodeJs className="text-[#339933]" /> },
        { name: "Express.js", icon: <SiExpress className="text-white" /> },
        { name: "Python (Flask)", icon: <SiFlask className="text-white" /> },
        { name: "API Integration", icon: <FaPlug className="text-[#00f0ff]" /> },
        { name: "MySQL", icon: <SiMysql className="text-[#4479A1]" /> },
        { name: "MongoDB", icon: <SiMongodb className="text-[#47A248]" /> },
        { name: "Firebase", icon: <SiFirebase className="text-[#FFCA28]" /> },
      ]
    },
    {
      title: "Mobile Development",
      skills: [
        { name: "Flutter", icon: <SiFlutter className="text-[#02569B]" /> },
        { name: "Dart", icon: <SiDart className="text-[#0175C2]" /> },
        { name: "Firebase Integration", icon: <SiFirebase className="text-[#FFCA28]" /> },
        { name: "Supabase Integration", icon: <SiSupabase className="text-[#3ECF8E]" /> },
      ]
    },
    {
      title: "Tools & Platforms",
      skills: [
        { name: "Git", icon: <FaGitAlt className="text-[#F05032]" /> },
        { name: "GitHub", icon: <FaGithub className="text-white" /> },
        { name: "VS Code", icon: <VscVscode className="text-[#007ACC]" /> },
        { name: "Android Studio", icon: <SiAndroidstudio className="text-[#3DDC84]" /> },
        { name: "Canva", icon: <SiCanva className="text-[#00C4CC]" /> },
        { name: "XAMPP", icon: <SiXampp className="text-[#FB7A24]" /> },
        { name: "Vercel", icon: <SiVercel className="text-white" /> },
        { name: "Postman", icon: <SiPostman className="text-[#FF6C37]" /> },
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
  };

  return (
    <section id="skills" className="py-20 min-h-screen flex items-center">
      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-poppins mb-4 inline-block relative">
            <span className="text-white">Technical </span>
            <span className="neon-text">Skills</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto mt-6">
            Technologies and tools I use to design and develop modern, scalable web and mobile applications.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {skillCategories.map((category, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-8 rounded-2xl border-t border-t-[#00f0ff]/30 hover:border-[#00f0ff]/60 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(0,240,255,0.15)] transition-all duration-300"
            >
              <h3 className="text-2xl font-semibold text-white mb-6 font-poppins">{category.title}</h3>
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-4 gap-4"
              >
                {category.skills.map((skill, idx) => (
                  <motion.div 
                    key={idx} 
                    variants={itemVariants}
                    whileHover={{ scale: 1.1, y: -5 }}
                    className="flex flex-col items-center justify-center p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#00f0ff]/50 transition-all group"
                  >
                    <div className="text-4xl mb-2 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">
                      {skill.icon}
                    </div>
                    <span className="text-xs text-slate-400 group-hover:text-white text-center font-medium">
                      {skill.name}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
