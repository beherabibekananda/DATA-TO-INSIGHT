
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

const Index = () => {
  const { user, profile, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Add some entrance animations
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
        return <PublicStudentView onLoginClick={() => { }} user={user} />;
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* Main Content */}
      <main className={`
        transition-all duration-300 min-h-screen
        ${sidebarCollapsed ? 'ml-16' : 'ml-64'}
      `}>
        {/* Top Navigation */}
        <header className="sticky top-0 z-30 glass-card border-b border-blue-500/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">System Online</span>
              </div>
              <div className="h-4 w-px bg-gray-600"></div>
              <span className="text-gray-400 text-sm">
                Last Updated: {new Date().toLocaleTimeString()}
              </span>
              {user && (
                <>
                  <div className="h-4 w-px bg-gray-600"></div>
                  <span className="text-blue-400 text-sm">
                    Welcome, {profile?.full_name || user?.email}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {/* Only show these buttons if user is logged in */}
              {user && (
                <>
                  {/* My Requests Button */}
                  <Button
                    onClick={() => setActiveSection('requests')}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    My Requests
                  </Button>

                  {/* User Dashboard Button */}
                  <Button
                    onClick={() => setActiveSection('user-dashboard')}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    My Profile
                  </Button>

                  {/* Sign Out Button */}
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    className="bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30"
                  >
                    Sign Out
                  </Button>
                </>
              )}

              {/* Dark Mode Toggle */}
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200">
                <div className="w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
              </button>

              {/* Notifications - only show if logged in */}
              {user && (
                <div className="relative">
                  <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200">
                    <div className="w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                  </button>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {renderActiveSection()}
          </div>
        </div>
      </main>

      {/* Loading Overlay for Initial Load */}
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center animate-fade-out pointer-events-none" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            EduAnalytics
          </h2>
          <p className="text-gray-400 text-sm">Initializing AI Systems...</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
