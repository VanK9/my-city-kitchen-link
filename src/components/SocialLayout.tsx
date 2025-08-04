import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MapPin, Users, Calendar, Trophy, ChefHat, Heart, 
  MessageCircle, Share2, Search, Plus, Home, 
  User, Bell, Menu, Bookmark, Camera
} from "lucide-react";

interface SocialLayoutProps {
  location: { city: string; country: string } | null;
}

export const SocialLayout = ({ location }: SocialLayoutProps) => {
  const [activeTab, setActiveTab] = useState("home");

  const posts = [
    {
      id: 1,
      user: { name: "Μαρία Κ.", role: "Pastry Chef", avatar: "/api/placeholder/40/40", verified: true },
      time: "2 ώρες πριν",
      content: "Μόλις τελείωσα ένα απίστευτο κέικ σοκολάτας! Η συνταγή που μοιράστηκε ο Γιάννης λειτούργησε τέλεια 🍰",
      image: "/api/placeholder/400/300",
      likes: 24,
      comments: 8,
      location: "Αθήνα"
    },
    {
      id: 2,
      user: { name: "Γιάννης Π.", role: "Head Chef", avatar: "/api/placeholder/40/40", verified: false },
      time: "4 ώρες πριν",
      content: "Ψάχνω συνεργάτη για νέο project στη Θεσσαλονίκη. DM για περισσότερες πληροφορίες!",
      likes: 12,
      comments: 15,
      location: "Θεσσαλονίκη"
    },
    {
      id: 3,
      user: { name: "Ελένη Μ.", role: "Sous Chef", avatar: "/api/placeholder/40/40", verified: true },
      time: "6 ώρες πριν",
      content: "Live από το σεμινάριο μοριακής μαγειρικής! Καταπληκτικές τεχνικές 🧪✨",
      image: "/api/placeholder/400/300",
      likes: 45,
      comments: 12,
      location: "Πάτρα"
    }
  ];

  const stories = [
    { id: 1, user: "Εσύ", avatar: "/api/placeholder/40/40", hasStory: false, isAdd: true },
    { id: 2, user: "Μαρία", avatar: "/api/placeholder/40/40", hasStory: true },
    { id: 3, user: "Γιάννης", avatar: "/api/placeholder/40/40", hasStory: true },
    { id: 4, user: "Ελένη", avatar: "/api/placeholder/40/40", hasStory: true },
    { id: 5, user: "Νίκος", avatar: "/api/placeholder/40/40", hasStory: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Mobile Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ChefHat className="h-8 w-8 text-orange-600" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent">
                Kitchen
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              {location && (
                <Badge variant="outline" className="text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  {location.city}
                </Badge>
              )}
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <MessageCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stories */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="flex space-x-4 overflow-x-auto">
          {stories.map((story) => (
            <div key={story.id} className="flex flex-col items-center space-y-1 min-w-fit">
              <div className={`relative ${story.isAdd ? '' : 'p-0.5 bg-gradient-to-tr from-orange-400 to-red-500 rounded-full'}`}>
                <div className={`relative ${story.isAdd ? 'h-16 w-16' : 'h-14 w-14'} ${story.isAdd ? 'border-2 border-dashed border-gray-300 dark:border-gray-600' : 'bg-white dark:bg-gray-900'} rounded-full flex items-center justify-center`}>
                  {story.isAdd ? (
                    <Plus className="h-6 w-6 text-gray-400" />
                  ) : (
                    <Avatar className="h-full w-full">
                      <AvatarImage src={story.avatar} />
                      <AvatarFallback>{story.user[0]}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
              <span className="text-xs text-center max-w-16 truncate">{story.user}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="pb-20">
        {posts.map((post) => (
          <Card key={post.id} className="mb-0 rounded-none border-x-0 border-t-0 bg-white dark:bg-gray-900">
            <CardContent className="p-0">
              {/* Post Header */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={post.user.avatar} />
                    <AvatarFallback>{post.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-1">
                      <span className="font-semibold text-sm">{post.user.name}</span>
                      {post.user.verified && (
                        <div className="h-4 w-4 rounded-full bg-orange-600 flex items-center justify-center">
                          <ChefHat className="h-2 w-2 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>{post.user.role}</span>
                      <span>•</span>
                      <span>{post.time}</span>
                      {post.location && (
                        <>
                          <span>•</span>
                          <MapPin className="h-3 w-3" />
                          <span>{post.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </div>

              {/* Post Content */}
              <div className="px-4 pb-3">
                <p className="text-sm leading-relaxed">{post.content}</p>
              </div>

              {/* Post Image */}
              {post.image && (
                <div className="relative">
                  <img 
                    src={post.image} 
                    alt="Post content" 
                    className="w-full aspect-square object-cover"
                  />
                </div>
              )}

              {/* Post Actions */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" className="p-0 h-auto">
                      <Heart className="h-6 w-6 mr-1" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-0 h-auto">
                      <MessageCircle className="h-6 w-6 mr-1" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-0 h-auto">
                      <Share2 className="h-6 w-6 mr-1" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    <Bookmark className="h-6 w-6" />
                  </Button>
                </div>

                <div className="text-sm">
                  <p className="font-semibold mb-1">{post.likes} likes</p>
                  {post.comments > 0 && (
                    <button className="text-gray-500 dark:text-gray-400">
                      Δες και τα {post.comments} σχόλια
                    </button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Load More */}
        <div className="p-6 text-center">
          <Button variant="outline" className="w-full">
            Φόρτωσε περισσότερα
          </Button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-around py-2">
          {[
            { id: "home", icon: Home, label: "Αρχική" },
            { id: "search", icon: Search, label: "Αναζήτηση" },
            { id: "add", icon: Plus, label: "Δημιουργία", isSpecial: true },
            { id: "notifications", icon: Bell, label: "Ειδοποιήσεις" },
            { id: "profile", icon: User, label: "Προφίλ" },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center space-y-1 p-2 ${
                tab.isSpecial ? 'bg-orange-600 text-white hover:bg-orange-700 rounded-full' : ''
              } ${
                activeTab === tab.id && !tab.isSpecial ? 'text-orange-600' : ''
              }`}
            >
              <tab.icon className={`h-5 w-5 ${tab.isSpecial ? 'text-white' : ''}`} />
              {!tab.isSpecial && (
                <span className="text-xs">{tab.label}</span>
              )}
            </Button>
          ))}
        </div>
      </nav>
    </div>
  );
};