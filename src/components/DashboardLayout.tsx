import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, Users, Calendar, Trophy, ChefHat, Settings, 
  User, MessageCircle, Bell, TrendingUp, Clock, Star
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  location: { city: string; country: string } | null;
}

const navigationItems = [
  { title: "Αρχική", icon: ChefHat, active: true },
  { title: "Προφίλ", icon: User },
  { title: "Ημερολόγιο", icon: Calendar },
  { title: "Μηνύματα", icon: MessageCircle },
  { title: "Events", icon: MapPin },
  { title: "Προνόμια", icon: Trophy },
  { title: "Ρυθμίσεις", icon: Settings },
];

export const DashboardLayout = ({ location }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50 dark:bg-gray-900">
        <Sidebar className="border-r">
          <SidebarContent>
            {/* Logo */}
            <div className="p-6 border-b">
              <div className="flex items-center space-x-2">
                <ChefHat className="h-8 w-8 text-orange-600" />
                <div>
                  <h1 className="font-bold text-lg">City Kitchen</h1>
                  <p className="text-sm text-muted-foreground">Link</p>
                </div>
              </div>
            </div>

            <SidebarGroup>
              <SidebarGroupLabel>Κεντρικό Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        isActive={item.active}
                        className="w-full justify-start"
                      >
                        <item.icon className="mr-3 h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Location Badge */}
            {location && (
              <div className="p-4 mt-auto">
                <Badge variant="secondary" className="w-full justify-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {location.city}
                </Badge>
              </div>
            )}
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b bg-white dark:bg-gray-800 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div>
                  <h2 className="text-xl font-semibold">Dashboard</h2>
                  <p className="text-sm text-muted-foreground">Καλωσήρθες πίσω!</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MessageCircle className="h-4 w-4" />
                </Button>
                <Button>Συνδρομή</Button>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 p-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Μηνιαίος Μισθός</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€1,280</div>
                  <p className="text-xs text-muted-foreground">+12% από τον προηγούμενο μήνα</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ώρες Εργασίας</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">168</div>
                  <p className="text-xs text-muted-foreground">Αυτός ο μήνας</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Συνδέσεις</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">23</div>
                  <p className="text-xs text-muted-foreground">Νέες αυτή την εβδομάδα</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.8</div>
                  <p className="text-xs text-muted-foreground">Από 15 αξιολογήσεις</p>
                </CardContent>
              </Card>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Πρόσφατη Δραστηριότητα</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { user: "Γιάννης Π.", action: "σε προσκάλεσε να συνδεθείτε", time: "2 ώρες πριν" },
                      { user: "Σεμινάριο Ζαχαροπλαστικής", action: "νέα εγγραφή", time: "4 ώρες πριν" },
                      { user: "Μαρία Κ.", action: "σχολίασε το προφίλ σου", time: "1 μέρα πριν" },
                    ].map((activity, i) => (
                      <div key={i} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div className="h-8 w-8 rounded-full bg-orange-600 flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.user}</p>
                          <p className="text-xs text-muted-foreground">{activity.action}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <CardTitle>Προσεχή Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {location ? (
                      [
                        { title: "Σεμινάριο Pasta", date: "15 Δεκ", location: location.city },
                        { title: "Networking Event", date: "18 Δεκ", location: location.city },
                        { title: "Μάστερ Class", date: "22 Δεκ", location: location.city },
                      ].map((event, i) => (
                        <div key={i} className="p-3 border rounded-lg">
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          <p className="text-xs text-muted-foreground">{event.date} • {event.location}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Επιτρέψτε την τοποθεσία για να δείτε events</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};