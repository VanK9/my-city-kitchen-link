import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MapPin, Palette, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AuthButtons } from "@/components/auth/AuthButtons";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MinimalistLayout } from "@/components/MinimalistLayout";
import { SocialLayout } from "@/components/SocialLayout";

const Index = () => {
  const [searchLocation, setSearchLocation] = useState("");
  const [layoutStyle, setLayoutStyle] = useState<"current" | "dashboard" | "minimalist" | "social">("current");
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const handleLocationSearch = () => {
    if (searchLocation.trim()) {
      toast({
        title: "Αναζήτηση τοποθεσίας",
        description: `Αναζήτηση για: ${searchLocation}`,
      });
      // Εδώ θα προστεθεί η λογική αναζήτησης
    }
  };

  // Render different layouts based on selection
  if (layoutStyle === "dashboard") {
    return <DashboardLayout location={profile ? { city: profile.city || "", country: profile.country || "Ελλάδα" } : null} />;
  }

  if (layoutStyle === "minimalist") {
    return <MinimalistLayout location={profile ? { city: profile.city || "", country: profile.country || "Ελλάδα" } : null} />;
  }

  if (layoutStyle === "social") {
    return <SocialLayout location={profile ? { city: profile.city || "", country: profile.country || "Ελλάδα" } : null} />;
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
              {profile?.city && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{profile.city}</span>
                </Badge>
              )}
              <AuthButtons />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Συνδέσου με μάγειρες
            <span className="block text-orange-600">στην περιοχή σου</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Η πλατφόρμα που ενώνει επαγγελματίες μάγειρες και μαθητές. 
            Δικτύωση, συνεργασίες, εκδηλώσεις και προνόμια σε ένα μέρος.
          </p>
          
          <div className="max-w-md mx-auto space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Αναζήτηση πόλης... π.χ. Αθήνα"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
                className="flex-1"
              />
              <Button 
                onClick={handleLocationSearch}
                size="lg"
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
            
            {user && (
              <p className="text-sm text-muted-foreground">
                Γεια σου {profile?.display_name || user.email}! 
                {profile?.city && ` Βρίσκεσαι στη ${profile.city}.`}
              </p>
            )}
          </div>
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
