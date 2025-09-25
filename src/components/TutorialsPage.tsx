import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Clock, Bookmark, ChefHat, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

const TutorialsPage = () => {
  const [tutorials, setTutorials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTutorials();
  }, []);

  const loadTutorials = async () => {
    try {
      const { data, error } = await supabase
        .from('tutorials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTutorials(data || []);
    } catch (error) {
      console.error('Error loading tutorials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  };

  const difficultyLabels = {
    beginner: 'Αρχάριος',
    intermediate: 'Μεσαίος',
    advanced: 'Προχωρημένος'
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Μαγειρικά Tutorials
          </h1>
          <p className="text-muted-foreground">
            Μάθετε βασικές τεχνικές και δεξιότητες μαγειρικής από επαγγελματίες
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutorials.map((tutorial) => (
            <Card key={tutorial.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <PlayCircle className="h-16 w-16 text-muted-foreground" />
              </div>
              
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg line-clamp-2">{tutorial.title}</CardTitle>
                  <Badge 
                    variant="secondary" 
                    className={difficultyColors[tutorial.difficulty as keyof typeof difficultyColors]}
                  >
                    {difficultyLabels[tutorial.difficulty as keyof typeof difficultyLabels]}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {tutorial.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{tutorial.duration} λεπτά</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ChefHat className="h-4 w-4" />
                    <span>{tutorial.category}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Button size="sm" className="flex-1 mr-2">
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Παρακολούθηση
                  </Button>
                  <Button size="sm" variant="outline">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {tutorials.length === 0 && (
          <Alert className="max-w-2xl mx-auto">
            <AlertDescription className="text-center py-4">
              <div className="text-4xl mb-4">📚</div>
              <p className="text-lg font-semibold mb-2">Σύντομα διαθέσιμα!</p>
              <p className="text-sm">
                Τα μαγειρικά tutorials θα είναι διαθέσιμα σύντομα
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Basic Tutorials Preview */}
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="text-center p-6">
            <div className="text-4xl mb-3">🔪</div>
            <h3 className="font-semibold mb-2">Βασικές Κοπές</h3>
            <p className="text-sm text-muted-foreground">Julienne, brunoise, chiffonade</p>
          </Card>
          
          <Card className="text-center p-6">
            <div className="text-4xl mb-3">🍳</div>
            <h3 className="font-semibold mb-2">Τεχνικές Μαγειρέματος</h3>
            <p className="text-sm text-muted-foreground">Sauté, braise, roast</p>
          </Card>
          
          <Card className="text-center p-6">
            <div className="text-4xl mb-3">🥄</div>
            <h3 className="font-semibold mb-2">Σάλτσες</h3>
            <p className="text-sm text-muted-foreground">Béchamel, hollandaise, demi-glace</p>
          </Card>
          
          <Card className="text-center p-6">
            <div className="text-4xl mb-3">🍰</div>
            <h3 className="font-semibold mb-2">Ζαχαροπλαστική</h3>
            <p className="text-sm text-muted-foreground">Κρέμες, ζύμες, διακόσμηση</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TutorialsPage;