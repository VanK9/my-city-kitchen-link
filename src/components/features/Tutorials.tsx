import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Clock, Star, Lock, Book, ChefHat, Scissors, Flame, Plus, Video, Save, Loader2 } from 'lucide-react';
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
  { id: 'knife-skills', name: 'Τεχνικές κοπής', icon: Scissors },
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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const { user, subscription, profile } = useAuth();
  const { toast } = useToast();

  const [newTutorial, setNewTutorial] = useState({
    title: '',
    description: '',
    category: 'basic-techniques',
    difficulty_level: 1,
    duration: 10,
    is_free: false,
    video_url: '',
    content: '',
  });

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

      // Φορτώνουμε DB tutorials με author info
      const { data: dbTutorials, error } = await supabase
        .from('tutorials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading tutorials from database:', error);
      }

      // Fetch author info for each tutorial
      const dbTutorialsWithAuthor = await Promise.all(
        (dbTutorials || []).map(async (tutorial) => {
          if (tutorial.author_id) {
            const { data: authorData } = await supabase
              .from('profiles')
              .select('display_name, verification_status')
              .eq('user_id', tutorial.author_id)
              .maybeSingle();
            
            return {
              ...tutorial,
              author: authorData || { display_name: 'Chef', verification_status: 'pending' }
            };
          }
          return {
            ...tutorial,
            author: { display_name: 'Chef', verification_status: 'pending' }
          };
        })
      );

      const allTutorials = [...demoTutorials, ...dbTutorialsWithAuthor];
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

  const handleCreateTutorial = async () => {
    if (!user) {
      toast({
        title: "Σφάλμα",
        description: "Πρέπει να συνδεθείτε για να δημιουργήσετε tutorial.",
        variant: "destructive",
      });
      return;
    }

    // Only verified users can create tutorials
    if (profile?.verification_status !== 'verified') {
      toast({
        title: "Σφάλμα",
        description: "Μόνο επαληθευμένοι χρήστες μπορούν να δημιουργήσουν tutorials.",
        variant: "destructive",
      });
      return;
    }

    try {
      const contentSteps = newTutorial.content.split('\n').filter(s => s.trim());
      
      const { error } = await supabase
        .from('tutorials')
        .insert({
          author_id: user.id,
          title: newTutorial.title,
          description: newTutorial.description,
          category: newTutorial.category,
          difficulty_level: newTutorial.difficulty_level,
          duration: newTutorial.duration,
          is_free: newTutorial.is_free,
          video_url: newTutorial.video_url || null,
          content: contentSteps,
        });

      if (error) throw error;

      toast({
        title: "Επιτυχία",
        description: "Το tutorial δημιουργήθηκε με επιτυχία!",
      });

      setIsCreateOpen(false);
      setNewTutorial({
        title: '',
        description: '',
        category: 'basic-techniques',
        difficulty_level: 1,
        duration: 10,
        is_free: false,
        video_url: '',
        content: '',
      });
      loadTutorials();
    } catch (error) {
      console.error('Error creating tutorial:', error);
      toast({
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η δημιουργία του tutorial.",
        variant: "destructive",
      });
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
      <div className="flex justify-between items-center mb-8">
        <div className="text-center flex-1">
          <h2 className="text-3xl font-bold mb-4">Tutorials & Τεχνικές</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Μάθετε βασικές και προχωρημένες μαγειρικές τεχνικές από επαγγελματίες chef
          </p>
        </div>
        
        {user && profile?.verification_status === 'verified' && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Νέο Tutorial
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Δημιουργία Νέου Tutorial</DialogTitle>
                <DialogDescription>
                  Μοιραστείτε τις γνώσεις σας με την κοινότητα
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Τίτλος</Label>
                  <Input
                    id="title"
                    value={newTutorial.title}
                    onChange={(e) => setNewTutorial({ ...newTutorial, title: e.target.value })}
                    placeholder="π.χ. Βασικές τεχνικές κοπής"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Περιγραφή</Label>
                  <Textarea
                    id="description"
                    value={newTutorial.description}
                    onChange={(e) => setNewTutorial({ ...newTutorial, description: e.target.value })}
                    placeholder="Μια σύντομη περιγραφή του tutorial"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Κατηγορία</Label>
                    <Select
                      value={newTutorial.category}
                      onValueChange={(value) => setNewTutorial({ ...newTutorial, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="knife-skills">Τεχνικές κοπής</SelectItem>
                        <SelectItem value="basic-techniques">Βασικές τεχνικές</SelectItem>
                        <SelectItem value="cooking-methods">Μέθοδοι μαγειρέματος</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="difficulty">Δυσκολία</Label>
                    <Select
                      value={newTutorial.difficulty_level.toString()}
                      onValueChange={(value) => setNewTutorial({ ...newTutorial, difficulty_level: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Αρχάριο</SelectItem>
                        <SelectItem value="2">Εύκολο</SelectItem>
                        <SelectItem value="3">Μέτριο</SelectItem>
                        <SelectItem value="4">Δύσκολο</SelectItem>
                        <SelectItem value="5">Επαγγελματικό</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Διάρκεια (λεπτά)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newTutorial.duration}
                      onChange={(e) => setNewTutorial({ ...newTutorial, duration: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="flex items-end">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_free"
                        checked={newTutorial.is_free}
                        onChange={(e) => setNewTutorial({ ...newTutorial, is_free: e.target.checked })}
                      />
                      <Label htmlFor="is_free">Δωρεάν Tutorial</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="video">Video URL (YouTube, Vimeo κλπ)</Label>
                  <Input
                    id="video"
                    value={newTutorial.video_url}
                    onChange={(e) => setNewTutorial({ ...newTutorial, video_url: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

                <div>
                  <Label htmlFor="content">Βήματα (ένα ανά γραμμή)</Label>
                  <Textarea
                    id="content"
                    value={newTutorial.content}
                    onChange={(e) => setNewTutorial({ ...newTutorial, content: e.target.value })}
                    placeholder="Βήμα 1: Κρατήστε το μαχαίρι σωστά&#10;Βήμα 2: Κόψτε τα λαχανικά με την σωστή τεχνική"
                    rows={8}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Ακύρωση
                </Button>
                <Button onClick={handleCreateTutorial}>
                  <Save className="h-4 w-4 mr-2" />
                  Δημιουργία Tutorial
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
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
                    onClick={() => canViewTutorial(tutorial) && setSelectedTutorial(tutorial)}
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

      {/* Tutorial Detail Dialog */}
      {selectedTutorial && (
        <Dialog open={!!selectedTutorial} onOpenChange={() => setSelectedTutorial(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedTutorial.title}</DialogTitle>
              <DialogDescription>{selectedTutorial.description}</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedTutorial.duration} λεπτά</span>
                  </div>
                  <Badge className={getDifficultyColor(selectedTutorial.difficulty_level)}>
                    {getDifficultyText(selectedTutorial.difficulty_level)}
                  </Badge>
                  {!selectedTutorial.is_free && (
                    <Badge variant="secondary">
                      <Lock className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <ChefHat className="h-4 w-4" />
                  <span className="text-sm">{selectedTutorial.author?.display_name}</span>
                  {selectedTutorial.author?.verification_status === 'verified' && (
                    <Badge variant="outline" className="text-xs">Verified</Badge>
                  )}
                </div>
              </div>

              {selectedTutorial.video_url && (
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Βίντεο Tutorial
                  </h3>
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    {selectedTutorial.video_url.includes('youtube.com') || selectedTutorial.video_url.includes('youtu.be') ? (
                      <iframe
                        className="w-full h-full"
                        src={selectedTutorial.video_url.replace('watch?v=', 'embed/')}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <a
                        href={selectedTutorial.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center h-full text-primary hover:underline"
                      >
                        Δείτε το βίντεο
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  Βήματα Tutorial
                </h3>
                <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                  <ol className="space-y-3">
                    {Array.isArray(selectedTutorial.content) ? (
                      selectedTutorial.content.map((step: any, i: number) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                            {i + 1}
                          </span>
                          <span className="flex-1">{typeof step === 'string' ? step : step.text || step}</span>
                        </li>
                      ))
                    ) : (
                      <p className="text-muted-foreground">Δεν υπάρχουν διαθέσιμα βήματα</p>
                    )}
                  </ol>
                </ScrollArea>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedTutorial(null)}>
                Κλείσιμο
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}