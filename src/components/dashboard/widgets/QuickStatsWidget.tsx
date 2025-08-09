import React from 'react';
import { TrendingUp, Users, Star, Calendar } from 'lucide-react';

const QuickStatsWidget: React.FC = () => {
  // Mock data - will be replaced with real data later
  const stats = [
    {
      label: 'Συνταγές',
      value: '24',
      icon: Star,
      trend: '+3 αυτό το μήνα'
    },
    {
      label: 'Followers',
      value: '156',
      icon: Users,
      trend: '+12 νέοι'
    },
    {
      label: 'Events',
      value: '8',
      icon: Calendar,
      trend: '3 επερχόμενα'
    }
  ];

  return (
    <div className="space-y-3">
      {stats.map((stat, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <stat.icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="font-semibold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground text-right">
            {stat.trend}
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickStatsWidget;