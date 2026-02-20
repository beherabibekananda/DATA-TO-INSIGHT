
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
  Brain
} from 'lucide-react';

const Sidebar = ({ activeSection, setActiveSection }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart },
    { id: 'risk-analysis', label: 'Risk Analysis', icon: AlertTriangle },
    { id: 'dropout-prediction', label: 'Dropout Checker', icon: Brain },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'profile', label: 'Profile View', icon: User },
    { id: 'departments', label: 'Departments', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className={`
      fixed left-0 top-0 h-full glass-card transition-all duration-300 z-40
      ${isCollapsed ? 'w-16' : 'w-64'}
    `}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-full neon-glow transition-all duration-200"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Logo */}
      <div className="p-4 border-b border-blue-500/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <BookOpen className="text-white" size={20} />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold neon-text">EduAnalytics</h1>
              <p className="text-xs text-blue-400">Dropout Prediction</p>
            </div>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-3 rounded-lg
                    transition-all duration-200 group
                    ${isActive
                      ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 neon-glow'
                      : 'hover:bg-blue-500/10 hover:border-blue-500/20 border border-transparent'
                    }
                  `}
                >
                  <Icon
                    size={20}
                    className={`
                      transition-all duration-200
                      ${isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-300'}
                    `}
                  />
                  {!isCollapsed && (
                    <span className={`
                      transition-all duration-200
                      ${isActive ? 'text-blue-300 font-medium' : 'text-gray-300 group-hover:text-blue-200'}
                    `}>
                      {item.label}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      {!isCollapsed && (
        <div className="p-4 border-t border-blue-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Bibekananda Behera</p>
              <p className="text-xs text-gray-400">Academic Advisor</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
