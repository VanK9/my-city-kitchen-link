import React, { useState } from 'react';
import Navigation from './Navigation';
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
        // Logged-in users see the customizable dashboard
        return <CustomizableDashboard />;
    }
  };
  return <div className="min-h-screen bg-gradient-warm">
      <Navigation currentSection={currentSection} onSectionChange={setCurrentSection} />
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>;
};
export default Layout;