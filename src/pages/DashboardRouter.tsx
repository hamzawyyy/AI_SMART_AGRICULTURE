import React from 'react';
import { useApp } from '../context/AppContext';
import { Dashboard } from './Dashboard';
import FarmerDashboard from './FarmerDashboard';
import TraderDashboard from './TraderDashboard';
import ExporterDashboard from './ExporterDashboard';
import AdminDashboard from './admin/AdminDashboard';

const DashboardRouter: React.FC = () => {
  const { user } = useApp();
  const role = user?.role;

  if (role === 'admin')    return <AdminDashboard />;
  if (role === 'farmer')   return <FarmerDashboard />;
  if (role === 'trader')   return <TraderDashboard />;
  if (role === 'exporter') return <ExporterDashboard />;

  // Fallback while user loads or unknown role
  return <ExporterDashboard />;
};

export default DashboardRouter;
