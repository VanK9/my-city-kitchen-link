import React, { useState } from 'react';
import Navigation from './Navigation';
import { Recipes } from './features/Recipes';
import { Events } from './features/Events';
import { Tutorials } from './features/Tutorials';
import { Subscriptions } from './features/Subscriptions';
import WorkSchedule from './features/WorkSchedule';
import CustomizableDashboard from './dashboard/CustomizableDashboard';
import ProfileManager from './profile/ProfileManager';
import PeerVerification from './profile/PeerVerification';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChefHat, Users, Calendar, BookOpen, Search, MapPin, Star, Zap, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
const Layout: React.FC = () => {
  const [currentSection, setCurrentSection] = useState('home');
  const {
    user,
    profile
  } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Implement search functionality
      console.log('Searching for:', searchQuery);
    }
  };
  const renderContent = () => {
    switch (currentSection) {
      case 'recipes':
        return <Recipes />;
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
      case 'home':
      default:
        if (user) {
          // Logged-in users see the customizable dashboard
          return <CustomizableDashboard onNavigateToWorkSchedule={() => setCurrentSection('work-schedule')} />;
        }

        // Non-logged-in users see the marketing page
        return <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold">
                  <span className="bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                    SpreadIt
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                  Η κοινότητα που ενώνει επαγγελματίες μάγειρες και λάτρεις της μαγειρικής. 
                  Συνταγές, εκδηλώσεις, tutorials και εργασιακά εργαλεία σε μία πλατφόρμα.
                </p>
              </div>

              {/* Search Bar */}
              <div className="max-w-md mx-auto flex space-x-2">
                <Input placeholder="Αναζήτηση συνταγών, εκδηλώσεων..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearch()} className="flex-1" />
                <Button onClick={handleSearch} className="bg-primary hover:bg-primary/90">
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="cursor-pointer hover:shadow-warm transition-all duration-300 border-2 hover:border-primary/20" onClick={() => setCurrentSection('recipes')}>
                <CardHeader className="text-center">
                  <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center mx-auto mb-2 shadow-warm">
                    <ChefHat className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle>Συνταγές</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">Εκατοντάδες συνταγές από επαγγελματίες μάγειρες. Δωρεάν και premium περιεχόμενο.</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-warm transition-all duration-300 border-2 hover:border-primary/20" onClick={() => setCurrentSection('events')}>
                <CardHeader className="text-center">
                  <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center mx-auto mb-2 shadow-warm">
                    <Calendar className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle>Εκδηλώσεις</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">
                    Workshops, διαγωνισμοί και networking events στην περιοχή σας.
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-warm transition-all duration-300 border-2 hover:border-primary/20" onClick={() => setCurrentSection('tutorials')}>
                <CardHeader className="text-center">
                  <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center mx-auto mb-2 shadow-warm">
                    <BookOpen className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle>Tutorials</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">
                    Μάθετε νέες τεχνικές με βίντεο tutorials από έμπειρους chefs.
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-warm transition-all duration-300 border-2 hover:border-primary/20" onClick={() => setCurrentSection('work-schedule')}>
                <CardHeader className="text-center">
                  <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center mx-auto mb-2 shadow-warm">
                    <Users className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle>Εργασία</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">
                    Καταγραφή ωρών και υπολογισμός μισθού σύμφωνα με τον Ελληνικό νόμο.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Benefits Section */}
            <div className="bg-gradient-warm rounded-2xl p-8 border shadow-elegant">
              <h2 className="text-3xl font-bold text-center mb-8">
                Γιατί να Επιλέξετε το SpreadIt;
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center space-y-4">
                  <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center mx-auto shadow-warm">
                    <Star className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">Επαγγελματικό Δίκτυο</h3>
                  <p className="text-muted-foreground">
                    Συνδεθείτε με επαγγελματίες μάγειρες, μοιραστείτε εμπειρίες και αναπτύξτε τη καριέρα σας.
                  </p>
                </div>
                <div className="text-center space-y-4">
                  <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center mx-auto shadow-warm">
                    <Zap className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">Εργαλεία Εργασίας</h3>
                  <p className="text-muted-foreground">
                    Καταγραφή ωρών, υπολογισμός μισθού και διαχείριση εργασιακών δεδομένων με Ελληνικό νομικό πλαίσιο.
                  </p>
                </div>
                <div className="text-center space-y-4">
                  <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center mx-auto shadow-warm">
                    <Shield className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">Επαληθευμένο Περιεχόμενο</h3>
                  <p className="text-muted-foreground">
                    Συνταγές και tutorials από επαληθευμένους επαγγελματίες με έλεγχο ποιότητας.
                  </p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center bg-card rounded-2xl p-8 border shadow-elegant">
              <h2 className="text-2xl font-bold mb-4">Είστε Έτοιμοι να Ξεκινήσετε;</h2>
              <p className="text-muted-foreground mb-6">
                Εγγραφείτε σήμερα και αποκτήστε πρόσβαση σε όλες τις δυνατότητες του SpreadIt.
              </p>
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Εγγραφή Τώρα
              </Button>
            </div>
          </div>;
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