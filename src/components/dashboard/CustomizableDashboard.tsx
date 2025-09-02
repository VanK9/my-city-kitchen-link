import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, Eye, EyeOff, RotateCcw } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import DashboardWidget from './DashboardWidget';
import QuickStatsWidget from './widgets/QuickStatsWidget';
import WorkScheduleQuickAccess from './widgets/WorkScheduleQuickAccess';
import CommunityFeedWidget from './widgets/CommunityFeedWidget';
import { useDashboardPreferences } from '@/hooks/useDashboardPreferences';

const availableWidgets = [
  { id: 'quick-stats', name: 'Γρήγορα Στατιστικά', component: QuickStatsWidget },
  { id: 'work-schedule', name: 'Πρόγραμμα Εργασίας', component: WorkScheduleQuickAccess },
  { id: 'community-feed', name: 'Κοινότητα Feed', component: CommunityFeedWidget },
];

const CustomizableDashboard: React.FC = () => {
  const {
    preferences,
    toggleWidgetVisibility,
    updateWidgetOrder,
    resetToDefaults
  } = useDashboardPreferences();

  const [isCustomizing, setIsCustomizing] = useState(false);

  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    e.dataTransfer.setData('widgetId', widgetId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const draggedWidgetId = e.dataTransfer.getData('widgetId');
    const newOrder = [...preferences.widgetOrder];
    const currentIndex = newOrder.indexOf(draggedWidgetId);
    
    if (currentIndex !== -1) {
      newOrder.splice(currentIndex, 1);
      newOrder.splice(targetIndex, 0, draggedWidgetId);
      updateWidgetOrder(newOrder);
    }
  };

  const visibleWidgets = preferences.widgetOrder.filter(id => 
    preferences.visibleWidgets.includes(id)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Πίνακας Ελέγχου</h2>
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
              <SheetDescription>
                Επιλέξτε ποια widgets θέλετε να εμφανίζονται στον πίνακα ελέγχου σας
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-6 mt-6">
              <div className="space-y-4">
                {availableWidgets.map((widget) => (
                  <div key={widget.id} className="flex items-center justify-between">
                    <Label htmlFor={widget.id} className="flex items-center gap-2 cursor-pointer">
                      {preferences.visibleWidgets.includes(widget.id) ? (
                        <Eye className="h-4 w-4 text-primary" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                      {widget.name}
                    </Label>
                    <Switch
                      id={widget.id}
                      checked={preferences.visibleWidgets.includes(widget.id)}
                      onCheckedChange={() => toggleWidgetVisibility(widget.id)}
                    />
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={resetToDefaults}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Επαναφορά στις προεπιλογές
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {visibleWidgets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              Δεν έχετε επιλέξει widgets για εμφάνιση
            </p>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Προσθήκη Widgets
                </Button>
              </SheetTrigger>
            </Sheet>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {visibleWidgets.map((widgetId, index) => {
            const widget = availableWidgets.find(w => w.id === widgetId);
            if (!widget) return null;
            
            const WidgetComponent = widget.component;
            
            return (
              <div
                key={widgetId}
                draggable={isCustomizing}
                onDragStart={(e) => handleDragStart(e, widgetId)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={isCustomizing ? 'cursor-move' : ''}
              >
                <DashboardWidget
                  id={widgetId}
                  title={widget.name}
                  onRemove={isCustomizing ? toggleWidgetVisibility : undefined}
                  isDragging={false}
                >
                  <WidgetComponent />
                </DashboardWidget>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomizableDashboard;