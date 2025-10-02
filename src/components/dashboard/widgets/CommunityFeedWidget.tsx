import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Heart, Share2, Calendar, ChefHat, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FeedItem {
  id: string;
  type: 'event' | 'recipe';
  author: string;
  avatar: string | null;
  time: string;
  content: string;
  likes: number;
  comments: number;
  isVerified: boolean;
}

const CommunityFeedWidget: React.FC = () => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      // Fetch recent events
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id, title, event_date, created_at, organizer_id')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (eventsError) throw eventsError;

      // Fetch recent recipes
      const { data: recipes, error: recipesError } = await supabase
        .from('recipes')
        .select('id, title, created_at, author_id, total_saves, sharing_type')
        .eq('sharing_type', 'public')
        .order('created_at', { ascending: false })
        .limit(3);

      if (recipesError) throw recipesError;

      // Combine and format feed items
      const feedData: FeedItem[] = [];

      // Add events
      if (events) {
        for (const event of events) {
          const { data: organizer } = await supabase
            .from('profiles')
            .select('display_name, avatar_url, is_verified')
            .eq('user_id', event.organizer_id)
            .maybeSingle();

          const timeAgo = getTimeAgo(new Date(event.created_at));
          
          feedData.push({
            id: `event-${event.id}`,
            type: 'event',
            author: organizer?.display_name || 'Ανώνυμος',
            avatar: organizer?.avatar_url || null,
            time: timeAgo,
            content: `Νέο event: ${event.title}`,
            likes: 0,
            comments: 0,
            isVerified: organizer?.is_verified || false
          });
        }
      }

      // Add recipes
      if (recipes) {
        for (const recipe of recipes) {
          const { data: author } = await supabase
            .from('profiles')
            .select('display_name, avatar_url, is_verified')
            .eq('user_id', recipe.author_id)
            .maybeSingle();

          const timeAgo = getTimeAgo(new Date(recipe.created_at));
          
          feedData.push({
            id: `recipe-${recipe.id}`,
            type: 'recipe',
            author: author?.display_name || 'Ανώνυμος',
            avatar: author?.avatar_url || null,
            time: timeAgo,
            content: `Νέα συνταγή: ${recipe.title}`,
            likes: recipe.total_saves || 0,
            comments: 0,
            isVerified: author?.is_verified || false
          });
        }
      }

      // Sort by time (most recent first)
      feedData.sort((a, b) => {
        const timeA = a.time.includes('λεπτά') || a.time.includes('ώρες') ? 0 : 1;
        const timeB = b.time.includes('λεπτά') || b.time.includes('ώρες') ? 0 : 1;
        return timeA - timeB;
      });

      setFeedItems(feedData.slice(0, 5));
    } catch (error) {
      console.error('Error loading feed:', error);
      toast({
        title: 'Σφάλμα',
        description: 'Δεν ήταν δυνατή η φόρτωση του feed',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} μέρ${days === 1 ? 'α' : 'ες'} πριν`;
    if (hours > 0) return `${hours} ώρ${hours === 1 ? 'α' : 'ες'} πριν`;
    if (minutes > 0) return `${minutes} λεπτά πριν`;
    return 'μόλις τώρα';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Κοινότητα Feed</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Heart className="h-4 w-4" />
          Κοινότητα Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {feedItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Δεν υπάρχει δραστηριότητα ακόμα
          </p>
        ) : (
          feedItems.map((item) => (
            <div key={item.id} className="space-y-3 pb-3 border-b last:border-0">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={item.avatar || undefined} />
                  <AvatarFallback>
                    {item.type === 'event' ? (
                      <Calendar className="h-4 w-4" />
                    ) : (
                      <ChefHat className="h-4 w-4" />
                    )}
                  </AvatarFallback>
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
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default CommunityFeedWidget;