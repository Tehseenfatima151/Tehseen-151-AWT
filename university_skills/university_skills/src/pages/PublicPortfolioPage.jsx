import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import PortfolioView from '../components/portfolio/PortfolioView'
import { Skeleton } from '../components/common/Skeleton'
import SiteBackground from '../components/layout/SiteBackground'

const teamPortfolios = {
  'super-admin': {
    hideEducation: true,
    name: 'Muhammad Abdullah',
    professional_title: 'Software Engineer & Instructor',
    department: 'COMSATS University Islamabad',
    semester: '-',
    profile_picture: '/team/sir.jpeg',
    bio: 'Experienced software engineer and instructor with expertise in modern web technologies, system design, and scalable application development. Passionate about mentoring students and guiding them in building real-world software solutions.',
    portfolio_url: 'https://muhammadabdullahwali.vercel.app',
    github_url: 'https://github.com/abdullah',
    linkedin_url: 'https://www.linkedin.com/in/abdullah',
    skills: [
      { id: 'sa-s1', skill_name: 'Web Development', skill_level: 'Expert' },
      { id: 'sa-s2', skill_name: 'Blogger', skill_level: 'Advanced' },
      { id: 'sa-s3', skill_name: 'Mobile App Development', skill_level: 'Advanced' },
      { id: 'sa-s4', skill_name: 'WordPress Development', skill_level: 'Expert' },
      { id: 'sa-s5', skill_name: 'Desktop React Development', skill_level: 'Advanced' },
    ],
    services: [
      {
        id: 'sa-v1',
        title: 'Full Stack Development',
        description:
          'End-to-end delivery of web platforms with robust frontends, APIs, and data layers—suited for production workloads and maintainable codebases.',
        offering_tags: 'React, Node.js, REST, SQL',
        availability: 'By arrangement',
      },
      {
        id: 'sa-v2',
        title: 'System Design',
        description:
          'Structuring scalable architectures, clear module boundaries, and pragmatic trade-offs for performance, reliability, and growth.',
        offering_tags: 'Architecture reviews, technical design',
        availability: 'Consulting / mentorship',
      },
      {
        id: 'sa-v3',
        title: 'Student Mentorship',
        description:
          'One-on-one and group guidance on modern web stacks, best practices, and career-ready project work for software engineering students.',
        offering_tags: 'Code reviews, learning paths',
        availability: 'Academic calendar',
      },
      {
        id: 'sa-v4',
        title: 'Project Supervision',
        description:
          'Oversight of student and course projects—from scope and design through implementation, testing, and presentation readiness.',
        offering_tags: 'Capstone, coursework, portfolio quality',
        availability: 'By arrangement',
      },
    ],
    projects: [
      {
        id: 'sa-p1',
        title: 'Jaand Airies — Modern WordPress Business Website (Designed, Developed & Deployed)',
        description:
          'A fully responsive business website built in WordPress with custom design, optimized structure, and fast loading — developed for a real client and deployed with complete branding.',
        tech_used: 'WordPress Development',
        cover_image: '/project-images/desighee.PNG',
      },
      {
        id: 'sa-p2',
        title: 'CUI Vehari Online Portal Website',
        description:
          'A modern and responsive university portal website developed to provide students with easy access to academic information, announcements, and campus resources online.',
        tech_used: 'HTML, CSS, JavaScript, PHP, Bootstrap, MySQL',
        cover_image: '/project-images/fyp-portal.PNG',
      },
    ],
    certificates: [
      {
        id: 'sa-c1',
        certificate_name: 'Advanced Web Development Certification',
        issue_date: 'Professional development',
        file_url: 'https://www.coursera.org/',
      },
      {
        id: 'sa-c2',
        certificate_name: 'Software Architecture Fundamentals',
        issue_date: 'Professional development',
        file_url: 'https://www.udemy.com/',
      },
    ],
    experience: [
      {
        id: 'sa-x1',
        role: 'Software Engineer / Lecturer',
        company: 'COMSATS University Islamabad',
        duration: '2020 - Present',
        description:
          'Teaching and engineering practice: delivering courses, supervising projects, and building software aligned with academic and industry standards.',
      },
    ],
  },
  'lead-dev': {
    name: 'Tehseen Fatima',
    professional_title: 'Software Engineering Student',
    department: 'Software Engineering',
    semester: '-',
    profile_picture: '/team/tehseen.jpeg',
    bio: 'Passionate software engineering student with a strong interest in web development, artificial intelligence, and building real-world applications. I enjoy creating modern, user-friendly systems that solve practical problems and enhance user experience.',
    github_url: 'https://github.com/yourusername',
    linkedin_url: 'https://linkedin.com/in/yourprofile',
    education: [
      {
        id: 'e1',
        degree: 'BS Software Engineering',
        university: 'COMSATS University Islamabad',
        year: '2023 - 2027',
      },
    ],
    experience: [
      {
        id: 'x1',
        role: 'Frontend Developer (Student Projects)',
        company: 'Academic & Personal Projects',
        duration: '2023 - Present',
        description:
          'Building responsive interfaces and React-based applications for course work and personal projects, focusing on usability and clean UI.',
      },
    ],
    skills: [
      { id: 'sk1', skill_name: 'HTML', skill_level: 'Expert' },
      { id: 'sk2', skill_name: 'CSS', skill_level: 'Expert' },
      { id: 'sk3', skill_name: 'JavaScript', skill_level: 'Intermediate' },
      { id: 'sk4', skill_name: 'React.js', skill_level: 'Intermediate' },
      { id: 'sk5', skill_name: 'Node.js', skill_level: 'Intermediate' },
      { id: 'sk6', skill_name: 'C++', skill_level: 'Intermediate' },
      { id: 'sk7', skill_name: 'Python', skill_level: 'Intermediate' },
      { id: 'sk8', skill_name: 'SQL', skill_level: 'Intermediate' },
    ],
    services: [
      {
        id: 'sv1',
        title: 'Web Development',
        description:
          'End-to-end implementation of responsive websites and web apps with semantic HTML, modern CSS, and JavaScript—structured for maintainability and performance.',
        offering_tags: 'Landing pages, SPAs, responsive layouts',
        availability: 'Part-time · Academic schedule',
      },
      {
        id: 'sv2',
        title: 'Frontend UI Design',
        description:
          'Clean, accessible interfaces with consistent typography, spacing, and components that improve clarity and user flow.',
        offering_tags: 'UI polish, component libraries, Tailwind/CSS',
        availability: 'By arrangement',
      },
      {
        id: 'sv3',
        title: 'React Web Applications',
        description:
          'Interactive React applications with reusable components, routing, and integration-friendly structure for portfolios and small products.',
        offering_tags: 'React, hooks, client-side state',
        availability: 'Part-time',
      },
      {
        id: 'sv4',
        title: 'Basic Backend Development',
        description:
          'Lightweight APIs and server-side logic with Node.js (and related tooling) to support frontend features and data flow.',
        offering_tags: 'REST basics, Node.js',
        availability: 'Learning-focused / small scope',
      },
      {
        id: 'sv5',
        title: 'Database Design',
        description:
          'Schema thinking and SQL for relational data—tables, relationships, and queries that support application features.',
        offering_tags: 'SQL, normalization basics',
        availability: 'By arrangement',
      },
    ],
    projects: [
      {
        id: 'p1',
        title: 'CUI SkillSphere (University Skill Portfolio System)',
        description:
          'A full-stack web application that allows university students to create, manage, and showcase their professional portfolios with admin feedback and ranking system.',
        tech_used: 'React.js, Supabase, Tailwind CSS',
        cover_image:
          '/project-images/cui_skillsphere.PNG',
      },
      {
        id: 'p2',
        title: 'Foodify (Food Ordering Web App)',
        description: 'A responsive food ordering platform with dynamic menus and interactive UI.',
        tech_used: 'React.js, Node.js',
        cover_image: '/project-images/foodify.PNG',
        cover_position: 'left center',
      },
      {
        id: 'p3',
        title: 'Secure File Upload System',
        description: 'A cloud-based file storage system using hybrid cryptography for secure uploads.',
        tech_used: 'Flask, Python',
        cover_image:
          'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
      },
      {
        id: 'p4',
        title: 'Fragrance Store Website',
        description: 'An e-commerce style website for perfumes with modern UI and product display features.',
        tech_used: 'HTML, CSS, JavaScript',
        cover_image:
          'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=80',
      },
    ],
    certificates: [
      {
        id: 'c1',
        certificate_name: 'Web Development Fundamentals – Coursera',
        issue_date: 'Coursera',
        file_url: 'https://www.coursera.org/',
      },
      {
        id: 'c2',
        certificate_name: 'Introduction to Python – DataCamp',
        issue_date: 'DataCamp',
        file_url: 'https://www.datacamp.com/',
      },
      {
        id: 'c3',
        certificate_name: 'SQL for Beginners – Udemy',
        issue_date: 'Udemy',
        file_url: 'https://www.udemy.com/',
      },
    ],
  },
}

