import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Send,
  Zap,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Inbox', href: '/inbox', icon: MessageSquare },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Campaigns', href: '/campaigns', icon: Send },
  { name: 'Automation', href: '/automation', icon: Zap },
  { name: 'Appointments', href: '/appointments', icon: Calendar },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, tenant, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-20 lg:hidden transition-opacity ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={`fixed top-0 left-0 z-30 w-72 h-full glass-card border-r border-gray-800 transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-xl shadow-glow">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  WhatsApp Hub
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <p className="text-sm font-semibold text-white truncate mb-1">
                {tenant?.name}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-cyan-400 shadow-glow'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : ''}`} />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-cyan-400" />}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-800">
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-3 w-full px-4 py-3 text-gray-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/50 rounded-xl transition-all border border-transparent"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:ml-72">
        <header className="glass-card border-b border-gray-800 sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1" />
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};
