import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  ChefHat, 
  Calendar, 
  BookOpen, 
  CreditCard, 
  User, 
  Clock, 
  Menu,
  Home,
  MapPin,
  Shield,
  Settings as SettingsIcon
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthButtons } from '@/components/auth/AuthButtons';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface NavigationProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentSection, onSectionChange }) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const navigationItems = [
    { id: 'home', label: 'Αρχική', icon: Home },
    { id: 'recipes', label: 'Συνταγές', icon: ChefHat },
    { id: 'events', label: 'Εκδηλώσεις', icon: Calendar },
    { id: 'tutorials', label: 'Tutorials', icon: BookOpen },
    ...(user ? [
      { id: 'work-schedule', label: 'Πρόγραμμα Εργασίας', icon: Clock },
      { id: 'subscriptions', label: 'Συνδρομές', icon: CreditCard },
      { id: 'profile', label: 'Προφίλ', icon: User },
      ...(isAdmin ? [{ id: 'admin', label: 'Admin Panel', icon: Shield }] : [])
    ] : [])
  ];

  const handleNavClick = (sectionId: string) => {
    onSectionChange(sectionId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center shadow-warm">
                <ChefHat className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  SpreadIt
                </h1>
                <p className="text-xs text-muted-foreground">Κοινότητα Μαγείρων</p>
              </div>
            </div>

            {/* Desktop Navigation Menu */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentSection === item.id;
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleNavClick(item.id)}
                    className={isActive ? "bg-primary hover:bg-primary/90" : ""}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>

            <div className="flex items-center space-x-4">
              {profile?.city && (
                <Badge variant="secondary" className="hidden sm:flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{profile.city}</span>
                </Badge>
              )}
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/profile-settings')}
                  className="hidden md:flex"
                >
                  <SettingsIcon className="h-4 w-4" />
                </Button>
              )}
              <AuthButtons />
              
              {/* Mobile Menu Button */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col space-y-4 mt-8">
                    <div className="text-center pb-4 border-b">
                      <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center mx-auto mb-2 shadow-warm">
                        <ChefHat className="h-7 w-7 text-primary-foreground" />
                      </div>
                      <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                        SpreadIt
                      </h2>
                      <p className="text-sm text-muted-foreground">Κοινότητα Μαγείρων</p>
                    </div>
                    
                    {navigationItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentSection === item.id;
                      return (
                        <Button
                          key={item.id}
                          variant={isActive ? "default" : "ghost"}
                          onClick={() => handleNavClick(item.id)}
                          className={`justify-start w-full ${isActive ? "bg-primary hover:bg-primary/90" : ""}`}
                        >
                          <Icon className="h-5 w-5 mr-3" />
                          {item.label}
                        </Button>
                      );
                    })}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navigation;