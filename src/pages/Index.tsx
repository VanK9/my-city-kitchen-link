import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, Calendar, BookOpen, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const { user } = useAuth();

  // If user is logged in, show the full app with navigation
  if (user) {
    return <Layout />;
  }

  // Otherwise show landing page with app-style design
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent px-2">
            Κοινότητα Επαγγελματιών Εστίασης
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 px-4">
            Διαχείριση εργασίας, ανταλλαγή συνταγών και επαγγελματική ανάπτυξη
          </p>
          <div className="flex gap-3 justify-center px-4">
            <Link to="/auth">
              <Button size="lg" className="animate-scale-in">
                Ξεκινήστε Τώρα
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12 px-4">
          <Link to="/auth" className="block">
            <Card className="hover-scale border-2 transition-all hover:border-primary/30 h-full">
              <CardHeader className="p-4">
                <ChefHat className="h-8 w-8 mb-2 text-primary" />
                <CardTitle className="text-lg">Συνταγές</CardTitle>
                <CardDescription className="text-sm">
                  Επαγγελματικές συνταγές από συναδέλφους
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/auth" className="block">
            <Card className="hover-scale border-2 transition-all hover:border-primary/30 h-full">
              <CardHeader className="p-4">
                <Calendar className="h-8 w-8 mb-2 text-primary" />
                <CardTitle className="text-lg">Εργασία</CardTitle>
                <CardDescription className="text-sm">
                  Διαχείριση ωρών και αποδοχών
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/auth" className="block">
            <Card className="hover-scale border-2 transition-all hover:border-primary/30 h-full">
              <CardHeader className="p-4">
                <BookOpen className="h-8 w-8 mb-2 text-primary" />
                <CardTitle className="text-lg">Tutorials</CardTitle>
                <CardDescription className="text-sm">
                  Νέες τεχνικές και δεξιότητες
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/auth" className="block">
            <Card className="hover-scale border-2 transition-all hover:border-primary/30 h-full">
              <CardHeader className="p-4">
                <Users className="h-8 w-8 mb-2 text-primary" />
                <CardTitle className="text-lg">Κοινότητα</CardTitle>
                <CardDescription className="text-sm">
                  Events και networking
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* CTA Section */}
        <Card className="bg-primary/5 border-primary/20 mx-4">
          <CardHeader className="text-center p-6">
            <CardTitle className="text-2xl sm:text-3xl mb-2">Έτοιμοι να ξεκινήσετε;</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Εγγραφείτε δωρεάν και αποκτήστε πρόσβαση σε όλα τα εργαλεία
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <Link to="/auth">
              <Button size="lg" variant="default">
                Δημιουργία Λογαριασμού
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
