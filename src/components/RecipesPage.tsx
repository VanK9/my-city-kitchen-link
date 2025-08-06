import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Heart, Star, Euro, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const RecipesPage = () => {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [newRecipe, setNewRecipe] = useState({
    title: '',
    description: '',
    ingredients: '',
    instructions: '',
    prep_time: '',
    cook_time: '',
    servings: '',
    price: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadRecipes();
    loadUserProfile();
  }, []);

  const loadRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          profiles (display_name, verified_chef)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipes(data || []);
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setUserProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSubmitRecipe = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Απαιτείται σύνδεση",
          description: "Παρακαλώ συνδεθείτε για να υποβάλετε συνταγή",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('recipes')
        .insert({
          ...newRecipe,
          user_id: user.id,
          prep_time: parseInt(newRecipe.prep_time),
          cook_time: parseInt(newRecipe.cook_time),
          servings: parseInt(newRecipe.servings),
          price: newRecipe.price ? parseFloat(newRecipe.price) : null
        });

      if (error) throw error;

      toast({
        title: "Επιτυχής υποβολή!",
        description: "Η συνταγή σας υποβλήθηκε για έγκριση",
      });

      setNewRecipe({
        title: '',
        description: '',
        ingredients: '',
        instructions: '',
        prep_time: '',
        cook_time: '',
        servings: '',
        price: ''
      });

      loadRecipes();
    } catch (error) {
      console.error('Error submitting recipe:', error);
      toast({
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η υποβολή της συνταγής",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="p-6">Φόρτωση συνταγών...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Συνταγές
            </h1>
            <p className="text-muted-foreground">
              Ανακαλύψτε και μοιραστείτε αυθεντικές συνταγές από επαγγελματίες μάγειρες
            </p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Νέα Συνταγή
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Προσθήκη Νέας Συνταγής</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Τίτλος</label>
                  <Input
                    value={newRecipe.title}
                    onChange={(e) => setNewRecipe({...newRecipe, title: e.target.value})}
                    placeholder="π.χ. Παραδοσιακή Μουσακά"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Περιγραφή</label>
                  <Textarea
                    value={newRecipe.description}
                    onChange={(e) => setNewRecipe({...newRecipe, description: e.target.value})}
                    placeholder="Σύντομη περιγραφή της συνταγής..."
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Προετοιμασία (λεπτά)</label>
                    <Input
                      type="number"
                      value={newRecipe.prep_time}
                      onChange={(e) => setNewRecipe({...newRecipe, prep_time: e.target.value})}
                      placeholder="30"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Μαγείρεμα (λεπτά)</label>
                    <Input
                      type="number"
                      value={newRecipe.cook_time}
                      onChange={(e) => setNewRecipe({...newRecipe, cook_time: e.target.value})}
                      placeholder="60"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Μερίδες</label>
                    <Input
                      type="number"
                      value={newRecipe.servings}
                      onChange={(e) => setNewRecipe({...newRecipe, servings: e.target.value})}
                      placeholder="4"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Υλικά</label>
                  <Textarea
                    value={newRecipe.ingredients}
                    onChange={(e) => setNewRecipe({...newRecipe, ingredients: e.target.value})}
                    placeholder="Αναφέρετε τα υλικά, ένα ανά γραμμή..."
                    rows={6}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Οδηγίες Εκτέλεσης</label>
                  <Textarea
                    value={newRecipe.instructions}
                    onChange={(e) => setNewRecipe({...newRecipe, instructions: e.target.value})}
                    placeholder="Αναλυτικές οδηγίες προετοιμασίας..."
                    rows={8}
                  />
                </div>

                {userProfile?.verified_chef && (
                  <div>
                    <label className="text-sm font-medium">Τιμή (€) - Προαιρετικό</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newRecipe.price}
                      onChange={(e) => setNewRecipe({...newRecipe, price: e.target.value})}
                      placeholder="9.99"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Μόνο verified chefs μπορούν να πουλήσουν συνταγές
                    </p>
                  </div>
                )}

                <Button onClick={handleSubmitRecipe} className="w-full">
                  Υποβολή Συνταγής
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                <Camera className="h-12 w-12 text-muted-foreground" />
              </div>
              
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">{recipe.title}</CardTitle>
                  {recipe.price && (
                    <Badge variant="secondary" className="gap-1">
                      <Euro className="h-3 w-3" />
                      {recipe.price}
                    </Badge>
                  )}
                </div>
                <CardDescription className="line-clamp-2">
                  {recipe.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <span>⏱️ {recipe.prep_time + recipe.cook_time} λεπτά</span>
                  <span>👥 {recipe.servings} μερίδες</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{recipe.profiles?.display_name}</span>
                    {recipe.profiles?.verified_chef && (
                      <Badge variant="outline" className="text-xs">Verified</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Star className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {recipes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Δεν υπάρχουν συνταγές ακόμα.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Γίνετε ο πρώτος που θα μοιραστεί μια συνταγή!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipesPage;