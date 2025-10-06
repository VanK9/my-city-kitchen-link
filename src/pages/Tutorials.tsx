import { Button } from "@/components/ui/button";
import { ChefHat, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import TutorialsPage from '@/components/TutorialsPage';

const Tutorials = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center">
                <ChefHat className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">SpreadIt</h1>
                <p className="text-xs text-muted-foreground">Κοινότητα Μαγείρων</p>
              </div>
            </div>
            
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Πίσω
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      <TutorialsPage />
    </div>
  );
};

export default Tutorials;
