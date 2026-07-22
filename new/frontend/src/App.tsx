import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import { apiRequest } from '@/lib/api';

import { Login } from '@/pages/auth/Login';
import { Signup } from '@/pages/auth/Signup';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

import { Overview } from '@/pages/dashboard/Overview';
import { AiChat } from '@/pages/dashboard/AiChat';
import { Campaigns } from '@/pages/dashboard/Campaigns';
import { Creatives } from '@/pages/dashboard/Creatives';
import { LandingPages } from '@/pages/dashboard/LandingPages';
import { MetaAccount } from '@/pages/dashboard/MetaAccount';
import { Billing } from '@/pages/dashboard/Billing';
import { Settings } from '@/pages/dashboard/Settings';
import { Research } from '@/pages/dashboard/Research';

import { AdminOverview } from '@/pages/admin/Overview';
import { AdminUsers } from '@/pages/admin/Users';
import { AdminSkills } from '@/pages/admin/Skills';
import { AdminSupportTickets } from '@/pages/admin/SupportTickets';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const App: React.FC = () => {
  const { setUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('lp_access_token');
    if (token) {
      apiRequest('/auth/me')
        .then((userData: any) => setUser(userData))
        .catch(() => {
          localStorage.removeItem('lp_access_token');
          localStorage.removeItem('lp_refresh_token');
          setUser(null);
        });
    } else {
      setUser(null);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Client Dashboard Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Overview />} />
              <Route path="/dashboard/chat" element={<AiChat />} />
              <Route path="/dashboard/campaigns" element={<Campaigns />} />
              <Route path="/dashboard/creatives" element={<Creatives />} />
              <Route path="/dashboard/landing-pages" element={<LandingPages />} />
              <Route path="/dashboard/meta" element={<MetaAccount />} />
              <Route path="/dashboard/research" element={<Research />} />
              <Route path="/dashboard/billing" element={<Billing />} />
              <Route path="/dashboard/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute adminOnly />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin" element={<AdminOverview />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/skills" element={<AdminSkills />} />
              <Route path="/admin/support-tickets" element={<AdminSupportTickets />} />
            </Route>
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
