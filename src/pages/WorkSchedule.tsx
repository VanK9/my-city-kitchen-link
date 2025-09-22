import React from 'react';
import WorkSchedule from '@/components/features/WorkSchedule';
import Navigation from '@/components/Navigation';

const WorkSchedulePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navigation currentSection="work-schedule" onSectionChange={() => {}} />
      <div className="container mx-auto px-4 py-8">
        <WorkSchedule />
      </div>
    </div>
  );
};

export default WorkSchedulePage;