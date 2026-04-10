import { motion } from 'framer-motion'

/**
 * Hero title: full "CUI SkillSphere" with animated electric gradient (index.css).
 * Entrance via Framer; hover uses CSS scale + glow on `.skillsphere-hero-title` (no jittery motion).
 */
export default function CuiSkillSphereTitle({ className = '' }) {
  return (
    <motion.h1
      className={`max-w-3xl text-[1.875rem] font-bold leading-[1.1] tracking-[-0.02em] sm:text-4xl sm:leading-[1.08] md:max-w-4xl md:text-5xl md:tracking-[-0.025em] lg:text-5xl lg:leading-[1.06] xl:text-6xl ${className}`.trim()}
      initial={{ opacity: 0, y: -28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
    >
      <span className="skillsphere-hero-title">
        <span className="animate-skillsphere-gradient bg-clip-text text-transparent">
          CUI SkillSphere
        </span>
      </span>
    </motion.h1>
  )
}
