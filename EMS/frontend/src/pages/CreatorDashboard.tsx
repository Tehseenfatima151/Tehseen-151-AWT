import { Download, PlusCircle, Building2, Users, Timer, ChevronRight, CheckCircle2, LayoutGrid, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function CreatorDashboard() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-display-lg text-3xl md:text-4xl text-foreground font-bold">Dashboard Overview</h2>
          <p className="font-body-lg text-muted-foreground mt-2 max-w-2xl">Monitor your active democratic processes with real-time integrity verification and participant analytics.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-card border border-border text-foreground font-label-sm text-sm font-semibold px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-muted transition-colors">
            <Download size={18} />
            Export Reports
          </button>
          <button className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-label-sm text-sm font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-xl shadow-primary/10 hover:-translate-y-0.5 transition-transform">
            <PlusCircle size={18} />
            New Election
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Main Analytics: Total Participation */}
        <div className="md:col-span-8 glass-card rounded-2xl p-6 md:p-8 border border-border">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-foreground">Total Participation Analytics</h3>
              <p className="font-label-sm text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-1">Activity over the last 30 days</p>
            </div>
            <div className="flex bg-card border border-border p-1 rounded-lg">
              <button className="px-4 py-1 text-sm font-bold bg-muted rounded shadow-sm text-primary">Hourly</button>
              <button className="px-4 py-1 text-sm font-medium text-muted-foreground hover:text-foreground">Daily</button>
            </div>
          </div>
          
          {/* Simplified Bar Chart Representation */}
          <div className="h-64 flex items-end gap-2 md:gap-4 px-2">
            {[40, 65, 45, 85, 95, 70, 60, 50, 80, 100, 90, 75].map((height, i) => (
              <div 
                key={i} 
                className="flex-1 bg-gradient-to-t from-primary to-secondary rounded-t-lg transition-all hover:opacity-80" 
                style={{ height: `${height}%` }}
                title={`Day ${i + 1}`}
              ></div>
            ))}
          </div>
          <div className="flex justify-between mt-4 px-2 text-muted-foreground text-sm font-semibold">
            <span>Nov 01</span>
            <span>Nov 15</span>
            <span>Today</span>
          </div>
        </div>

        {/* Integrity Meter Widget */}
        <div className="md:col-span-4 glass-card rounded-2xl p-6 md:p-8 flex flex-col justify-between border border-border">
          <div>
            <h3 className="text-xl font-bold text-foreground">Security Integrity</h3>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-1">Real-time status</p>
          </div>
          <div className="relative flex items-center justify-center py-10">
            <svg className="w-48 h-48 transform -rotate-90">
              <circle className="text-muted" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeWidth="12"></circle>
              <circle cx="96" cy="96" fill="transparent" r="88" stroke="url(#paint0_linear)" strokeDasharray="552.92" strokeDashoffset="55.29" strokeLinecap="round" strokeWidth="12"></circle>
              <defs>
                <linearGradient id="paint0_linear" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))"></stop>
                  <stop offset="100%" stopColor="hsl(var(--secondary))"></stop>
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-primary">99.9%</span>
              <span className="text-xs font-bold text-muted-foreground uppercase">Verifiable</span>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 className="text-primary" size={24} />
            <div>
              <p className="text-sm font-bold text-foreground">Blockchain Anchored</p>
              <p className="text-xs text-muted-foreground font-medium">Last proof: 4s ago</p>
            </div>
          </div>
        </div>

        {/* Candidate Performance Table/List */}
        <div className="md:col-span-5 glass-card rounded-2xl p-6 md:p-8 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-foreground">Candidate Performance</h3>
            <Link to="#" className="text-primary text-sm font-bold hover:underline">View All</Link>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20">
                  <img alt="Candidate A" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEO45G9izbxUi3q0s1-kwLGtrjSgXu8CRuafvXAJMcKXrEZbCEOyVBw7Mx2-CWIkRpjz1skKunmJIDpA-yQV0nrIQsnSWVB95XYWTJx7Kk1cCdjvtCoE4ofxLxyXUaefkppakNjX4l0KDdskuL1jTI7Z0zPkLb65q6xccL5FXjz0AHpUwY2-JJ4LBa0nSAZjv-sXFwqpIFy_2iXJdYJkJyF0RYirGQ16TOx0VQ6v61opbO8dwi6CUgMHg7dsK-JUOeMWzBcp6qvlc"/>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Sarah J. Miller</p>
                  <p className="text-xs font-semibold text-muted-foreground">Innovations Lead</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-primary">42.8%</p>
                <p className="text-xs font-medium text-muted-foreground">12,402 votes</p>
              </div>
            </div>
            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-secondary h-full rounded-full" style={{ width: '42.8%' }}></div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-border">
                  <img alt="Candidate B" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZy73Cyi5sDdX3LX2dsTjDzE0OxSv4105KvP2jIYxed5uECPDVKiKLootVIobz1h5Rbto60qkdBvwR7YB3QA8NabUJsddvQT60yo-qwfDfHzGLYhheybuPzCja3w323ySRV2zd4Ukv3QcmqCXSoXCXCbLfmEXB4n9rak7VFJV0JiMKKLF8tUTgxebep14gyQyvwOYxjiTxugfeLdrp7-cHBAIYsDZU18VzPrsxBultktw7E4kM0dX2ed0Bh7e_enU_Uqfvu4Z83Tk"/>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Marcus Chen</p>
                  <p className="text-xs font-semibold text-muted-foreground">Security Director</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-secondary">31.2%</p>
                <p className="text-xs font-medium text-muted-foreground">9,048 votes</p>
              </div>
            </div>
            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
              <div className="bg-secondary h-full rounded-full" style={{ width: '31.2%' }}></div>
            </div>
          </div>
        </div>

        {/* Active Elections Grid */}
        <div className="md:col-span-7 glass-card rounded-2xl p-6 md:p-8 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-foreground">My Active Elections</h3>
            <div className="flex gap-2">
              <LayoutGrid className="text-muted-foreground hover:text-primary cursor-pointer transition-colors" size={20} />
              <List className="text-primary cursor-pointer" size={20} />
            </div>
          </div>
          
          <div className="space-y-4">
            {[
              { title: 'Annual Board of Directors', type: 'Internal Governance Election', status: 'Active', voters: '2.4k', time: '2d 14h left', icon: Building2, color: 'primary' },
              { title: 'Policy Amendment 2024-B', type: 'Global Stakeholder Referendum', status: 'Active', voters: '48.1k', time: '12h 04m left', icon: Building2, color: 'secondary' },
              { title: 'Community Grant Allocation', type: 'Quarterly Budgeting Vote', status: 'Queued', voters: '5.2k', time: 'Starts in 3d', icon: CheckCircle2, color: 'muted' },
            ].map((election, i) => (
              <div key={i} className="group border border-border rounded-xl p-5 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer bg-card/50">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                      ${election.color === 'primary' ? 'bg-primary/10 text-primary' : 
                        election.color === 'secondary' ? 'bg-secondary/10 text-secondary' : 'bg-muted text-muted-foreground'}
                    `}>
                      <election.icon size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{election.title}</h4>
                      <p className="text-xs font-semibold text-muted-foreground">{election.type}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider
                    ${election.status === 'Active' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}
                  `}>
                    {election.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-foreground"><Users size={16} /> {election.voters} Voters</span>
                    <span className="flex items-center gap-1 text-muted-foreground"><Timer size={16} /> {election.time}</span>
                  </div>
                  <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity text-primary" size={20} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
