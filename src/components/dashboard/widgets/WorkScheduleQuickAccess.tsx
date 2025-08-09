import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, Calendar } from 'lucide-react';

interface WorkScheduleQuickAccessProps {
  onNavigateToWorkSchedule?: () => void;
}

const WorkScheduleQuickAccess: React.FC<WorkScheduleQuickAccessProps> = ({ 
  onNavigateToWorkSchedule 
}) => {
  // Mock data - will be replaced with real data later
  const weeklyHours = 38.5;
  const monthlyEarnings = 1250;
  const todayStatus: 'not_started' | 'working' | 'completed' = 'working';

  const getStatusBadge = () => {
    if (todayStatus === 'working') {
      return <Badge variant="default" className="bg-green-500">Σε Εργασία</Badge>;
    } else if (todayStatus === 'completed') {
      return <Badge variant="secondary">Ολοκληρώθηκε</Badge>;
    } else {
      return <Badge variant="outline">Δεν Ξεκίνησε</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{weeklyHours}h</div>
          <div className="text-xs text-muted-foreground">Εβδομάδα</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">€{monthlyEarnings}</div>
          <div className="text-xs text-muted-foreground">Μήνας</div>
        </div>
      </div>

      {/* Today Status */}
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Σήμερα</span>
        </div>
        {getStatusBadge()}
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <Button 
          onClick={onNavigateToWorkSchedule}
          className="w-full bg-primary hover:bg-primary/90"
          size="sm"
        >
          <Clock className="h-4 w-4 mr-2" />
          Καταγραφή Ωρών
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={onNavigateToWorkSchedule}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Προβολή Αναφορών
        </Button>
      </div>
    </div>
  );
};

export default WorkScheduleQuickAccess;