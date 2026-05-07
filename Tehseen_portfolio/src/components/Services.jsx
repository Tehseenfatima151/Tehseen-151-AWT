import React from 'react';
import { motion } from 'framer-motion';
import { FiMonitor, FiCpu, FiLayout, FiSmartphone, FiCode, FiZap } from 'react-icons/fi';
import { SiFlutter } from 'react-icons/si';

const Services = () => {
  const services = [
    {
      title: "Web Development",
      description: "Building responsive, high-performance websites and web applications using modern frameworks like React and Laravel.",
      icon: <FiMonitor size={32} className="text-[#00f0ff]" />
    },
    {
      title: "AI Projects",
      description: "Integrating intelligent solutions and AI concepts to create smart applications that solve real-world problems.",
      icon: <FiCpu size={32} className="text-[#8a2be2]" />
    },
    {
      title: "UI/UX Design",
      description: "Designing intuitive, user-friendly interfaces with a focus on premium aesthetics and smooth user experiences.",
      icon: <FiLayout size={32} className="text-pink-500" />
    },
    {
      title: "Android Development",
      description: "Building high-performance native Android apps using Java, Kotlin, and modern UI/UX principles. Experienced in REST APIs, Firebase, Maps, video processing, and real-time features.",
      icon: <FiSmartphone size={32} className="text-[#3DDC84]" />
    },
    {
      title: "Flutter Development",
      description: "Flutter developer specializing in scalable cross-platform applications, advanced state management, native integrations, and custom package development—including extending and enhancing existing packages.",
      icon: <SiFlutter size={32} className="text-[#02569B]" />
    },
    {
      title: "RESTful & GraphQL API Integration",
      description: "Expert in connecting apps with secure APIs using REST and GraphQL. Optimizing performance, caching, pagination, and real-time synchronization.",
      icon: <FiZap size={32} className="text-[#FFCA28]" />
    }
  ];

  return (
    <section id="services" className="py-20">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-poppins mb-4 inline-block relative">
            <span className="text-white">My </span>
            <span className="neon-text">Services</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-8 rounded-2xl text-center group hover:-translate-y-2 transition-all duration-300 border border-white/5 hover:border-[#00f0ff]/50 hover:shadow-[0_0_25px_rgba(0,240,255,0.2)]"
            >
              <div className="mx-auto w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {service.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-4 font-poppins">{service.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