export default function PublicPortfolioPage() {
  const { id } = useParams()
  const [data, setData] = useState({
    user: null,
    skills: [],
    projects: [],
    services: [],
    certificates: [],
    education: [],
    experience: [],
    hideEducation: false,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (teamPortfolios[id]) {
        const t = teamPortfolios[id]
        setData({
          user: {
            name: t.name,
            department: t.department,
            semester: t.semester,
            bio: t.bio,
            professional_title: t.professional_title,
            profile_picture: t.profile_picture,
            portfolio_url: t.portfolio_url,
            github_url: t.github_url,
            linkedin_url: t.linkedin_url,
            website_url: t.website_url,
          },
          skills: t.skills ?? [],
          projects: t.projects ?? [],
          services: t.services ?? [],
          certificates: t.certificates ?? [],
          education: t.education ?? [],
          experience: t.experience ?? [],
          hideEducation: Boolean(t.hideEducation),
        })
        setLoading(false)
        return
      }
      const [user, skills, projects, services, certificates, education, experience] = await Promise.all([
        supabase.from('users').select('*').eq('id', id).single(),
        supabase.from('skills').select('*').eq('user_id', id),
        supabase.from('projects').select('*').eq('user_id', id),
        supabase.from('services').select('*').eq('user_id', id),
        supabase.from('certificates').select('*').eq('user_id', id),
        supabase.from('education').select('*').eq('user_id', id),
        supabase.from('experience').select('*').eq('user_id', id),
      ])
      setData({
        user: user.data,
        skills: skills.data ?? [],
        projects: projects.data ?? [],
        services: services.data ?? [],
        certificates: certificates.data ?? [],
        education: education.data ?? [],
        experience: experience.data ?? [],
        hideEducation: false,
      })
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return (
      <SiteBackground>
        <div className="relative z-10 min-h-screen p-4 md:p-8">
          <div className="mx-auto max-w-5xl space-y-4">
            <Skeleton className="h-36 rounded-3xl bg-white/10" />
            <Skeleton className="h-56 rounded-3xl bg-white/10" />
            <Skeleton className="h-56 rounded-3xl bg-white/10" />
          </div>
        </div>
      </SiteBackground>
    )
  }

  return (
    <SiteBackground>
      <div className="relative z-10 min-h-screen p-4 md:p-8">
        <div className="mx-auto max-w-5xl">
          <PortfolioView data={data} />
        </div>
      </div>
    </SiteBackground>
  )
}
