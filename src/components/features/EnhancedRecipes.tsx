import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Clock, 
  Users, 
  ChefHat, 
  Lock, 
  Plus, 
  Save, 
  Eye, 
  Upload, 
  Coins, 
  Globe,
  User,
  Star,
  Camera,
  X,
  Bookmark,
  BookmarkCheck,
  ShoppingCart,
  Loader2,
  Flame,
  Apple,
  Wheat,
  Salad
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Recipe {
  id: string;
  title: string;
  description: string | null;
  ingredients: any;
  instructions: any;
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
  difficulty_level: number | null;
  image_url: string | null;
  sharing_type: 'private' | 'public' | 'paid';
  spread_price: number;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fats: number | null;
  fiber: number | null;
  tags: string[] | null;
  cuisine_type: string | null;
  meal_type: string | null;
  dietary_info: string[] | null;
  tips: string | null;
  video_url: string | null;
  total_views: number;
  total_saves: number;
  rating: number;
  rating_count: number;
  author_id: string | null;
  created_at: string;
  author?: {
    display_name: string;
    avatar_url: string | null;
  };
  images?: RecipeImage[];
  is_saved?: boolean;
  is_purchased?: boolean;
}

interface RecipeImage {
  id: string;
  image_url: string;
  caption: string | null;
  is_primary: boolean;
  display_order: number;
}

interface UserSpreads {
  balance: number;
  total_earned: number;
  total_spent: number;
}

