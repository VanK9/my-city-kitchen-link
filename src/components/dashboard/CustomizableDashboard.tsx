import React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, Clock, BarChart3, MessageSquare } from 'lucide-react';
import DashboardWidget, { WidgetConfig } from './DashboardWidget';
import WorkScheduleQuickAccess from './widgets/WorkScheduleQuickAccess';
import QuickStatsWidget from './widgets/QuickStatsWidget';
import CommunityFeedWidget from './widgets/CommunityFeedWidget';
import { useDashboardPreferences } from '@/hooks/useDashboardPreferences';

interface CustomizableDashboardProps {
  onNavigateToWorkSchedule: () => void;
}

const CustomizableDashboard: React.FC<CustomizableDashboardProps> = ({
  onNavigateToWorkSchedule
}) => {
  const { preferences, toggleWidgetVisibility } = useDashboardPreferences();

  const availableWidgets: WidgetConfig[] = [
    {
      id: 'work-schedule',
      title: 'Πρόγραμμα Εργασίας',
      component: () => <WorkScheduleQuickAccess onNavigateToWorkSchedule={onNavigateToWorkSchedule} />,
      icon: Clock,
      size: 'medium',
      category: 'work',
      defaultVisible: true
    },
    {
      id: 'quick-stats',
      title: 'Γρήγορα Στατιστικά',
      component: QuickStatsWidget,
      icon: BarChart3,
      size: 'medium',
      category: 'overview',
      defaultVisible: true
    },
    {
      id: 'community-feed',
      title: 'Community Feed',
      component: CommunityFeedWidget,
      icon: MessageSquare,
      size: 'large',
      category: 'social',
      defaultVisible: true
    }
  ];

  const visibleWidgets = availableWidgets.filter(widget => 
    preferences.visibleWidgets.includes(widget.id)
  );

  const sortedWidgets = visibleWidgets.sort((a, b) => {
    const aIndex = preferences.widgetOrder.indexOf(a.id);
    const bIndex = preferences.widgetOrder.indexOf(b.id);
    return aIndex - bIndex;
  });

  return (
    <div className="space-y-6">
      {/* Header with Settings */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Ο Χώρος σας</h2>
          <p className="text-muted-foreground">Προσαρμόστε το dashboard σας</p>
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Προσαρμογή
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Προσαρμογή Dashboard</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 mt-6">
              <div>
                <h3 className="font-semibold mb-3">Ορατά Widgets</h3>
                <div className="space-y-3">
                  {availableWidgets.map((widget) => (
                    <div key={widget.id} className="flex items-center justify-between">
                      <Label htmlFor={widget.id} className="flex items-center space-x-2">
                        <widget.icon className="h-4 w-4" />
                        <span>{widget.title}</span>
                      </Label>
                      <Switch
                        id={widget.id}
                        checked={preferences.visibleWidgets.includes(widget.id)}
                        onCheckedChange={() => toggleWidgetVisibility(widget.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Prominent Work Schedule Access */}
      <div className="bg-gradient-to-r from-primary/10 to-primary-glow/10 rounded-xl p-6 border-2 border-primary/20">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h3 className="text-xl font-bold flex items-center">
              <Clock className="h-6 w-6 mr-2 text-primary" />
              Καταγραφή Ωρών Εργασίας
            </h3>
            <p className="text-muted-foreground">
              Παρακολουθήστε τις ώρες σας και υπολογίστε τα δεδουλευμένα
            </p>
          </div>
          <Button 
            onClick={onNavigateToWorkSchedule}
            size="lg"
            className="bg-primary hover:bg-primary/90"
          >
            Άνοιγμα
          </Button>
        </div>
      </div>

      {/* Dashboard Widgets Grid */}
      {sortedWidgets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedWidgets.map((widget) => (
            <DashboardWidget
              key={widget.id}
              widget={widget}
              isVisible={preferences.visibleWidgets.includes(widget.id)}
              onToggleVisibility={toggleWidgetVisibility}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomizableDashboard;