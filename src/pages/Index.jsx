
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import RiskAnalysis from '../components/RiskAnalysis';
import StudentProfile from '../components/StudentProfile';
import DepartmentAnalytics from '../components/DepartmentAnalytics';
import InterventionPanel from '../components/InterventionPanel';
import UserDashboard from '../components/UserDashboard';
import UserRequestsView from '../components/UserRequestsView';
import DropoutPrediction from '../components/DropoutPrediction';
import UCIDataAnalytics from '../components/UCIDataAnalytics';
import { Button } from "@/components/ui/button";
import { Brain, Bell, Clock, Cpu, LogOut, ChevronRight, LayoutDashboard, User } from 'lucide-react';

const Index = () => {
  const { user, profile, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      document.body.style.overflow = 'auto';
    }, 1000);
  }, []);

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'risk-analysis':
        return <RiskAnalysis />;
      case 'dropout-prediction':
        return <DropoutPrediction />;
      case 'students':
        return <Dashboard />; // Fallback or dedicated view
      case 'profile':
        return <StudentProfile />;
      case 'user-dashboard':
        return <UserDashboard />;
      case 'departments':
        return <DepartmentAnalytics />;
      case 'settings':
        return <InterventionPanel />;
      case 'requests':
        return <UserRequestsView />;
      case 'uci-analytics':
        return <UCIDataAnalytics />;
      default:
        return <Dashboard />;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#02040a] relative overflow-hidden font-sans selection:bg-primary/30 selection:text-white">
      {/* Dynamic Environmental Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-30"
          style={{ background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 70%)' }}></div>
      </div>

      {/* Sidebar Navigation */}
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* Primary Workspace */}
      <main className={`
        transition-all duration-500 ease-in-out min-h-screen relative z-10
        ${sidebarCollapsed ? 'ml-20' : 'ml-64'}
      `}>
        {/* Intelligence Header */}
        <header className="sticky top-0 z-40 bg-card/10 backdrop-blur-2xl border-b border-white/10 px-10 py-6">
          <div className="flex items-center justify-between mx-auto max-w-7xl">
            <div className="flex items-center gap-8">
              <div className="hidden lg:flex items-center gap-4 bg-white/[0.03] px-4 py-2 rounded-2xl border border-white/5 shadow-xl">
                <div className="flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-primary animate-spin-slow" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">System Status: </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-success rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                  <span className="text-success text-[10px] font-black uppercase tracking-widest">Active</span>
                </div>
              </div>

              <div className="h-4 w-px bg-white/10 hidden md:block"></div>

              <div className="flex items-center gap-3 text-white/30">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {user && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveSection('requests')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSection === 'requests' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-white/40 hover:text-white hover:bg-white/[0.05]'}`}
                  >
                    Requests
                  </button>
                  <button
                    onClick={() => setActiveSection('user-dashboard')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSection === 'user-dashboard' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-white/40 hover:text-white hover:bg-white/[0.05]'}`}
                  >
                    My Profile
                  </button>
                </div>
              )}

              <div className="h-6 w-px bg-white/10"></div>

              <div className="flex items-center gap-4">
                <button className="relative w-11 h-11 flex items-center justify-center bg-white/[0.03] rounded-2xl border border-white/10 hover:bg-white/[0.08] transition-all group">
                  <Bell className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[9px] font-black flex items-center justify-center rounded-lg border-2 border-[#02040a] shadow-lg shadow-primary/20">
                    03
                  </span>
                </button>

                <Button
                  onClick={handleSignOut}
                  className="bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 rounded-2xl h-11 px-5 font-black uppercase tracking-[0.15em] text-[10px] transition-all flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content Surface */}
        <section className="p-10 relative z-10 min-h-[calc(100vh-100px)]">
          <div className="max-w-7xl mx-auto space-y-10">
            {renderActiveSection()}
          </div>
        </section>

        {/* Workspace Footer Indicator */}
        <footer className="px-10 py-8 border-t border-white/5 opacity-40">
          <div className="max-w-7xl mx-auto flex justify-between items-center text-[9px] font-black uppercase tracking-[0.4em]">
            <span>Data To Insight Project</span>
            <div className="flex gap-6 text-white/40">
              <span>Secure SSL</span>
              <span>v4.0.1</span>
            </div>
          </div>
        </footer>
      </main>

      {/* Initial Loading Overlay */}
      <div className="fixed inset-0 bg-[#02040a] z-[100] flex items-center justify-center transition-all duration-1000 pointer-events-none opacity-0 animate-init-overlay">
        <div className="text-center relative">
          <div className="absolute inset-x-0 -top-20 flex justify-center">
            <div className="w-32 h-32 bg-primary/30 blur-[60px] animate-pulse rounded-full"></div>
          </div>
          <div className="relative z-10 group">
            <div className="w-24 h-24 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-8 mx-auto p-4 transition-all group-hover:scale-110">
              <Brain className="w-full h-full text-white animate-pulse" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-[0.5em] uppercase mb-4 opacity-0 animate-fade-in-up">
              Data To Insight
            </h2>
            <div className="h-1 w-48 bg-white/10 mx-auto rounded-full overflow-hidden mb-4">
              <div className="h-full bg-primary w-0 animate-progress"></div>
            </div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Loading Dashboard...</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes progress {
          to { width: 100%; }
        }
        @keyframes init-overlay {
          0% { opacity: 1; transform: scale(1); }
          80% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.1); pointer-events: none; }
        }
        .animate-init-overlay {
          animation: init-overlay 1.5s ease-in-out forwards;
        }
        .animate-progress {
          animation: progress 1.2s cubic-bezier(0.65, 0, 0.35, 1) forwards;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards 0.2s;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Index;
