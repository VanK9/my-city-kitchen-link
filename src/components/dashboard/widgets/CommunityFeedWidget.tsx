import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Heart, Share } from 'lucide-react';

const CommunityFeedWidget = () => {
  // Mock data - will be replaced with real data later
  const feedItems = [
    {
      id: 1,
      user: 'Chef Maria',
      avatar: '',
      badge: 'Verified',
      content: 'Νέα συνταγή για carbonara με κρεμμύδια καραμελωμένα! 🍝',
      time: '2 ώρες πριν',
      likes: 12,
      comments: 3
    },
    {
      id: 2,
      user: 'Dimitris K.',
      avatar: '',
      badge: 'Member',
      content: 'Πότε θα γίνει το επόμενο workshop για ζυμάρια;',
      time: '4 ώρες πριν',
      likes: 8,
      comments: 5
    },
    {
      id: 3,
      user: 'Sofia Chef',
      avatar: '',
      badge: 'Pro',
      content: 'Μόλις τελείωσα 12ωρο στο εστιατόριο. Καταγραφή με το SpreadIt! 💪',
      time: '6 ώρες πριν',
      likes: 15,
      comments: 2
    }
  ];

  return (
    <div className="space-y-4">
      {feedItems.map((item) => (
        <div key={item.id} className="border-b border-border pb-4 last:border-b-0">
          <div className="flex items-start space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={item.avatar} />
              <AvatarFallback className="text-xs">
                {item.user.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{item.user}</span>
                <Badge 
                  variant={item.badge === 'Verified' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {item.badge}
                </Badge>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
              
              <p className="text-sm text-foreground">{item.content}</p>
              
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="h-6 px-2">
                  <Heart className="h-3 w-3 mr-1" />
                  <span className="text-xs">{item.likes}</span>
                </Button>
                <Button variant="ghost" size="sm" className="h-6 px-2">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  <span className="text-xs">{item.comments}</span>
                </Button>
                <Button variant="ghost" size="sm" className="h-6 px-2">
                  <Share className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <Button variant="outline" className="w-full" size="sm">
        Περισσότερα
      </Button>
    </div>
  );
};

export default CommunityFeedWidget;