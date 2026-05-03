import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiMessageSquare, FiUser, FiSend, FiMapPin, FiCheckCircle, FiLoader } from 'react-icons/fi';
import { SiGithub, SiWhatsapp } from 'react-icons/si';
import { FaLinkedin } from 'react-icons/fa6';

const WHATSAPP_NUMBER = '923087991947';

const Contact = () => {
  const formRef = useRef();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('loading');

    const text =
      `Hello Tehseen! 👋%0A%0A` +
      `*Name:* ${encodeURIComponent(formData.name)}%0A` +
      `*Email:* ${encodeURIComponent(formData.email)}%0A%0A` +
      `*Message:*%0A${encodeURIComponent(formData.message)}`;

    // Brief delay for UX, then open WhatsApp
    setTimeout(() => {
      setStatus('success');
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 4000);
    }, 800);
  };

  return (
    <section id="contact" className="py-20 min-h-screen flex items-center">
      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-poppins mb-4 inline-block relative">
            <span className="text-white">Get In </span>
            <span className="neon-text">Touch</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto mt-6">
            Have a project in mind or just want to say hi? Feel free to reach out.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12 items-start max-w-5xl mx-auto">

          {/* ── Contact Info ── */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-5/12 space-y-8"
          >
            <div className="glass-card p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-white mb-6 font-poppins">Let's Connect & Collaborate</h3>

              <div className="space-y-6">
                <a href="mailto:shinefatim151@gmail.com" className="flex items-center gap-4 group">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-[#00f0ff] group-hover:bg-[#00f0ff] group-hover:text-[#050816] transition-all">
                    <FiMail size={20} />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Email</p>
                    <p className="text-white font-medium group-hover:text-[#00f0ff] transition-colors">shinefatim151@gmail.com</p>
                  </div>
                </a>

                <a href="https://wa.me/923087991947" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-[#25D366] group-hover:bg-[#25D366] group-hover:text-[#050816] transition-all">
                    <SiWhatsapp size={20} />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">WhatsApp</p>
                    <p className="text-white font-medium group-hover:text-[#25D366] transition-colors">+92 308 7991947</p>
                  </div>
                </a>

                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-[#8a2be2] group-hover:bg-[#8a2be2] group-hover:text-white transition-all">
                    <FiMapPin size={20} />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Location</p>
                    <p className="text-white font-medium">Punjab, Pakistan</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-white/10">
                <h4 className="text-white font-medium mb-4">Connect on Socials</h4>
                <div className="flex gap-4">
                  <a href="https://github.com/Tehseenfatima151/FA23-BSE-151-Tehseen-" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all hover:-translate-y-1">
                    <SiGithub size={20} />
                  </a>
                  <a href="https://www.linkedin.com/in/tehseenfatima151?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white transition-all hover:-translate-y-1">
                    <FaLinkedin size={20} />
                  </a>
                  <a href="https://wa.me/923087991947" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all hover:-translate-y-1">
                    <SiWhatsapp size={20} />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Contact Form ── */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-7/12"
          >
            <form ref={formRef} onSubmit={handleSubmit} className="glass-card p-8 rounded-2xl space-y-6">

              <div className="relative">
                <label className="text-slate-400 text-sm mb-2 block">Your Name</label>
                <div className="relative flex items-center">
                  <FiUser className="absolute left-4 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#050816]/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-slate-400 text-sm mb-2 block">Your Email</label>
                <div className="relative flex items-center">
                  <FiMail className="absolute left-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#050816]/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#8a2be2] focus:ring-1 focus:ring-[#8a2be2] transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-slate-400 text-sm mb-2 block">Your Message</label>
                <div className="relative">
                  <FiMessageSquare className="absolute left-4 top-4 text-slate-400" />
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="w-full bg-[#050816]/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all resize-none"
                    placeholder="How can I help you?"
                  ></textarea>
                </div>
              </div>

              {/* ── Status Notification ── */}
              <AnimatePresence>
                {status === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-green-400"
                  >
                    <FiCheckCircle size={18} />
                    <span className="text-sm font-medium">WhatsApp opened with your message! Just press Send. ✅</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Submit Button ── */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#8a2be2] to-[#00f0ff] text-white font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(138,43,226,0.6)] transition-all transform hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {status === 'loading' ? (
                  <>
                    <FiLoader className="animate-spin" size={18} />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <FiSend size={16} />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
