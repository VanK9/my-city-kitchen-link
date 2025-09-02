import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Heart, Share2 } from 'lucide-react';

const CommunityFeedWidget: React.FC = () => {
  // Mock data - will be replaced with real community feed from Supabase
  const feedItems = [
    {
      id: 1,
      author: 'Μαρία Π.',
      avatar: null,
      time: '2 ώρες πριν',
      content: 'Μόλις ολοκλήρωσα το νέο σεμινάριο για molecular gastronomy! Συναρπαστική εμπειρία!',
      likes: 12,
      comments: 3,
      isVerified: true
    },
    {
      id: 2,
      author: 'Γιάννης Κ.',
      avatar: null,
      time: '5 ώρες πριν',
      content: 'Ψάχνω συνάδελφο για event στη Θεσσαλονίκη το Σάββατο. Μαγειρική Ιταλικής κουζίνας.',
      likes: 8,
      comments: 5,
      isVerified: false
    },
    {
      id: 3,
      author: 'Ελένη Σ.',
      avatar: null,
      time: '1 μέρα πριν',
      content: 'Νέα συνταγή για vegan dessert ανέβηκε στην πλατφόρμα! Check it out!',
      likes: 24,
      comments: 7,
      isVerified: true
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Κοινότητα Feed</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {feedItems.map((item) => (
          <div key={item.id} className="space-y-3 pb-3 border-b last:border-0">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={item.avatar || undefined} />
                <AvatarFallback>{item.author.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{item.author}</span>
                  {item.isVerified && (
                    <Badge variant="secondary" className="text-xs h-4 px-1">
                      ✓
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
                <p className="text-sm text-muted-foreground">{item.content}</p>
                <div className="flex items-center gap-4 pt-2">
                  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                    <Heart className="h-3 w-3" />
                    {item.likes}
                  </button>
                  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                    <MessageSquare className="h-3 w-3" />
                    {item.comments}
                  </button>
                  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                    <Share2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CommunityFeedWidget;