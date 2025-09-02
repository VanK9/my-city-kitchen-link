import React from 'react';
import CustomizableDashboard from './dashboard/CustomizableDashboard';

const DashboardLayout = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <CustomizableDashboard />
    </div>
  );
};

export default DashboardLayout;