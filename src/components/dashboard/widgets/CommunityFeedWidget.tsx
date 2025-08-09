import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Heart, ChefHat } from 'lucide-react';

const CommunityFeedWidget: React.FC = () => {
  // Mock data - will be replaced with real data later
  const feedItems = [
    {
      id: '1',
      user: 'Γιάννης Παπαδόπουλος',
      userAvatar: '',
      userBadge: 'verified',
      content: 'Νέα συνταγή για carbonara με ελληνικά υλικά!',
      timestamp: '2 ώρες πριν',
      likes: 12,
      comments: 3
    },
    {
      id: '2',
      user: 'Μαρία Αντωνίου',
      userAvatar: '',
      userBadge: 'professional',
      content: 'Workshop για παραδοσιακά γλυκά - Σάββατο 10:00',
      timestamp: '4 ώρες πριν',
      likes: 8,
      comments: 5
    },
    {
      id: '3',
      user: 'Κώστας Δημητρίου',
      userAvatar: '',
      userBadge: null,
      content: 'Ποια είναι η καλύτερη μάρκα μαχαιριών για αρχάριους;',
      timestamp: '6 ώρες πριν',
      likes: 4,
      comments: 7
    }
  ];

  const getBadgeColor = (badge: string | null) => {
    switch (badge) {
      case 'verified':
        return 'bg-blue-500';
      case 'professional':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-3">
      {feedItems.map((item) => (
        <div key={item.id} className="p-3 bg-muted/30 rounded-lg space-y-2">
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={item.userAvatar} />
              <AvatarFallback>
                <ChefHat className="h-3 w-3" />
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{item.user}</span>
            {item.userBadge && (
              <Badge className={`h-4 text-xs ${getBadgeColor(item.userBadge)}`}>
                {item.userBadge === 'verified' ? '✓' : 'PRO'}
              </Badge>
            )}
          </div>
          <p className="text-sm">{item.content}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{item.timestamp}</span>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Heart className="h-3 w-3" />
                <span>{item.likes}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-3 w-3" />
                <span>{item.comments}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommunityFeedWidget;