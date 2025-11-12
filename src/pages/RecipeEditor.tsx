import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, X, Plus, Upload } from 'lucide-react';
import Navigation from '@/components/Navigation';

const PREDEFINED_TAGS = [
  'Γρήγορο', 'Εύκολο', 'Υγιεινό', 'Χορτοφαγικό', 'Vegan',
  'Χωρίς Γλουτένη', 'Χαμηλές Θερμίδες', 'Πρωτεϊνικό', 'Παιδικό',
  'Γλυκό', 'Αλμυρό', 'Ζύμες', 'Σαλάτες', 'Σούπες',
  'Κρέας', 'Ψάρι', 'Θαλασσινά', 'Ζυμαρικά', 'Ρύζι',
  'Επιδόρπιο', 'Πρωινό', 'Μεσημεριανό', 'Βραδινό', 'Σνακ'
];

const RecipeEditor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [prepTime, setPrepTime] = useState(0);
  const [cookTime, setCookTime] = useState(0);
  const [servings, setServings] = useState(1);
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  const [sharingType, setSharingType] = useState('public');
  const [spreadPrice, setSpreadPrice] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  
  const [instructionInput, setInstructionInput] = useState('');
  const [instructions, setInstructions] = useState<string[]>([]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    setUploadingImage(true);

    const { error: uploadError } = await supabase.storage
      .from('recipe-images')
      .upload(fileName, file);

    if (uploadError) {
      toast.error('Σφάλμα κατά το ανέβασμα εικόνας');
      setUploadingImage(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('recipe-images')
      .getPublicUrl(fileName);

    setImageUrl(publicUrl);
    setUploadingImage(false);
    toast.success('Η εικόνα ανέβηκε επιτυχώς!');
  };

  const addIngredient = () => {
    if (ingredientInput.trim()) {
      setIngredients([...ingredients, ingredientInput.trim()]);
      setIngredientInput('');
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addInstruction = () => {
    if (instructionInput.trim()) {
      setInstructions([...instructions, instructionInput.trim()]);
      setInstructionInput('');
    }
  };

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async () => {
    if (!user || !title || ingredients.length === 0 || instructions.length === 0) {
      toast.error('Συμπληρώστε τα υποχρεωτικά πεδία');
      return;
    }

    setIsLoading(true);

    const { error } = await supabase
      .from('recipes')
      .insert({
        author_id: user.id,
        title,
        description,
        image_url: imageUrl || null,
        ingredients: ingredients.map((ing, i) => ({ id: i + 1, text: ing })),
        instructions: instructions.map((inst, i) => ({ step: i + 1, text: inst })),
        prep_time: prepTime,
        cook_time: cookTime,
        servings,
        difficulty_level: difficultyLevel,
        sharing_type: sharingType,
        spread_price: sharingType === 'paid' ? spreadPrice : 0,
        tags: selectedTags
      });

    setIsLoading(false);

    if (error) {
      toast.error('Σφάλμα κατά τη δημιουργία συνταγής');
      console.error('Recipe creation error:', error);
    } else {
      toast.success('Η συνταγή δημιουργήθηκε επιτυχώς!');
      navigate('/recipes');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Navigation currentSection="" onSectionChange={() => {}} />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                Πρέπει να συνδεθείτε για να δημιουργήσετε συνταγή
              </p>
              <Button onClick={() => navigate('/auth')}>Σύνδεση</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navigation currentSection="" onSectionChange={() => {}} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Πίσω
          </Button>
          <h1 className="text-3xl font-bold">Νέα Συνταγή</h1>
          <p className="text-muted-foreground mt-2">
            Μοιραστείτε τη συνταγή σας με την κοινότητα
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Βασικές Πληροφορίες</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Τίτλος *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="π.χ. Μουσακάς Παραδοσιακός"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Περιγραφή</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Μια σύντομη περιγραφή της συνταγής..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Εικόνα</Label>
                {imageUrl && (
                  <img src={imageUrl} alt="Recipe" className="w-full h-48 object-cover rounded-lg mb-2" />
                )}
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <div className="flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-muted/50 transition-colors">
                    <Upload className="h-5 w-5" />
                    <span>{uploadingImage ? 'Ανέβασμα...' : imageUrl ? 'Αλλαγή Εικόνας' : 'Προσθήκη Εικόνας'}</span>
                  </div>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </Label>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prepTime">Προετοιμασία (λεπτά)</Label>
                  <Input
                    id="prepTime"
                    type="number"
                    value={prepTime}
                    onChange={(e) => setPrepTime(parseInt(e.target.value))}
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cookTime">Μαγείρεμα (λεπτά)</Label>
                  <Input
                    id="cookTime"
                    type="number"
                    value={cookTime}
                    onChange={(e) => setCookTime(parseInt(e.target.value))}
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="servings">Μερίδες</Label>
                  <Input
                    id="servings"
                    type="number"
                    value={servings}
                    onChange={(e) => setServings(parseInt(e.target.value))}
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Δυσκολία</Label>
                  <Select 
                    value={difficultyLevel.toString()} 
                    onValueChange={(v) => setDifficultyLevel(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Εύκολο</SelectItem>
                      <SelectItem value="2">Μέτριο</SelectItem>
                      <SelectItem value="3">Δύσκολο</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>Επιλέξτε tags για εύκολη αναζήτηση</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_TAGS.map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Υλικά *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={ingredientInput}
                  onChange={(e) => setIngredientInput(e.target.value)}
                  placeholder="π.χ. 500γρ κιμάς μοσχαρίσιος"
                  onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                />
                <Button onClick={addIngredient} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {ingredients.map((ing, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                    <span className="flex-1">{ing}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeIngredient(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Οδηγίες *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Textarea
                  value={instructionInput}
                  onChange={(e) => setInstructionInput(e.target.value)}
                  placeholder="Προσθέστε ένα βήμα..."
                  rows={2}
                />
                <Button onClick={addInstruction} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {instructions.map((inst, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                    <span className="font-bold text-primary min-w-[2rem]">{index + 1}.</span>
                    <span className="flex-1">{inst}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeInstruction(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Διαθεσιμότητα</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sharing">Τύπος Πρόσβασης</Label>
                <Select value={sharingType} onValueChange={setSharingType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Δωρεάν για Όλους</SelectItem>
                    <SelectItem value="paid">Επί Πληρωμή (Spreads)</SelectItem>
                    <SelectItem value="private">Ιδιωτική</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {sharingType === 'paid' && (
                <div className="space-y-2">
                  <Label htmlFor="price">Τιμή σε Spreads</Label>
                  <Input
                    id="price"
                    type="number"
                    value={spreadPrice}
                    onChange={(e) => setSpreadPrice(parseInt(e.target.value))}
                    min="1"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Button
            onClick={handleSubmit}
            disabled={isLoading || !title || ingredients.length === 0 || instructions.length === 0}
            size="lg"
            className="w-full"
          >
            {isLoading ? 'Δημιουργία...' : 'Δημοσίευση Συνταγής'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecipeEditor;
