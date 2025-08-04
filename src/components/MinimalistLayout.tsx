import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, Users, Calendar, Trophy, ChefHat, ArrowRight, 
  Sparkles, Heart, Share2, Plus
} from "lucide-react";

interface MinimalistLayoutProps {
  location: { city: string; country: string } | null;
}

export const MinimalistLayout = ({ location }: MinimalistLayoutProps) => {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Minimal Header */}
      <header className="border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                <ChefHat className="h-4 w-4 text-white" />
              </div>
              <span className="font-light text-xl tracking-wide">kitchen</span>
            </div>
            
            <div className="flex items-center space-x-6">
              {location && (
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <MapPin className="h-3 w-3" />
                  <span>{location.city}</span>
                </div>
              )}
              <Button variant="ghost" className="text-sm font-light">Σύνδεση</Button>
              <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-full px-6">
                Εγγραφή
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center space-x-2 bg-gray-50 dark:bg-gray-900 rounded-full px-4 py-2 text-sm mb-8">
            <Sparkles className="h-4 w-4 text-orange-500" />
            <span className="text-gray-600 dark:text-gray-400">Η κοινότητα των επαγγελματιών μαγείρων</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-extralight leading-tight mb-8 tracking-tight">
            Συνδέσου με
            <span className="block bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent font-light">
              μάγειρες
            </span>
            στην πόλη σου
          </h1>
          
          <p className="text-xl text-gray-500 dark:text-gray-400 font-light leading-relaxed mb-12 max-w-2xl mx-auto">
            Μια minimal πλατφόρμα για networking, ανταλλαγή ιδεών και επαγγελματική ανάπτυξη 
            στον κόσμο της μαγειρικής.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-full px-8 py-3 text-base">
              Ξεκίνα τώρα
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="ghost" size="lg" className="rounded-full px-8 py-3 text-base font-light">
              Μάθε περισσότερα
            </Button>
          </div>
        </div>
      </section>

      {/* Features Cards */}
      <section className="py-24 px-6 border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Users,
                title: "Δικτύωση",
                description: "Συνδέσου με επαγγελματίες και μαθητές",
                color: "from-blue-400 to-blue-600"
              },
              {
                icon: Calendar,
                title: "Ημερολόγιο",
                description: "Παρακολούθηση εργασιακών ωρών",
                color: "from-green-400 to-green-600"
              },
              {
                icon: Trophy,
                title: "Προνόμια",
                description: "Αποκλειστικές εκπτώσεις και προσφορές",
                color: "from-purple-400 to-purple-600"
              },
              {
                icon: MapPin,
                title: "Events",
                description: "Εκδηλώσεις στην περιοχή σου",
                color: "from-orange-400 to-red-500"
              }
            ].map((feature, i) => (
              <div key={i} className="group">
                <div className="h-full p-8 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-300 cursor-pointer">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-medium mb-3">{feature.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 font-light leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-extralight mb-6 tracking-tight">
            Γίνε μέλος της κοινότητας
          </h2>
          <p className="text-xl text-gray-500 dark:text-gray-400 font-light mb-12 max-w-2xl mx-auto">
            Χιλιάδες επαγγελματίες μάγειρες μοιράζονται ιδέες, εμπειρίες και ευκαιρίες.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              { number: "2,847", label: "Ενεργά μέλη" },
              { number: "156", label: "Πόλεις" },
              { number: "89", label: "Events μηνιαίως" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-extralight mb-2">{stat.number}</div>
                <div className="text-gray-500 dark:text-gray-400 font-light">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* User Testimonials */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {[
              {
                text: "Βρήκα την ομάδα μου και τώρα έχουμε το δικό μας εστιατόριο",
                author: "Μαρία Π.",
                role: "Sous Chef"
              },
              {
                text: "Τα σεμινάρια με βοήθησαν να αναπτύξω νέες τεχνικές",
                author: "Γιάννης Κ.",
                role: "Pastry Chef"
              }
            ].map((testimonial, i) => (
              <div key={i} className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-900">
                <p className="text-lg font-light italic mb-4">"{testimonial.text}"</p>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium">{testimonial.author}</span> · {testimonial.role}
                </div>
              </div>
            ))}
          </div>

          <Button size="lg" className="bg-gradient-to-r from-orange-400 to-red-500 text-white hover:from-orange-500 hover:to-red-600 rounded-full px-12 py-4 text-lg font-light">
            Ξεκίνα τη διαδρομή σου
            <Plus className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                <ChefHat className="h-3 w-3 text-white" />
              </div>
              <span className="font-light tracking-wide">kitchen</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
              <button className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                Όροι Χρήσης
              </button>
              <button className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                Απόρρητο
              </button>
              <button className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                Επικοινωνία
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};