import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0d0d0d] text-zinc-100 font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 bg-[#0d0d0d]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
