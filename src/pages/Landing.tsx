import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, Calendar, BookOpen, Users, ArrowRight, Star, Zap, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12 animate-fade-in">
          <div className="h-16 w-16 md:h-20 md:w-20 bg-gradient-to-br from-primary to-primary-glow rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-warm">
            <ChefHat className="h-8 w-8 md:h-10 md:w-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent px-2">
            Καλώς ήρθατε στο SpreadIt
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 px-4">
            Η κοινότητα επαγγελματιών εστίασης για διαχείριση εργασίας, ανταλλαγή συνταγών και επαγγελματική ανάπτυξη
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center px-4 mb-8">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="w-full sm:w-auto animate-scale-in">
                Δημιουργία Λογαριασμού
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth?mode=login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Σύνδεση
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 md:mb-12 px-4 max-w-4xl mx-auto">
          <Card className="border-2 transition-all hover:border-primary/30">
            <CardHeader className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center shadow-warm">
                  <ChefHat className="h-5 w-5 text-primary-foreground" />
                </div>
                <CardTitle className="text-lg">Συνταγές</CardTitle>
              </div>
              <CardDescription className="text-sm">
                Επαγγελματικές συνταγές από συναδέλφους με λεπτομερείς οδηγίες
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 transition-all hover:border-primary/30">
            <CardHeader className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center shadow-warm">
                  <Calendar className="h-5 w-5 text-primary-foreground" />
                </div>
                <CardTitle className="text-lg">Διαχείριση Εργασίας</CardTitle>
              </div>
              <CardDescription className="text-sm">
                Καταγραφή ωρών και αυτόματος υπολογισμός μισθού σύμφωνα με τον Ελληνικό νόμο
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 transition-all hover:border-primary/30">
            <CardHeader className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center shadow-warm">
                  <BookOpen className="h-5 w-5 text-primary-foreground" />
                </div>
                <CardTitle className="text-lg">Tutorials</CardTitle>
              </div>
              <CardDescription className="text-sm">
                Μάθετε νέες τεχνικές και δεξιότητες από έμπειρους chefs
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 transition-all hover:border-primary/30">
            <CardHeader className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center shadow-warm">
                  <Users className="h-5 w-5 text-primary-foreground" />
                </div>
                <CardTitle className="text-lg">Κοινότητα</CardTitle>
              </div>
              <CardDescription className="text-sm">
                Events, networking και επαγγελματική ανάπτυξη
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 md:mb-12 px-4 max-w-5xl mx-auto">
          <div className="text-center space-y-3">
            <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center mx-auto shadow-warm">
              <Star className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Επαγγελματικό Δίκτυο</h3>
            <p className="text-sm text-muted-foreground">
              Συνδεθείτε με συναδέλφους και αναπτύξτε τη καριέρα σας
            </p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center mx-auto shadow-warm">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Εργαλεία Εργασίας</h3>
            <p className="text-sm text-muted-foreground">
              Αυτόματος υπολογισμός μισθού με Ελληνικό νομικό πλαίσιο
            </p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center mx-auto shadow-warm">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Ασφαλές & Αξιόπιστο</h3>
            <p className="text-sm text-muted-foreground">
              Τα δεδομένα σας προστατεύονται με σύγχρονες τεχνολογίες
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-primary/5 border-primary/20 mx-4 max-w-2xl mx-auto">
          <CardHeader className="text-center p-6">
            <CardTitle className="text-xl md:text-2xl mb-2">Έτοιμοι να ξεκινήσετε;</CardTitle>
            <CardDescription className="text-sm">
              Εγγραφείτε δωρεάν και αποκτήστε πρόσβαση σε όλα τα εργαλεία
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3 justify-center pb-6">
            <Link to="/auth?mode=signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full">
                Δημιουργία Λογαριασμού
              </Button>
            </Link>
            <Link to="/auth?mode=login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full">
                Έχω ήδη λογαριασμό
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Landing;
