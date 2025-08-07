import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Clock, Star, Lock, Book, ChefHat, Cut, Flame } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  content: any;
  category: string;
  difficulty_level: number;
  duration: number;
  video_url: string;
  is_free: boolean;
  author: {
    display_name: string;
    verification_status: string;
  };
}

const categories = [
  { id: 'all', name: 'Όλα', icon: Book },
  { id: 'knife-skills', name: 'Τεχνικές κοπής', icon: Cut },
  { id: 'basic-techniques', name: 'Βασικές τεχνικές', icon: ChefHat },
  { id: 'cooking-methods', name: 'Μέθοδοι μαγειρέματος', icon: Flame },
];

const freeTutorials = [
  {
    id: 'basic-knife-1',
    title: 'Βασικές τεχνικές κοπής - Brunoise',
    description: 'Μάθετε τη βασική τεχνική brunoise για τέλεια κομμένα λαχανικά',
    category: 'knife-skills',
    difficulty_level: 2,
    duration: 8,
    is_free: true,
    author: { display_name: 'Chef Demo', verification_status: 'verified' }
  },
  {
    id: 'basic-knife-2',
    title: 'Πώς να κρατάτε το μαχαίρι σωστά',
    description: 'Η σωστή λαβή του μαχαιριού για ασφάλεια και ακρίβεια',
    category: 'knife-skills',
    difficulty_level: 1,
    duration: 5,
    is_free: true,
    author: { display_name: 'Chef Demo', verification_status: 'verified' }
  },
  {
    id: 'basic-cook-1',
    title: 'Το σωστό sauté',
    description: 'Βασικές αρχές για το τέλειο sauté - θερμοκρασία και τεχνική',
    category: 'basic-techniques',
    difficulty_level: 2,
    duration: 12,
    is_free: true,
    author: { display_name: 'Chef Demo', verification_status: 'verified' }
  },
  {
    id: 'cooking-method-1',
    title: 'Braising - Η τέχνη του κοκκινιστού',
    description: 'Πώς να πετύχετε τέλεια κοκκινιστά με τη σωστή τεχνική braising',
    category: 'cooking-methods',
    difficulty_level: 3,
    duration: 15,
    is_free: true,
    author: { display_name: 'Chef Demo', verification_status: 'verified' }
  }
];

export function Tutorials() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { user, subscription } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadTutorials();
  }, [user]);

  const loadTutorials = async () => {
    try {
      // Προσθέτουμε τα δωρεάν tutorials πρώτα
      const demoTutorials = freeTutorials.map(tutorial => ({
        ...tutorial,
        content: {},
        video_url: '',
      })) as Tutorial[];

      // Προσπαθούμε να φορτώσουμε και τα database tutorials
      const { data: dbTutorials, error } = await supabase
        .from('tutorials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading tutorials from database:', error);
      }

      // Συνδυάζουμε όλα τα tutorials
      const allTutorials = [...demoTutorials, ...(dbTutorials || [])];
      setTutorials(allTutorials);
    } catch (error) {
      console.error('Error loading tutorials:', error);
      toast({
        title: 'Σφάλμα',
        description: 'Δεν μπόρεσαν να φορτωθούν τα tutorials',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const canViewTutorial = (tutorial: Tutorial) => {
    return tutorial.is_free || subscription?.subscribed;
  };

  const filteredTutorials = tutorials.filter(tutorial => 
    selectedCategory === 'all' || tutorial.category === selectedCategory
  );

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 2: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 3: return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 4: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 5: return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getDifficultyText = (level: number) => {
    switch (level) {
      case 1: return 'Αρχάριο';
      case 2: return 'Εύκολο';
      case 3: return 'Μέτριο';
      case 4: return 'Δύσκολο';
      case 5: return 'Επαγγελματικό';
      default: return 'Άγνωστο';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Φόρτωση tutorials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Tutorials & Τεχνικές</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Μάθετε βασικές και προχωρημένες μαγειρικές τεχνικές από επαγγελματίες chef
        </p>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid grid-cols-4 lg:w-auto lg:inline-flex lg:h-auto">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="flex items-center space-x-2"
              >
                <IconComponent className="h-4 w-4" />
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutorials.map((tutorial) => (
              <Card key={tutorial.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-2 text-lg">{tutorial.title}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-2">
                        {tutorial.description}
                      </CardDescription>
                    </div>
                    {!tutorial.is_free && (
                      <Badge variant="secondary" className="flex items-center space-x-1 ml-2">
                        <Lock className="h-3 w-3" />
                        <span>Premium</span>
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{tutorial.duration}λ</span>
                      </div>
                      
                      <Badge 
                        variant="outline" 
                        className={getDifficultyColor(tutorial.difficulty_level)}
                      >
                        {getDifficultyText(tutorial.difficulty_level)}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ChefHat className="h-4 w-4" />
                      <span className="text-sm">{tutorial.author?.display_name}</span>
                      {tutorial.author?.verification_status === 'verified' && (
                        <Badge variant="outline" className="text-xs">Verified</Badge>
                      )}
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    variant={canViewTutorial(tutorial) ? "default" : "outline"}
                    disabled={!canViewTutorial(tutorial)}
                  >
                    {canViewTutorial(tutorial) ? (
                      <div className="flex items-center space-x-2">
                        <Play className="h-4 w-4" />
                        <span>Παρακολούθηση</span>
                      </div>
                    ) : (
                      "Χρειάζεται συνδρομή"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTutorials.length === 0 && (
            <div className="text-center py-12">
              <Book className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Δεν υπάρχουν tutorials στην κατηγορία αυτή
              </h3>
              <p className="text-muted-foreground">
                Δοκιμάστε μια άλλη κατηγορία ή επιστρέψτε αργότερα για νέο περιεχόμενο.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {!subscription?.subscribed && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-primary" />
              <span>Αναβαθμίστε για περισσότερα</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Με τη συνδρομή Premium αποκτάτε πρόσβαση σε όλα τα προχωρημένα tutorials, 
              προσωπικές συμβουλές από verified chefs και αποκλειστικό περιεχόμενο.
            </p>
            <Button>Δείτε τα πλάνα συνδρομής</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}