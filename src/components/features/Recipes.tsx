import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChefHat, Star, Clock, Users, Plus, Lock, Euro } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: any[];
  instructions: any[];
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty_level: number;
  image_url: string;
  is_premium: boolean;
  price: number;
  author: {
    display_name: string;
    verification_status: string;
  };
}

export function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { user, subscription, profile } = useAuth();
  const { toast } = useToast();

  const [newRecipe, setNewRecipe] = useState({
    title: '',
    description: '',
    ingredients: '',
    instructions: '',
    prep_time: 0,
    cook_time: 0,
    servings: 1,
    difficulty_level: 1,
    is_premium: false,
    price: 0,
  });

  useEffect(() => {
    loadRecipes();
  }, [user]);

  const loadRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Προσθέτουμε mock author για τις συνταγές και διορθώνουμε τύπους
      const recipesWithAuthor = (data || []).map(recipe => ({
        ...recipe,
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
        instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
        prep_time: recipe.prep_time || 0,
        cook_time: recipe.cook_time || 0,
        servings: recipe.servings || 1,
        difficulty_level: recipe.difficulty_level || 1,
        price: recipe.price || 0,
        author: { display_name: 'Chef', verification_status: 'pending' }
      }));
      setRecipes(recipesWithAuthor);
    } catch (error) {
      console.error('Error loading recipes:', error);
      toast({
        title: 'Σφάλμα',
        description: 'Δεν μπόρεσαν να φορτωθούν οι συνταγές',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase.from('recipes').insert({
        author_id: user.id,
        title: newRecipe.title,
        description: newRecipe.description,
        ingredients: newRecipe.ingredients.split('\n').map(item => ({ item: item.trim() })),
        instructions: newRecipe.instructions.split('\n').map((step, index) => ({ 
          step: index + 1, 
          instruction: step.trim() 
        })),
        prep_time: newRecipe.prep_time,
        cook_time: newRecipe.cook_time,
        servings: newRecipe.servings,
        difficulty_level: newRecipe.difficulty_level,
        is_premium: newRecipe.is_premium,
        price: newRecipe.is_premium ? newRecipe.price : null,
      });

      if (error) throw error;

      toast({
        title: 'Επιτυχία!',
        description: 'Η συνταγή δημιουργήθηκε επιτυχώς.',
      });

      setIsCreateOpen(false);
      setNewRecipe({
        title: '',
        description: '',
        ingredients: '',
        instructions: '',
        prep_time: 0,
        cook_time: 0,
        servings: 1,
        difficulty_level: 1,
        is_premium: false,
        price: 0,
      });
      loadRecipes();
    } catch (error) {
      console.error('Error creating recipe:', error);
      toast({
        title: 'Σφάλμα',
        description: 'Δεν μπόρεσε να δημιουργηθεί η συνταγή',
        variant: 'destructive',
      });
    }
  };

  const canViewPremiumRecipe = (recipe: Recipe) => {
    return !recipe.is_premium || subscription?.subscribed;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Φόρτωση συνταγών...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Συνταγές</h2>
          <p className="text-muted-foreground">
            Ανακαλύψτε και μοιραστείτε καταπληκτικές συνταγές
          </p>
        </div>
        
        {user && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Νέα Συνταγή
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Δημιουργία Νέας Συνταγής</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateRecipe} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Τίτλος</Label>
                  <Input
                    id="title"
                    value={newRecipe.title}
                    onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Περιγραφή</Label>
                  <Textarea
                    id="description"
                    value={newRecipe.description}
                    onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prep_time">Χρόνος προετοιμασίας (λεπτά)</Label>
                    <Input
                      id="prep_time"
                      type="number"
                      value={newRecipe.prep_time}
                      onChange={(e) => setNewRecipe({ ...newRecipe, prep_time: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cook_time">Χρόνος μαγειρέματος (λεπτά)</Label>
                    <Input
                      id="cook_time"
                      type="number"
                      value={newRecipe.cook_time}
                      onChange={(e) => setNewRecipe({ ...newRecipe, cook_time: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="servings">Μερίδες</Label>
                    <Input
                      id="servings"
                      type="number"
                      value={newRecipe.servings}
                      onChange={(e) => setNewRecipe({ ...newRecipe, servings: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Δυσκολία</Label>
                    <Select 
                      value={newRecipe.difficulty_level.toString()} 
                      onValueChange={(value) => setNewRecipe({ ...newRecipe, difficulty_level: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Εύκολη</SelectItem>
                        <SelectItem value="2">Μέτρια</SelectItem>
                        <SelectItem value="3">Δύσκολη</SelectItem>
                        <SelectItem value="4">Προχωρημένη</SelectItem>
                        <SelectItem value="5">Επαγγελματική</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ingredients">Υλικά (ένα ανά γραμμή)</Label>
                  <Textarea
                    id="ingredients"
                    value={newRecipe.ingredients}
                    onChange={(e) => setNewRecipe({ ...newRecipe, ingredients: e.target.value })}
                    placeholder="π.χ.&#10;500γρ αλεύρι&#10;2 αυγά&#10;250ml γάλα"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instructions">Οδηγίες (ένα βήμα ανά γραμμή)</Label>
                  <Textarea
                    id="instructions"
                    value={newRecipe.instructions}
                    onChange={(e) => setNewRecipe({ ...newRecipe, instructions: e.target.value })}
                    placeholder="π.χ.&#10;Ζεστάνετε το φούρνο στους 180°C&#10;Ανακατέψτε τα υλικά&#10;Ψήστε για 30 λεπτά"
                    required
                  />
                </div>

                {subscription?.subscribed && (
                  <div className="space-y-4 p-4 border rounded-lg bg-accent/50">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_premium"
                        checked={newRecipe.is_premium}
                        onChange={(e) => setNewRecipe({ ...newRecipe, is_premium: e.target.checked })}
                      />
                      <Label htmlFor="is_premium">Premium συνταγή (προς πώληση)</Label>
                    </div>
                    
                    {newRecipe.is_premium && (
                      <div className="space-y-2">
                        <Label htmlFor="price">Τιμή (€)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={newRecipe.price}
                          onChange={(e) => setNewRecipe({ ...newRecipe, price: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    )}
                  </div>
                )}
                
                <Button type="submit" className="w-full">Δημιουργία Συνταγής</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <Card key={recipe.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="line-clamp-2">{recipe.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {recipe.description}
                  </CardDescription>
                </div>
                {recipe.is_premium && (
                  <div className="flex flex-col items-end space-y-1">
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <Lock className="h-3 w-3" />
                      <span>Premium</span>
                    </Badge>
                    {recipe.price > 0 && (
                      <Badge variant="outline" className="flex items-center space-x-1">
                        <Euro className="h-3 w-3" />
                        <span>{recipe.price}€</span>
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{recipe.prep_time + recipe.cook_time}λ</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{recipe.servings}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(recipe.difficulty_level)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-current text-yellow-500" />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ChefHat className="h-4 w-4" />
                  <span className="text-sm">{recipe.author?.display_name}</span>
                  {recipe.author?.verification_status === 'verified' && (
                    <Badge variant="outline" className="text-xs">Verified</Badge>
                  )}
                </div>
              </div>

              <Button 
                className="w-full" 
                variant={canViewPremiumRecipe(recipe) ? "default" : "outline"}
                disabled={!canViewPremiumRecipe(recipe)}
              >
                {canViewPremiumRecipe(recipe) ? "Δες τη συνταγή" : "Χρειάζεται συνδρομή"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {recipes.length === 0 && (
        <div className="text-center py-12">
          <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Δεν υπάρχουν συνταγές ακόμα</h3>
          <p className="text-muted-foreground mb-4">
            Γίνετε ο πρώτος που θα μοιραστεί μια συνταγή!
          </p>
          {user && (
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Προσθέστε τη δική σας
            </Button>
          )}
        </div>
      )}
    </div>
  );
}