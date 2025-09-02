import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Calendar, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const QuickStatsWidget: React.FC = () => {
  const { profile } = useAuth();

  const stats = [
    {
      label: 'Χρόνια Εμπειρίας',
      value: profile?.years_experience || 0,
      icon: Award,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      label: 'Επαληθεύσεις',
      value: profile?.is_verified ? 'Επαληθευμένος' : 'Μη επαληθευμένος',
      icon: Users,
      color: profile?.is_verified ? 'text-green-600' : 'text-muted-foreground',
      bgColor: profile?.is_verified ? 'bg-green-100' : 'bg-muted/30'
    },
    {
      label: 'Προγραμματισμένα',
      value: '3 Events',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Τάση',
      value: '+12%',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Γρήγορα Στατιστικά</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-sm font-semibold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default QuickStatsWidget;