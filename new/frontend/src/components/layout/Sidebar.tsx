import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PanelLeftClose,
  PanelLeft,
  SquarePen,
  Home,
  Search,
  Sparkles,
  MoreHorizontal,
  Settings,
  LayoutDashboard,
  Bot,
  Megaphone,
  Image,
  Globe,
  Share2,
  ShieldCheck,
  Users as UsersIcon,
  BookOpen,
  Ticket,
} from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';

export const Sidebar: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeChatId, setActiveChatId] = useState<string>('chat-1');

  // Keyboard shortcut Ctrl+B / Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  // 1. PLATFORM FEATURES (UPAR RAKHE HAIN)
  const platformFeatures = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'AI Chat', path: '/dashboard/chat', icon: Bot },
    { label: 'Campaigns', path: '/dashboard/campaigns', icon: Megaphone },
    { label: 'Creative Library', path: '/dashboard/creatives', icon: Image },
    { label: 'Landing Pages', path: '/dashboard/landing-pages', icon: Globe },
    { label: 'Meta Connection', path: '/dashboard/meta', icon: Share2 },
    { label: 'Ad Research', path: '/dashboard/research', icon: Search },
  ];

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const adminNavLinks = [
    { label: 'Overview', path: '/admin', icon: ShieldCheck },
    { label: 'User Management', path: '/admin/users', icon: UsersIcon },
    { label: 'AI Knowledge', path: '/admin/skills', icon: BookOpen },
    { label: 'Support Tickets', path: '/admin/support-tickets', icon: Ticket },
  ];

  // Chat History Sections
  const historySections = [
    {
      label: 'Today',
      chats: [
        { id: 'chat-1', title: 'Handmade Candles Lead Gen Q3' },
        { id: 'chat-2', title: 'Lookalike Audience Setup' },
      ],
    },
    {
      label: 'Yesterday',
      chats: [
        { id: 'chat-3', title: 'Creative Image Ad Variants' },
        { id: 'chat-4', title: 'ROAS Optimization & CPL' },
      ],
    },
    {
      label: 'Previous 30 Days',
      chats: [
        { id: 'chat-5', title: 'E-commerce Landing Page Auto' },
      ],
    },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 260 : 72 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative flex flex-col h-screen bg-[#171717] border-r border-[#262626] z-30 select-none shrink-0 text-[#e5e5e5] font-sans"
    >
      {/* Sidebar Top Header */}
      <div className="flex items-center justify-between h-14 px-3 border-b border-[#262626]">
        <button
          onClick={toggleSidebar}
          title="Toggle Sidebar (Ctrl+B)"
          className="p-1.5 rounded-lg text-[#a3a3a3] hover:text-white hover:bg-[#262626] transition-colors"
        >
          {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
        </button>

        {sidebarOpen && (
          <button
            onClick={() => navigate('/dashboard/chat')}
            title="New Chat (Ctrl+N)"
            className="p-1.5 rounded-lg text-[#a3a3a3] hover:text-white hover:bg-[#262626] transition-colors flex items-center gap-1 text-xs"
          >
            <SquarePen className="w-4.5 h-4.5" />
          </button>
        )}
      </div>

      {/* Main Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {/* SECTION 1: PLATFORM FEATURES (UPAR) */}
        <div className="space-y-1">
          {sidebarOpen && (
            <p className="px-3 text-[10px] font-bold text-[#737373] uppercase tracking-wider mb-1">
              Platform Features
            </p>
          )}
          {platformFeatures.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all',
                    isActive
                      ? 'bg-[#262626] text-white font-semibold'
                      : 'text-[#a3a3a3] hover:text-white hover:bg-[#262626]/50'
                  )
                }
              >
                <Icon className="w-4 h-4 shrink-0 text-[#a3a3a3]" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </div>

        {/* Super Admin Links */}
        {isAdmin && (
          <div className="pt-2 border-t border-[#262626] space-y-1">
            {sidebarOpen && (
              <p className="px-3 text-[10px] font-bold text-[#737373] uppercase tracking-wider mb-1">
                Admin Control
              </p>
            )}
            {adminNavLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all',
                      isActive
                        ? 'bg-[#262626] text-white font-semibold'
                        : 'text-[#a3a3a3] hover:text-white hover:bg-[#262626]/50'
                    )
                  }
                >
                  <Icon className="w-4 h-4 shrink-0 text-[#a3a3a3]" />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        )}

        {/* SECTION 2: CHAT HISTORY (NICHE) */}
        {sidebarOpen && (
          <div className="pt-2 border-t border-[#262626] space-y-3">
            <p className="px-3 text-[10px] font-bold text-[#737373] uppercase tracking-wider">
              Chat History
            </p>
            {historySections.map((sec, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <p className="px-3 text-[10px] text-[#737373] font-semibold">{sec.label}</p>
                {sec.chats.map((c) => {
                  const isSelected = activeChatId === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        setActiveChatId(c.id);
                        navigate('/dashboard/chat');
                      }}
                      className={cn(
                        'group flex items-center justify-between px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all',
                        isSelected ? 'bg-[#262626] text-white font-semibold' : 'text-[#a3a3a3] hover:text-white hover:bg-[#262626]/40'
                      )}
                    >
                      <span className="truncate pr-2">{c.title}</span>
                      <button className="opacity-0 group-hover:opacity-100 p-1 hover:text-white transition-opacity">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Section */}
      <div className="p-2 border-t border-[#262626] space-y-2">
        {/* Upgrade Plan Pill */}
        {sidebarOpen ? (
          <button
            onClick={() => navigate('/dashboard/billing')}
            className="w-full py-2 px-3 rounded-lg bg-[#262626] hover:bg-[#333333] border border-[#404040] text-white text-xs font-semibold flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Upgrade Plan</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#404040] text-[#e5e5e5] font-mono">PRO</span>
          </button>
        ) : (
          <button
            onClick={() => navigate('/dashboard/billing')}
            title="Upgrade Plan"
            className="w-full flex justify-center py-2 text-[#a3a3a3] hover:text-white"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        )}

        {/* User Profile Bar */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#1e1e1e] border border-[#262626]">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-6 h-6 rounded-full bg-[#404040] text-white font-bold text-xs flex items-center justify-center shrink-0">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            {sidebarOpen && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate">{user?.full_name || 'User'}</span>
                <span className="text-[10px] text-[#737373] truncate">{user?.email || 'user@leadpilot.com'}</span>
              </div>
            )}
          </div>

          {sidebarOpen && (
            <button
              onClick={() => navigate('/dashboard/settings')}
              title="Settings"
              className="p-1 text-[#a3a3a3] hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
};
