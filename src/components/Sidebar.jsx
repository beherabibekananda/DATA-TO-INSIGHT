
import React, { useState } from 'react';
import {
  BarChart,
  Users,
  User,
  AlertTriangle,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Database,
  Brain,
  LayoutDashboard,
  Cpu,
  Target,
  Shield,
  Zap,
  Fingerprint
} from 'lucide-react';

const Sidebar = ({ activeSection, setActiveSection }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'risk-analysis', label: 'Risk Patterns', icon: AlertTriangle },
    { id: 'dropout-prediction', label: 'Drift Checker', icon: Zap },
    { id: 'uci-analytics', label: 'Neural Insights', icon: Brain },
    { id: 'students', label: 'Entity Hub', icon: Users },
    { id: 'profile', label: 'Node Detail', icon: Fingerprint },
    { id: 'departments', label: 'Sectors', icon: BookOpen },
    { id: 'settings', label: 'Protocols', icon: Settings },
  ];

  return (
    <div className={`
      fixed left-0 top-0 h-full bg-[#0c0d12]/40 backdrop-blur-3xl border-r border-white/5 transition-all duration-500 ease-in-out z-50
      ${isCollapsed ? 'w-20' : 'w-64'}
    `}>
      {/* Dynamic Accent Line */}
      <div className="absolute top-0 right-0 w-[2px] h-full bg-gradient-to-b from-primary/0 via-primary/20 to-primary/0"></div>

      {/* Persistence Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-10 bg-gradient-to-br from-primary to-secondary text-white w-7 h-7 rounded-lg shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all duration-300 z-[60] flex items-center justify-center hover:scale-110 active:scale-90 border border-white/20"
      >
        {isCollapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronLeft size={14} strokeWidth={3} />}
      </button>

      {/* Intelligence Brand */}
      <div className={`p-8 mb-6 ${!isCollapsed ? 'border-b border-white/5' : 'flex justify-center'}`}>
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl relative group shrink-0">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Cpu className="text-primary relative z-10" size={24} />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden animate-in slide-in-from-left-4 duration-500">
              <h1 className="text-sm font-black tracking-[0.3em] text-white uppercase leading-none">EduIntelligence</h1>
              <p className="text-[8px] uppercase font-black tracking-[0.4em] text-primary mt-1.5 opacity-60">Insight Neural</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigational Logic */}
      <nav className="px-5 py-4 flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`
                    w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl
                    transition-all duration-[400ms] group relative overflow-hidden
                    ${isActive
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_30px_rgba(139,92,246,0.05)]'
                      : 'text-white/30 hover:bg-white/[0.02] hover:text-white'
                    }
                  `}
                >
                  <Icon
                    size={20}
                    className={`
                      transition-all duration-500 group-hover:scale-110
                      ${isActive ? 'text-primary drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]' : 'text-inherit'}
                    `}
                  />
                  {!isCollapsed && (
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full mr-2 shadow-[0_0_10px_rgba(139,92,246,0.8)] animate-pulse"></div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Identity Summary */}
      <div className={`p-6 mt-auto border-t border-white/5 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center group-hover:border-primary/40 transition-all duration-500 relative shrink-0">
            <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Shield size={20} className="text-white/20 group-hover:text-primary transition-colors relative z-10" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1 group-hover:text-primary transition-colors">Admin_BBehera</p>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></div>
                <p className="text-[8px] text-white/20 font-black uppercase tracking-[0.2em]">Authorized Access</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
