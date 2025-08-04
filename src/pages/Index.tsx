import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Calendar, Trophy, ChefHat } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [location, setLocation] = useState<{ city: string; country: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getUserLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Using reverse geocoding to get city name
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=el`
            );
            const data = await response.json();
            setLocation({
              city: data.city || data.locality || "Άγνωστη πόλη",
              country: data.countryName || "Ελλάδα"
            });
            toast({
              title: "Η τοποθεσία σας εντοπίστηκε!",
              description: `Βρίσκεστε στη ${data.city || data.locality}`,
            });
          } catch (error) {
            toast({
              title: "Σφάλμα",
              description: "Δεν μπόρεσε να εντοπιστεί η τοποθεσία σας",
              variant: "destructive",
            });
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          setLoading(false);
          toast({
            title: "Σφάλμα τοποθεσίας",
            description: "Παρακαλώ επιτρέψτε την πρόσβαση στην τοποθεσία σας",
            variant: "destructive",
          });
        }
      );
    } else {
      setLoading(false);
      toast({
        title: "Μη υποστηριζόμενη λειτουργία",
        description: "Το browser σας δεν υποστηρίζει geolocation",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-orange-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                City Kitchen Link
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {location && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{location.city}</span>
                </Badge>
              )}
              <Button variant="outline">Σύνδεση</Button>
              <Button>Εγγραφή</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <ChefHat className="h-16 w-16 text-orange-600 animate-pulse" />
              <div className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 rounded-full flex items-center justify-center">
                <Users className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Συνδέσου με μάγειρες
            <span className="block text-orange-600">στην πόλη σου</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Η πλατφόρμα που ενώνει επαγγελματίες μάγειρες και μαθητές. 
            Δικτύωση, συνεργασίες, εκδηλώσεις και προνόμια σε ένα μέρος.
          </p>
          
          {!location ? (
            <Button 
              onClick={getUserLocation}
              disabled={loading}
              size="lg"
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3"
            >
              {loading ? "Εντοπισμός..." : "Βρες την πόλη μου"}
              <MapPin className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-green-600 font-semibold">
                Εντοπίστηκες στη {location.city}! 🎯
              </p>
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3">
                Δες μαγείρες στη {location.city}
                <Users className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Δικτύωση</CardTitle>
              <CardDescription>
                Συνδέσου με επαγγελματίες και μαθητές στον κλάδο
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Calendar className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Ημερολόγιο</CardTitle>
              <CardDescription>
                Καταγραφή μεροκαμάτων και υπολογισμός μισθού
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Trophy className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Προνόμια</CardTitle>
              <CardDescription>
                Εκπτώσεις σε εξοπλισμό και σεμινάρια
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <MapPin className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Events</CardTitle>
              <CardDescription>
                Εκδηλώσεις και σεμινάρια στην πόλη σου
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Location-based Events Preview */}
        {location && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-orange-600" />
                <span>Προσεχείς εκδηλώσεις στη {location.city}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Δεν υπάρχουν προγραμματισμένες εκδηλώσεις αυτή τη στιγμή.</p>
                <p className="text-sm mt-2">Γίνε μέλος για να ενημερώνεσαι πρώτος!</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Index;
