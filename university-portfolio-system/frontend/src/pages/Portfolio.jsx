import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { Award, FolderGit2, Code2, Mail, ExternalLink, GraduationCap, Building } from 'lucide-react';

export default function Portfolio() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await api.get(`/students/${id}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-2xl animate-pulse text-primary-500">Loading Portfolio...</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center flex-col gap-4 text-center">
    <h1 className="text-3xl font-bold text-slate-800">Portfolio Not Found</h1>
    <Link to="/login" className="btn-primary">Return Home</Link>
  </div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-8 font-sans pb-24">
      <div className="max-w-4xl mx-auto space-y-12 animate-slide-up">
        
        {/* Header Profile Section */}
        <div className="glass-dark !bg-slate-900 !text-white rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary-500/30 rounded-full mix-blend-overlay filter blur-[100px]"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center text-center md:text-left">
            <div className="w-40 h-40 rounded-full border-4 border-slate-800 shadow-2xl overflow-hidden bg-slate-800 shrink-0">
               {data.profile_picture ? (
                 <img src={data.profile_picture} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full bg-gradient-to-br from-primary-500 to-purple-600 flex justify-center items-center text-5xl font-bold">{data.name.charAt(0)}</div>
               )}
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{data.name}</h1>
              <div className="flex flex-wrap text-slate-300 gap-4 justify-center md:justify-start">
                 <span className="flex items-center gap-2"><Building className="w-4 h-4 text-primary-400"/> {data.department}</span>
                 <span className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-primary-400"/> Semester {data.semester}</span>
                 <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary-400"/> <a href={`mailto:${data.email}`} className="hover:text-white transition-colors">{data.email}</a></span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs / Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-8">
             {/* Education & Skills */}
             <div className="card shadow-lg shadow-blue-900/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Code2 className="w-6 h-6"/></div>
                  <h2 className="text-2xl font-bold text-slate-800">Technical Skills</h2>
                </div>
                {data.skills?.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {data.skills.map(skill => (
                      <div key={skill.id} className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-800">{skill.skill_name}</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-primary-700 bg-primary-100 px-3 py-1 rounded-full">{skill.skill_level}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No skills listed yet.</p>
                )}
             </div>

             {/* Certifications */}
             <div className="card shadow-lg shadow-amber-900/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Award className="w-6 h-6"/></div>
                  <h2 className="text-2xl font-bold text-slate-800">Certifications</h2>
                </div>
                {data.certificates?.length > 0 ? (
                  <div className="space-y-4">
                     {data.certificates.map(cert => (
                       <div key={cert.id} className="flex items-center gap-4 group">
                          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                            <Award className="w-5 h-5 text-amber-600"/>
                          </div>
                          <div>
                            <a href={cert.file_url} target="_blank" rel="noreferrer" className="font-bold text-lg text-slate-800 group-hover:text-primary-600 transition-colors inline-block pb-0.5">{cert.certificate_name}</a>
                            <p className="text-sm font-medium text-slate-500">Issued: {new Date(cert.issue_date).toLocaleDateString()}</p>
                          </div>
                       </div>
                     ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No certificates available.</p>
                )}
             </div>
          </div>

          <div className="space-y-8">
            {/* Projects */}
            <div className="card shadow-lg shadow-purple-900/5 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><FolderGit2 className="w-6 h-6"/></div>
                <h2 className="text-2xl font-bold text-slate-800">Featured Projects</h2>
              </div>
               {data.projects?.length > 0 ? (
                  <div className="space-y-6">
                    {data.projects.map(project => (
                      <div key={project.id} className="group border border-slate-100 rounded-2xl p-6 bg-slate-50 hover:bg-white hover:border-purple-200 transition-all shadow-sm hover:shadow-md">
                        <div className="flex justify-between items-start mb-3">
                           <h3 className="font-bold text-xl text-slate-800">{project.title}</h3>
                           {project.github_link && (
                             <a href={project.github_link} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-purple-600 p-2 rounded-full hover:bg-purple-50 transition-colors">
                               <ExternalLink className="w-5 h-5"/>
                             </a>
                           )}
                        </div>
                        <p className="text-slate-600 leading-relaxed mb-6">{project.description}</p>
                        <div className="flex flex-wrap gap-2 mt-auto">
                          {project.tech_used.split(',').map(tech => (
                            <span key={tech} className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg">{tech.trim()}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
               ) : (
                  <p className="text-slate-500 italic">No projects showcased.</p>
               )}
            </div>
          </div>

        </div>

        <div className="text-center text-slate-400 text-sm mt-12 py-8 border-t border-slate-200">
           Portfolio generated using University Portfolio System
        </div>
      </div>
    </div>
  );
}