export const EnhancedRecipes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [userSpreads, setUserSpreads] = useState<UserSpreads | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [recipeImages, setRecipeImages] = useState<File[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'my' | 'public' | 'saved'>('all');
  
  const [newRecipe, setNewRecipe] = useState<{
    title: string;
    description: string;
    ingredients: string;
    instructions: string;
    prep_time: number;
    cook_time: number;
    servings: number;
    difficulty_level: number;
    sharing_type: 'private' | 'public' | 'paid';
    spread_price: number;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
    tags: string;
    cuisine_type: string;
    meal_type: string;
    dietary_info: string;
    tips: string;
    video_url: string;
  }>({
    title: '',
    description: '',
    ingredients: '',
    instructions: '',
    prep_time: 0,
    cook_time: 0,
    servings: 4,
    difficulty_level: 1,
    sharing_type: 'private',
    spread_price: 0,
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0,
    tags: '',
    cuisine_type: '',
    meal_type: '',
    dietary_info: '',
    tips: '',
    video_url: ''
  });

  useEffect(() => {
    loadRecipes();
    if (user) {
      loadUserSpreads();
    }
  }, [user, filterType]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('recipes')
        .select(`
          *,
          images:recipe_images(*)
        `);

      if (filterType === 'my' && user) {
        query = query.eq('author_id', user.id);
      } else if (filterType === 'public') {
        query = query.eq('sharing_type', 'public');
      } else if (filterType === 'saved' && user) {
        const { data: saves } = await supabase
          .from('recipe_saves')
          .select('recipe_id')
          .eq('user_id', user.id);
        
        if (saves) {
          const recipeIds = saves.map(s => s.recipe_id);
          query = query.in('id', recipeIds);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Check if recipes are saved or purchased by current user
      if (data && user) {
        const { data: saves } = await supabase
          .from('recipe_saves')
          .select('recipe_id')
          .eq('user_id', user.id);

        const { data: purchases } = await supabase
          .from('recipe_purchases')
          .select('recipe_id')
          .eq('buyer_id', user.id);

        const savedIds = saves?.map(s => s.recipe_id) || [];
        const purchasedIds = purchases?.map(p => p.recipe_id) || [];

      setRecipes(data.map(recipe => ({
        ...recipe,
        sharing_type: recipe.sharing_type as 'private' | 'public' | 'paid',
        is_saved: savedIds.includes(recipe.id),
        is_purchased: purchasedIds.includes(recipe.id)
      })));
    } else {
      setRecipes((data || []).map(recipe => ({
        ...recipe,
        sharing_type: recipe.sharing_type as 'private' | 'public' | 'paid'
      })));
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
      toast({
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η φόρτωση των συνταγών.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserSpreads = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_spreads')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Create spreads account for user
        const { data: newSpreads, error: createError } = await supabase
          .from('user_spreads')
          .insert({ user_id: user.id, balance: 100 }) // Start with 100 spreads
          .select()
          .single();

        if (createError) throw createError;
        setUserSpreads(newSpreads);
      } else {
        setUserSpreads(data);
      }
    } catch (error) {
      console.error('Error loading spreads:', error);
    }
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return;
    
    const newImages = Array.from(files);
    setRecipeImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setRecipeImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadRecipeImages = async (recipeId: string) => {
    const uploadedImages = [];

    for (let i = 0; i < recipeImages.length; i++) {
      const file = recipeImages[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${recipeId}/${Date.now()}_${i}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('recipe-images')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading image:', error);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('recipe-images')
        .getPublicUrl(fileName);

      uploadedImages.push({
        recipe_id: recipeId,
        image_url: urlData.publicUrl,
        is_primary: i === 0,
        display_order: i
      });
    }

    if (uploadedImages.length > 0) {
      await supabase
        .from('recipe_images')
        .insert(uploadedImages);
    }
  };

  const handleCreateRecipe = async () => {
    if (!user) {
      toast({
        title: "Σφάλμα",
        description: "Πρέπει να συνδεθείτε για να δημιουργήσετε συνταγή.",
        variant: "destructive",
      });
      return;
    }

    try {
      const ingredients = newRecipe.ingredients.split('\n').filter(i => i.trim());
      const instructions = newRecipe.instructions.split('\n').filter(i => i.trim());
      const tags = newRecipe.tags.split(',').map(t => t.trim()).filter(t => t);
      const dietary_info = newRecipe.dietary_info.split(',').map(d => d.trim()).filter(d => d);

      const { data, error } = await supabase
        .from('recipes')
        .insert({
          ...newRecipe,
          ingredients,
          instructions,
          tags: tags.length > 0 ? tags : null,
          dietary_info: dietary_info.length > 0 ? dietary_info : null,
          author_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Upload images if any
      if (recipeImages.length > 0) {
        await uploadRecipeImages(data.id);
      }

      toast({
        title: "Επιτυχία",
        description: "Η συνταγή δημιουργήθηκε με επιτυχία!",
      });

      setIsCreateOpen(false);
      setRecipeImages([]);
      setNewRecipe({
        title: '',
        description: '',
        ingredients: '',
        instructions: '',
        prep_time: 0,
        cook_time: 0,
        servings: 4,
        difficulty_level: 1,
        sharing_type: 'private',
        spread_price: 0,
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        fiber: 0,
        tags: '',
        cuisine_type: '',
        meal_type: '',
        dietary_info: '',
        tips: '',
        video_url: ''
      });
      loadRecipes();
    } catch (error) {
      console.error('Error creating recipe:', error);
      toast({
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η δημιουργία της συνταγής.",
        variant: "destructive",
      });
    }
  };

  const handleSaveRecipe = async (recipeId: string) => {
    if (!user) {
      toast({
        title: "Σφάλμα",
        description: "Πρέπει να συνδεθείτε για να αποθηκεύσετε συνταγές.",
        variant: "destructive",
      });
      return;
    }

    try {
      const recipe = recipes.find(r => r.id === recipeId);
      
      if (recipe?.is_saved) {
        // Unsave
        await supabase
          .from('recipe_saves')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', recipeId);

        toast({
          title: "Αφαιρέθηκε",
          description: "Η συνταγή αφαιρέθηκε από τις αποθηκευμένες.",
        });
      } else {
        // Save
        await supabase
          .from('recipe_saves')
          .insert({
            user_id: user.id,
            recipe_id: recipeId
          });

        toast({
          title: "Αποθηκεύτηκε",
          description: "Η συνταγή προστέθηκε στις αποθηκευμένες.",
        });
      }

      loadRecipes();
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast({
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η αποθήκευση της συνταγής.",
        variant: "destructive",
      });
    }
  };

  const handlePurchaseRecipe = async (recipe: Recipe) => {
    if (!user) {
      toast({
        title: "Σφάλμα",
        description: "Πρέπει να συνδεθείτε για να αγοράσετε συνταγές.",
        variant: "destructive",
      });
      return;
    }

    if (!userSpreads || userSpreads.balance < recipe.spread_price) {
      toast({
        title: "Ανεπαρκές υπόλοιπο",
        description: `Χρειάζεστε ${recipe.spread_price} spreads. Υπόλοιπο: ${userSpreads?.balance || 0}`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Create purchase record
      await supabase
        .from('recipe_purchases')
        .insert({
          buyer_id: user.id,
          recipe_id: recipe.id,
          spread_amount: recipe.spread_price
        });

      // Update user balance
      await supabase
        .from('user_spreads')
        .update({
          balance: userSpreads.balance - recipe.spread_price,
          total_spent: userSpreads.total_spent + recipe.spread_price
        })
        .eq('user_id', user.id);

      // Update author balance
      if (recipe.author_id) {
        const { data: authorSpreads } = await supabase
          .from('user_spreads')
          .select('*')
          .eq('user_id', recipe.author_id)
          .single();

        if (authorSpreads) {
          await supabase
            .from('user_spreads')
            .update({
              balance: authorSpreads.balance + recipe.spread_price,
              total_earned: authorSpreads.total_earned + recipe.spread_price
            })
            .eq('user_id', recipe.author_id);
        }
      }

      toast({
        title: "Επιτυχής αγορά",
        description: `Αγοράσατε τη συνταγή με ${recipe.spread_price} spreads!`,
      });

      loadRecipes();
      loadUserSpreads();
    } catch (error) {
      console.error('Error purchasing recipe:', error);
      toast({
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η αγορά της συνταγής.",
        variant: "destructive",
      });
    }
  };

  const getDifficultyLabel = (level: number) => {
    const labels = ['Εύκολη', 'Μέτρια', 'Δύσκολη', 'Πολύ Δύσκολη', 'Master Chef'];
    return labels[level - 1] || 'Άγνωστη';
  };

  const getDifficultyColor = (level: number) => {
    const colors = ['text-green-600', 'text-yellow-600', 'text-orange-600', 'text-red-600', 'text-purple-600'];
    return colors[level - 1] || 'text-gray-600';
  };

  const getSharingIcon = (type: string) => {
    switch (type) {
      case 'public': return <Globe className="h-4 w-4" />;
      case 'paid': return <Coins className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getNutritionIcon = (type: string) => {
    switch (type) {
      case 'calories': return <Flame className="h-4 w-4" />;
      case 'protein': return <Apple className="h-4 w-4" />;
      case 'carbs': return <Wheat className="h-4 w-4" />;
      default: return <Salad className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Συνταγές</h2>
          <p className="text-muted-foreground">
            Ανακαλύψτε και μοιραστείτε υπέροχες συνταγές
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {user && userSpreads && (
            <Badge variant="secondary" className="px-3 py-1">
              <Coins className="h-4 w-4 mr-1" />
              {userSpreads.balance} spreads
            </Badge>
          )}
          
          {user && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Νέα Συνταγή
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Δημιουργία Νέας Συνταγής</DialogTitle>
                  <DialogDescription>
                    Προσθέστε μια νέα συνταγή με φωτογραφίες και διατροφικές πληροφορίες
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Βασικά</TabsTrigger>
                    <TabsTrigger value="nutrition">Διατροφή</TabsTrigger>
                    <TabsTrigger value="media">Πολυμέσα</TabsTrigger>
                    <TabsTrigger value="sharing">Κοινοποίηση</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div>
                      <Label htmlFor="title">Τίτλος</Label>
                      <Input
                        id="title"
                        value={newRecipe.title}
                        onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value })}
                        placeholder="π.χ. Μουσακάς"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Περιγραφή</Label>
                      <Textarea
                        id="description"
                        value={newRecipe.description}
                        onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
                        placeholder="Μια σύντομη περιγραφή της συνταγής"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cuisine">Κουζίνα</Label>
                        <Input
                          id="cuisine"
                          value={newRecipe.cuisine_type}
                          onChange={(e) => setNewRecipe({ ...newRecipe, cuisine_type: e.target.value })}
                          placeholder="π.χ. Ελληνική"
                        />
                      </div>

                      <div>
                        <Label htmlFor="meal">Τύπος Γεύματος</Label>
                        <Input
                          id="meal"
                          value={newRecipe.meal_type}
                          onChange={(e) => setNewRecipe({ ...newRecipe, meal_type: e.target.value })}
                          placeholder="π.χ. Κυρίως Πιάτο"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="ingredients">Υλικά (ένα ανά γραμμή)</Label>
                      <Textarea
                        id="ingredients"
                        value={newRecipe.ingredients}
                        onChange={(e) => setNewRecipe({ ...newRecipe, ingredients: e.target.value })}
                        placeholder="500γρ κιμά&#10;3 μελιτζάνες&#10;2 κρεμμύδια"
                        rows={5}
                      />
                    </div>

                    <div>
                      <Label htmlFor="instructions">Οδηγίες (μία ανά γραμμή)</Label>
                      <Textarea
                        id="instructions"
                        value={newRecipe.instructions}
                        onChange={(e) => setNewRecipe({ ...newRecipe, instructions: e.target.value })}
                        placeholder="Κόβουμε τις μελιτζάνες σε ροδέλες&#10;Τις αλατίζουμε και τις αφήνουμε για 30 λεπτά"
                        rows={5}
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="prep">Προετοιμασία (λεπτά)</Label>
                        <Input
                          id="prep"
                          type="number"
                          value={newRecipe.prep_time}
                          onChange={(e) => setNewRecipe({ ...newRecipe, prep_time: parseInt(e.target.value) })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="cook">Μαγείρεμα (λεπτά)</Label>
                        <Input
                          id="cook"
                          type="number"
                          value={newRecipe.cook_time}
                          onChange={(e) => setNewRecipe({ ...newRecipe, cook_time: parseInt(e.target.value) })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="servings">Μερίδες</Label>
                        <Input
                          id="servings"
                          type="number"
                          value={newRecipe.servings}
                          onChange={(e) => setNewRecipe({ ...newRecipe, servings: parseInt(e.target.value) })}
                        />
                      </div>

                      <div>
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
                            <SelectItem value="4">Πολύ Δύσκολη</SelectItem>
                            <SelectItem value="5">Master Chef</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="tips">Συμβουλές</Label>
                      <Textarea
                        id="tips"
                        value={newRecipe.tips}
                        onChange={(e) => setNewRecipe({ ...newRecipe, tips: e.target.value })}
                        placeholder="Προσθέστε χρήσιμες συμβουλές για την επιτυχία της συνταγής"
                      />
                    </div>

                    <div>
                      <Label htmlFor="tags">Ετικέτες (χωρισμένες με κόμμα)</Label>
                      <Input
                        id="tags"
                        value={newRecipe.tags}
                        onChange={(e) => setNewRecipe({ ...newRecipe, tags: e.target.value })}
                        placeholder="χορτοφαγικό, νηστίσιμο, γλυκό"
                      />
                    </div>

                    <div>
                      <Label htmlFor="dietary">Διατροφικές Πληροφορίες (χωρισμένες με κόμμα)</Label>
                      <Input
                        id="dietary"
                        value={newRecipe.dietary_info}
                        onChange={(e) => setNewRecipe({ ...newRecipe, dietary_info: e.target.value })}
                        placeholder="χωρίς γλουτένη, vegan, keto"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="nutrition" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="calories">Θερμίδες (ανά μερίδα)</Label>
                        <Input
                          id="calories"
                          type="number"
                          value={newRecipe.calories}
                          onChange={(e) => setNewRecipe({ ...newRecipe, calories: parseInt(e.target.value) })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="protein">Πρωτεΐνες (γρ)</Label>
                        <Input
                          id="protein"
                          type="number"
                          value={newRecipe.protein}
                          onChange={(e) => setNewRecipe({ ...newRecipe, protein: parseFloat(e.target.value) })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="carbs">Υδατάνθρακες (γρ)</Label>
                        <Input
                          id="carbs"
                          type="number"
                          value={newRecipe.carbs}
                          onChange={(e) => setNewRecipe({ ...newRecipe, carbs: parseFloat(e.target.value) })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="fats">Λιπαρά (γρ)</Label>
                        <Input
                          id="fats"
                          type="number"
                          value={newRecipe.fats}
                          onChange={(e) => setNewRecipe({ ...newRecipe, fats: parseFloat(e.target.value) })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="fiber">Φυτικές Ίνες (γρ)</Label>
                        <Input
                          id="fiber"
                          type="number"
                          value={newRecipe.fiber}
                          onChange={(e) => setNewRecipe({ ...newRecipe, fiber: parseFloat(e.target.value) })}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="media" className="space-y-4">
                    <div>
                      <Label htmlFor="images">Φωτογραφίες</Label>
                      <div className="space-y-4">
                        <Input
                          id="images"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleImageUpload(e.target.files)}
                        />
                        
                        {recipeImages.length > 0 && (
                          <div className="grid grid-cols-3 gap-2">
                            {recipeImages.map((file, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-md"
                                />
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="absolute top-1 right-1"
                                  onClick={() => removeImage(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="video">Video URL (YouTube, etc.)</Label>
                      <Input
                        id="video"
                        value={newRecipe.video_url}
                        onChange={(e) => setNewRecipe({ ...newRecipe, video_url: e.target.value })}
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="sharing" className="space-y-4">
                    <div>
                      <Label htmlFor="sharing">Τύπος Κοινοποίησης</Label>
                      <Select
                        value={newRecipe.sharing_type}
                        onValueChange={(value: 'private' | 'public' | 'paid') => 
                          setNewRecipe({ ...newRecipe, sharing_type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="private">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2" />
                              Προσωπική Χρήση
                            </div>
                          </SelectItem>
                          <SelectItem value="public">
                            <div className="flex items-center">
                              <Globe className="h-4 w-4 mr-2" />
                              Δημόσια
                            </div>
                          </SelectItem>
                          <SelectItem value="paid">
                            <div className="flex items-center">
                              <Coins className="h-4 w-4 mr-2" />
                              Επί Πληρωμή
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {newRecipe.sharing_type === 'paid' && (
                      <div>
                        <Label htmlFor="price">Τιμή σε Spreads (10 spreads = 1€)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={newRecipe.spread_price}
                          onChange={(e) => setNewRecipe({ ...newRecipe, spread_price: parseInt(e.target.value) })}
                          min={1}
                        />
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Ακύρωση
                  </Button>
                  <Button onClick={handleCreateRecipe}>
                    <Save className="h-4 w-4 mr-2" />
                    Αποθήκευση Συνταγής
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Tabs value={filterType} onValueChange={(value: any) => setFilterType(value)}>
        <TabsList>
          <TabsTrigger value="all">Όλες</TabsTrigger>
          <TabsTrigger value="public">Δημόσιες</TabsTrigger>
          {user && (
            <>
              <TabsTrigger value="my">Οι Συνταγές μου</TabsTrigger>
              <TabsTrigger value="saved">Αποθηκευμένες</TabsTrigger>
            </>
          )}
        </TabsList>
      </Tabs>

      {recipes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Δεν βρέθηκαν συνταγές
            </p>
            {user && (
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Προσθέστε την Πρώτη Συνταγή
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="overflow-hidden">
              {recipe.images && recipe.images.length > 0 ? (
                <div className="relative h-48">
                  <img
                    src={recipe.images.find(img => img.is_primary)?.image_url || recipe.images[0].image_url}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                  {recipe.images.length > 1 && (
                    <Badge className="absolute top-2 right-2">
                      <Camera className="h-3 w-3 mr-1" />
                      {recipe.images.length}
                    </Badge>
                  )}
                </div>
              ) : recipe.image_url ? (
                <img
                  src={recipe.image_url}
                  alt={recipe.title}
                  className="h-48 w-full object-cover"
                />
              ) : (
                <div className="h-48 bg-muted flex items-center justify-center">
                  <ChefHat className="h-12 w-12 text-muted-foreground" />
                </div>
              )}

              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="line-clamp-1">{recipe.title}</CardTitle>
                  <Badge variant="outline">
                    {getSharingIcon(recipe.sharing_type)}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {recipe.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {recipe.cuisine_type && (
                    <Badge variant="secondary">{recipe.cuisine_type}</Badge>
                  )}
                  {recipe.meal_type && (
                    <Badge variant="secondary">{recipe.meal_type}</Badge>
                  )}
                  {recipe.dietary_info && recipe.dietary_info.map((info, i) => (
                    <Badge key={i} variant="outline">{info}</Badge>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                    {(recipe.prep_time || 0) + (recipe.cook_time || 0)} λεπτά
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                    {recipe.servings} μερίδες
                  </div>
                  <div className="flex items-center">
                    <ChefHat className={`h-4 w-4 mr-1 ${getDifficultyColor(recipe.difficulty_level || 1)}`} />
                    {getDifficultyLabel(recipe.difficulty_level || 1)}
                  </div>
                </div>

                {recipe.calories && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center">
                      <Flame className="h-3 w-3 mr-1 text-orange-500" />
                      {recipe.calories} θερμίδες
                    </div>
                    {recipe.protein && (
                      <div className="flex items-center">
                        <Apple className="h-3 w-3 mr-1 text-red-500" />
                        {recipe.protein}γρ πρωτεΐνη
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1 text-muted-foreground" />
                      {recipe.total_views}
                    </div>
                    <div className="flex items-center">
                      <Bookmark className="h-4 w-4 mr-1 text-muted-foreground" />
                      {recipe.total_saves}
                    </div>
                    {recipe.rating > 0 && (
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1 text-yellow-500" />
                        {recipe.rating.toFixed(1)}
                      </div>
                    )}
                  </div>
                  {recipe.sharing_type === 'paid' && !recipe.is_purchased && (
                    <Badge variant="secondary">
                      <Coins className="h-3 w-3 mr-1" />
                      {recipe.spread_price}
                    </Badge>
                  )}
                </div>

                {recipe.author && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                    {recipe.author.avatar_url && (
                      <img
                        src={recipe.author.avatar_url}
                        alt={recipe.author.display_name}
                        className="h-6 w-6 rounded-full"
                      />
                    )}
                    <span>από {recipe.author.display_name}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {user && (
                    <Button
                      size="sm"
                      variant={recipe.is_saved ? "secondary" : "outline"}
                      onClick={() => handleSaveRecipe(recipe.id)}
                    >
                      {recipe.is_saved ? (
                        <>
                          <BookmarkCheck className="h-4 w-4 mr-1" />
                          Αποθηκευμένη
                        </>
                      ) : (
                        <>
                          <Bookmark className="h-4 w-4 mr-1" />
                          Αποθήκευση
                        </>
                      )}
                    </Button>
                  )}

                  {recipe.sharing_type === 'paid' && !recipe.is_purchased && recipe.author_id !== user?.id ? (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handlePurchaseRecipe(recipe)}
                      disabled={!user}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Αγορά ({recipe.spread_price} spreads)
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => setSelectedRecipe(recipe)}
                      disabled={recipe.sharing_type === 'private' && recipe.author_id !== user?.id}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Προβολή
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};