import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MinimalistLayout } from "@/components/MinimalistLayout";
import { SocialLayout } from "@/components/SocialLayout";

const Index = () => {
  const [location, setLocation] = useState<{ city: string; country: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [layoutStyle, setLayoutStyle] = useState<"current" | "dashboard" | "minimalist" | "social">("current");
  const { toast } = useToast();

  const getUserLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
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
    }
  };

  // Render different layouts based on selection
  if (layoutStyle === "dashboard") {
    return <DashboardLayout location={location} />;
  }

  if (layoutStyle === "minimalist") {
    return <MinimalistLayout location={location} />;
  }

  if (layoutStyle === "social") {
    return <SocialLayout location={location} />;
  }

  // Current/Original Layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
      {/* Layout Selector */}
      <div className="fixed top-4 left-4 z-50">
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 border shadow-lg">
          <div className="flex items-center space-x-3">
            <Palette className="h-4 w-4 text-gray-500" />
            <Select value={layoutStyle} onValueChange={(value: any) => setLayoutStyle(value)}>
              <SelectTrigger className="w-40 h-8 text-xs">
                <SelectValue placeholder="Επιλογή στυλ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Τρέχον (Cards)</SelectItem>
                <SelectItem value="dashboard">Dashboard</SelectItem>
                <SelectItem value="minimalist">Minimalist</SelectItem>
                <SelectItem value="social">Social Feed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Original Layout Content */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-orange-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">CK</span>
              </div>
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

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
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
              </Button>
            </div>
          )}
        </div>

        <div className="text-center mb-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            💡 Χρησιμοποίησε το selector πάνω αριστερά για να δεις διαφορετικά στυλ interface
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
