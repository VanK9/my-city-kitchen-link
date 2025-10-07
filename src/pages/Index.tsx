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
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Καλώς ήρθατε στην Κοινότητα Επαγγελματιών Εστίασης
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Η ψηφιακή σας βάση για διαχείριση εργασίας, ανταλλαγή συνταγών, και επαγγελματική ανάπτυξη
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="animate-scale-in">
                Ξεκινήστε Τώρα
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="hover-scale border-2 transition-all">
            <CardHeader>
              <ChefHat className="h-12 w-12 mb-4 text-primary" />
              <CardTitle>Συνταγές</CardTitle>
              <CardDescription>
                Μοιραστείτε και ανακαλύψτε επαγγελματικές συνταγές από συναδέλφους
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-scale border-2 transition-all">
            <CardHeader>
              <Calendar className="h-12 w-12 mb-4 text-primary" />
              <CardTitle>Πρόγραμμα Εργασίας</CardTitle>
              <CardDescription>
                Διαχειριστείτε τις ώρες και τα συμβόλαια εργασίας σας εύκολα
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-scale border-2 transition-all">
            <CardHeader>
              <BookOpen className="h-12 w-12 mb-4 text-primary" />
              <CardTitle>Tutorials</CardTitle>
              <CardDescription>
                Μάθετε νέες τεχνικές και βελτιώστε τις δεξιότητές σας
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-scale border-2 transition-all">
            <CardHeader>
              <Users className="h-12 w-12 mb-4 text-primary" />
              <CardTitle>Κοινότητα</CardTitle>
              <CardDescription>
                Συνδεθείτε με επαγγελματίες και συμμετέχετε σε events
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-2">Έτοιμοι να ξεκινήσετε;</CardTitle>
            <CardDescription className="text-lg">
              Εγγραφείτε δωρεάν και αποκτήστε πρόσβαση σε όλα τα εργαλεία που χρειάζεστε
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
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
