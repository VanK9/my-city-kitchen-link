import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Plus } from 'lucide-react';

const WorkScheduleQuickAccess: React.FC = () => {
  // Mock data - will be replaced with real data from Supabase
  const upcomingShifts = [
    {
      id: 1,
      date: 'Σήμερα',
      time: '09:00 - 17:00',
      location: 'Restaurant Plaza',
      type: 'Πλήρης Απασχόληση'
    },
    {
      id: 2,
      date: 'Αύριο',
      time: '18:00 - 23:00',
      location: 'Cafe Marina',
      type: 'Μερική Απασχόληση'
    },
    {
      id: 3,
      date: 'Παρασκευή',
      time: '10:00 - 18:00',
      location: 'Hotel Athena',
      type: 'Πλήρης Απασχόληση'
    }
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Πρόγραμμα Εργασίας
        </CardTitle>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-1" />
          Νέα Βάρδια
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingShifts.map((shift) => (
          <div 
            key={shift.id} 
            className="p-3 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {shift.date}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{shift.type}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {shift.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    {shift.location}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <Button variant="link" className="w-full text-xs" size="sm">
          Δείτε όλο το πρόγραμμα →
        </Button>
      </CardContent>
    </Card>
  );
};

export default WorkScheduleQuickAccess;