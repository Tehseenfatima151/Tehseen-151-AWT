import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Plus, Trash2, Code2, FolderGit2, Award, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [certFile, setCertFile] = useState(null);
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sRes, pRes, cRes] = await Promise.all([
        api.get('/skills'),
        api.get('/projects'),
        api.get('/certificates')
      ]);
      setSkills(sRes.data);
      setProjects(pRes.data);
      setCertificates(cRes.data);
    } catch (err) {
      toast.error('Failed to load portfolio data');
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/skills', { skill_name: e.target.name.value, skill_level: e.target.level.value });
      setSkills([...skills, res.data]);
      e.target.reset();
      toast.success('Skill added');
    } catch (err) { toast.error('Failed to add skill'); }
  };

  const handleDeleteSkill = async (id) => {
    try {
      await api.delete(`/skills/${id}`);
      setSkills(skills.filter(s => s.id !== id));
      toast.success('Skill deleted');
    } catch (err) { toast.error('Failed to delete'); }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: e.target.title.value,
        description: e.target.description.value,
        tech_used: e.target.tech.value,
        github_link: e.target.github.value
      };
      const res = await api.post('/projects', payload);
      setProjects([...projects, res.data]);
      e.target.reset();
      toast.success('Project added');
    } catch (err) { toast.error('Failed to add project'); }
  };

  const handleDeleteProject = async (id) => {
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter(p => p.id !== id));
      toast.success('Project deleted');
    } catch (err) { toast.error('Failed to delete'); }
  };

  const handleAddCertificate = async (e) => {
    e.preventDefault();
    if (!certFile) return toast.error('Please select a certificate file');
    const formData = new FormData();
    formData.append('certificate_name', e.target.name.value);
    formData.append('issue_date', e.target.date.value);
    formData.append('file', certFile);

    try {
      const toastId = toast.loading('Uploading certificate...');
      const res = await api.post('/certificates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCertificates([...certificates, res.data]);
      e.target.reset();
      setCertFile(null);
      toast.success('Certificate added', { id: toastId });
    } catch (err) { toast.error('Failed to add certificate'); }
  };

  const handleDeleteCertificate = async (id) => {
    try {
      await api.delete(`/certificates/${id}`);
      setCertificates(certificates.filter(c => c.id !== id));
      toast.success('Certificate deleted');
    } catch (err) { toast.error('Failed to delete'); }
  };

  return (
    <div className="py-8 animate-fade-in space-y-12 pb-24">
      <div className="flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">Overview</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage your professional portfolio</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Skills Section */}
        <div className="card space-y-4 lg:col-span-1 shadow-lg shadow-blue-900/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 rounded-xl shadow-inner"><Code2 className="w-5 h-5"/></div>
            <h2 className="text-xl font-bold text-slate-800">Skills</h2>
          </div>
          
          <form onSubmit={handleAddSkill} className="flex gap-2 mb-4">
            <input name="name" placeholder="E.g. React" className="input-field py-2 text-sm flex-1" required/>
            <select name="level" className="input-field py-2 text-sm w-28 bg-white" required>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Expert</option>
            </select>
            <button className="btn-primary py-2 px-3 !rounded-xl"><Plus className="w-4 h-4" /></button>
          </form>
          
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {skills.map(skill => (
              <div key={skill.id} className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-blue-200 transition-colors group">
                <div>
                  <p className="font-semibold text-slate-800">{skill.skill_name}</p>
                  <p className="text-xs font-medium text-slate-500">{skill.skill_level}</p>
                </div>
                <button onClick={() => handleDeleteSkill(skill.id)} className="text-slate-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4"/></button>
              </div>
            ))}
            {skills.length === 0 && <p className="text-sm text-slate-400 italic">No skills added yet.</p>}
          </div>
        </div>

        {/* Projects & Certs Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Projects Section */}
          <div className="card space-y-4 shadow-lg shadow-purple-900/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-50 text-purple-600 rounded-xl shadow-inner"><FolderGit2 className="w-5 h-5"/></div>
              <h2 className="text-xl font-bold text-slate-800">Projects</h2>
            </div>
            
            <form onSubmit={handleAddProject} className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
              <input name="title" placeholder="Project Title" className="input-field py-2.5 text-sm bg-white" required/>
              <input name="tech" placeholder="Tech Used (comma separated)" className="input-field py-2.5 text-sm bg-white" required/>
              <input name="github" placeholder="GitHub URL" className="input-field py-2.5 text-sm col-span-1 sm:col-span-2 bg-white"/>
              <textarea name="description" placeholder="Project Description" className="input-field py-2 text-sm col-span-1 sm:col-span-2 resize-none bg-white" rows="2" required></textarea>
              <div className="col-span-1 sm:col-span-2 flex justify-end">
                <button type="submit" className="btn-primary py-2 px-6">Add Project</button>
              </div>
            </form>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map(project => (
                <div key={project.id} className="flex flex-col p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative group">
                  <button onClick={() => handleDeleteProject(project.id)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4"/></button>
                  <h3 className="font-bold text-lg text-slate-800 pr-8">{project.title}</h3>
                  <p className="text-sm text-slate-500 mt-2 mb-4 line-clamp-2 flex-grow">{project.description}</p>
                  <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    {project.tech_used.split(',').map(t => <span key={t} className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg">{t.trim()}</span>)}
                  </div>
                </div>
              ))}
              {projects.length === 0 && <p className="text-sm text-slate-400 italic">No projects added yet.</p>}
            </div>
          </div>

          {/* Certificates Section */}
          <div className="card space-y-4 shadow-lg shadow-amber-900/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600 rounded-xl shadow-inner"><Award className="w-5 h-5"/></div>
              <h2 className="text-xl font-bold text-slate-800">Certificates</h2>
            </div>

            <form onSubmit={handleAddCertificate} className="flex flex-col sm:flex-row gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 items-end">
              <div className="flex-1 w-full space-y-3">
                <input name="name" placeholder="Certificate Name" className="input-field py-2.5 text-sm bg-white" required/>
                <div className="flex gap-3">
                  <input name="date" type="date" className="input-field py-2.5 text-sm bg-white flex-1" required/>
                  <div className="relative flex-1">
                    <input type="file" required onChange={e => setCertFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,.pdf" />
                    <div className="input-field py-2.5 text-sm bg-white flex items-center justify-center gap-2 border-dashed border-2 border-slate-300 hover:border-primary-500 transition-colors">
                       <Upload className="w-4 h-4 text-slate-500" />
                       <span className="text-slate-500 font-medium truncate">{certFile ? certFile.name : 'Upload File'}</span>
                    </div>
                  </div>
                </div>
              </div>
              <button className="btn-primary py-2.5 px-6 shrink-0 w-full sm:w-auto h-fit">Add</button>
            </form>

            <div className="space-y-3 mt-6">
              {certificates.map(cert => (
                <div key={cert.id} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-amber-200 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600"><Award className="w-6 h-6"/></div>
                    <div>
                      <a href={cert.file_url} target="_blank" rel="noreferrer" className="font-bold text-slate-800 hover:text-amber-600 hover:underline">{cert.certificate_name}</a>
                      <p className="text-xs font-medium text-slate-500 mt-1">Issued: {new Date(cert.issue_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteCertificate(cert.id)} className="text-slate-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-5 h-5"/></button>
                </div>
              ))}
              {certificates.length === 0 && <p className="text-sm text-slate-400 italic">No certificates yet.</p>}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
