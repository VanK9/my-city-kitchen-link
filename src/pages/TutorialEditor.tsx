import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Upload, X, Image as ImageIcon } from 'lucide-react';
import Navigation from '@/components/Navigation';

const TutorialEditor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  const [duration, setDuration] = useState(0);
  const [isFree, setIsFree] = useState(true);
  const [images, setImages] = useState<string[]>([]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) return;

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    for (const file of Array.from(event.target.files)) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('tutorial-images')
        .upload(fileName, file);

      if (uploadError) {
        toast.error('Σφάλμα κατά το ανέβασμα εικόνας');
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('tutorial-images')
        .getPublicUrl(fileName);

      uploadedUrls.push(publicUrl);
    }

    setImages([...images, ...uploadedUrls]);
    setUploadingImages(false);
    toast.success(`${uploadedUrls.length} εικόνες ανέβηκαν επιτυχώς!`);
  };

  const removeImage = async (url: string) => {
    const path = url.split('/').slice(-2).join('/');
    await supabase.storage.from('tutorial-images').remove([path]);
    setImages(images.filter(img => img !== url));
  };

  const handleSubmit = async () => {
    if (!user || !title || !category || !content) {
      toast.error('Συμπληρώστε τα υποχρεωτικά πεδία');
      return;
    }

    setIsLoading(true);

    const tutorialContent = {
      text: content,
      images: images
    };

    const { error } = await supabase
      .from('tutorials')
      .insert({
        author_id: user.id,
        title,
        description,
        content: tutorialContent,
        category,
        difficulty_level: difficultyLevel,
        duration,
        is_free: isFree
      });

    setIsLoading(false);

    if (error) {
      toast.error('Σφάλμα κατά τη δημιουργία άρθρου');
      console.error('Tutorial creation error:', error);
    } else {
      toast.success('Το άρθρο δημιουργήθηκε επιτυχώς!');
      navigate('/tutorials');
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
                Πρέπει να συνδεθείτε για να δημιουργήσετε άρθρο
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
          <Button variant="ghost" onClick={() => navigate('/tutorials')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Πίσω στα Άρθρα
          </Button>
          <h1 className="text-3xl font-bold">Νέο Άρθρο Μαγειρικής</h1>
          <p className="text-muted-foreground mt-2">
            Μοιραστείτε τις γνώσεις σας με την κοινότητα
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Πληροφορίες Άρθρου</CardTitle>
            <CardDescription>
              Συμπληρώστε τα στοιχεία του άρθρου σας
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Τίτλος *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="π.χ. Βασικές Τεχνικές Κοπής"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Περιγραφή</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Μια σύντομη περιγραφή του άρθρου..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Κατηγορία *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Επιλέξτε κατηγορία" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="techniques">Τεχνικές</SelectItem>
                  <SelectItem value="ingredients">Υλικά</SelectItem>
                  <SelectItem value="equipment">Εξοπλισμός</SelectItem>
                  <SelectItem value="theory">Θεωρία</SelectItem>
                  <SelectItem value="tips">Συμβουλές</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Επίπεδο Δυσκολίας</Label>
                <Select 
                  value={difficultyLevel.toString()} 
                  onValueChange={(v) => setDifficultyLevel(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Αρχάριος</SelectItem>
                    <SelectItem value="2">Μέτριος</SelectItem>
                    <SelectItem value="3">Προχωρημένος</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Διάρκεια Ανάγνωσης (λεπτά)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Περιεχόμενο *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Γράψτε το περιεχόμενο του άρθρου σας..."
                rows={12}
              />
            </div>

            <div className="space-y-2">
              <Label>Εικόνες</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {images.map((url, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={url} 
                      alt={`Tutorial ${index + 1}`} 
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(url)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Label htmlFor="image-upload" className="cursor-pointer">
                <div className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-muted/50 transition-colors">
                  {uploadingImages ? (
                    <span>Ανέβασμα...</span>
                  ) : (
                    <>
                      <ImageIcon className="h-5 w-5" />
                      <span>Προσθήκη Εικόνων</span>
                    </>
                  )}
                </div>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploadingImages}
                  className="hidden"
                />
              </Label>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <div>
                <Label htmlFor="is-free" className="cursor-pointer">
                  Δωρεάν Πρόσβαση
                </Label>
                <p className="text-xs text-muted-foreground">
                  Το άρθρο θα είναι διαθέσιμο σε όλους
                </p>
              </div>
              <Switch
                id="is-free"
                checked={isFree}
                onCheckedChange={setIsFree}
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isLoading || !title || !category || !content}
              className="w-full"
              size="lg"
            >
              {isLoading ? 'Δημιουργία...' : 'Δημοσίευση Άρθρου'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TutorialEditor;
