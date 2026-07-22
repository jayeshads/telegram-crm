import React from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { Search, Bell, Sun, Moon, LogOut, Sparkles, ChevronDown } from 'lucide-react';

export const TopBar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();

  return (
    <header className="h-14 border-b border-[#262626] bg-[#171717] px-6 flex items-center justify-between sticky top-0 z-20 font-sans text-[#e5e5e5]">
      {/* Model Selector & Search */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#262626] border border-[#333333] text-xs font-semibold text-[#e5e5e5]">
          <span>Neo Orchestrator (GPT-5.2)</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#737373]" />
        </div>

        <button
          onClick={() => {}}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#262626] hover:bg-[#333333] border border-[#333333] text-xs text-[#a3a3a3] hover:text-white transition-colors w-56"
        >
          <Search className="w-3.5 h-3.5 text-[#737373]" />
          <span>Search command...</span>
          <kbd className="ml-auto text-[10px] bg-[#333333] px-1.5 py-0.5 rounded text-[#a3a3a3] font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Meta Status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#262626] border border-[#333333] text-xs font-medium text-[#a3a3a3]">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Meta Ads API Active</span>
        </div>

        {/* Upgrade Plan CTA */}
        <a
          href="/dashboard/billing"
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#262626] hover:bg-[#333333] text-white border border-[#404040] text-xs font-semibold transition-all"
        >
          <Sparkles className="w-3 h-3 text-white" />
          <span>Upgrade</span>
        </a>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg bg-[#262626] hover:bg-[#333333] text-[#a3a3a3] hover:text-white transition-colors border border-[#333333]"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <button className="p-1.5 rounded-lg bg-[#262626] hover:bg-[#333333] text-[#a3a3a3] hover:text-white transition-colors border border-[#333333] relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#e5e5e5]" />
        </button>

        {/* Profile / Logout */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-[#262626]">
          <div className="w-7 h-7 rounded-full bg-[#404040] flex items-center justify-center text-white font-bold text-xs">
            {user?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="text-xs font-semibold text-[#e5e5e5] truncate max-w-[100px]">
              {user?.full_name || 'User'}
            </span>
          </div>
          <button
            onClick={logout}
            className="p-1 text-[#737373] hover:text-rose-400 transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
