import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Calendar, Star } from 'lucide-react';

const QuickStatsWidget = () => {
  // Mock data - will be replaced with real data later
  const stats = {
    totalRecipes: 15,
    communityRank: 8,
    upcomingEvents: 3,
    achievementBadges: 5
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{stats.totalRecipes}</div>
          <div className="text-xs text-muted-foreground">Συνταγές</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">#{stats.communityRank}</div>
          <div className="text-xs text-muted-foreground">Κατάταξη</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Εκδηλώσεις</span>
          </div>
          <Badge variant="secondary">{stats.upcomingEvents} νέες</Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Διακρίσεις</span>
          </div>
          <Badge variant="outline">{stats.achievementBadges} badges</Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Followers</span>
          </div>
          <Badge variant="outline">24 νέοι</Badge>
        </div>
      </div>

      <div className="mt-4 p-2 bg-muted/30 rounded-lg">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <span className="text-xs text-muted-foreground">
            +12% αύξηση δραστηριότητας αυτή την εβδομάδα
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuickStatsWidget;