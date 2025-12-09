import React, { useState } from 'react';
import Navigation from './Navigation';
import { BottomNavigation } from './BottomNavigation';
import { EnhancedRecipes } from './features/EnhancedRecipes';
import { Events } from './features/Events';
import { Tutorials } from './features/Tutorials';
import { Subscriptions } from './features/Subscriptions';
import WorkSchedule from './features/WorkSchedule';
import CustomizableDashboard from './dashboard/CustomizableDashboard';
import ProfileManager from './profile/ProfileManager';
import PeerVerification from './profile/PeerVerification';
import { EventApproval } from './admin/EventApproval';

const Layout: React.FC = () => {
  const [currentSection, setCurrentSection] = useState('home');

  const handleSectionChange = (section: string) => {
    // Map 'work' from bottom nav to 'work-schedule'
    if (section === 'work') {
      setCurrentSection('work-schedule');
    } else {
      setCurrentSection(section);
    }
  };

  const renderContent = () => {
    switch (currentSection) {
      case 'recipes':
        return <EnhancedRecipes />;
      case 'events':
        return <Events />;
      case 'tutorials':
        return <Tutorials />;
      case 'work-schedule':
        return <WorkSchedule />;
      case 'subscriptions':
        return <Subscriptions />;
      case 'profile':
        return (
          <div className="space-y-6">
            <ProfileManager />
            <PeerVerification />
          </div>
        );
      case 'admin':
        return <EventApproval />;
      case 'home':
      default:
        return <CustomizableDashboard />;
    }
  };

  // Get active section for bottom nav (map work-schedule back to work)
  const getBottomNavSection = () => {
    if (currentSection === 'work-schedule') return 'work';
    return currentSection;
  };

  return (
    <div className="min-h-screen bg-gradient-warm pb-20">
      <Navigation currentSection={currentSection} onSectionChange={handleSectionChange} />
      <main className="container mx-auto px-4 py-4">
        {renderContent()}
      </main>
      <BottomNavigation 
        currentSection={getBottomNavSection()} 
        onSectionChange={handleSectionChange} 
      />
    </div>
  );
};

export default Layout;