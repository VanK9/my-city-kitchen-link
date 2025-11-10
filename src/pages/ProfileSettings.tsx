import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Lock, Settings, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';

const ProfileSettings = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Profile data
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [specialty, setSpecialty] = useState(profile?.specialty || '');
  const [city, setCity] = useState(profile?.city || '');
  
  // Password data
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdateProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        bio: bio,
        specialty: specialty,
        city: city,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    setIsLoading(false);

    if (error) {
      toast.error('Σφάλμα κατά την ενημέρωση προφίλ');
      console.error('Profile update error:', error);
    } else {
      toast.success('Το προφίλ ενημερώθηκε επιτυχώς!');
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      toast.error('Οι κωδικοί δεν ταιριάζουν');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες');
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    setIsLoading(false);

    if (error) {
      toast.error('Σφάλμα κατά την αλλαγή κωδικού');
      console.error('Password change error:', error);
    } else {
      toast.success('Ο κωδικός άλλαξε επιτυχώς!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
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
                Πρέπει να συνδεθείτε για να δείτε αυτή τη σελίδα
              </p>
              <Button onClick={() => navigate('/auth')}>
                Σύνδεση
              </Button>
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
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Πίσω στην Αρχική
          </Button>
          <h1 className="text-3xl font-bold">Ρυθμίσεις Λογαριασμού</h1>
          <p className="text-muted-foreground mt-2">
            Διαχειριστείτε το προφίλ και τις ρυθμίσεις ασφαλείας σας
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Προφίλ
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Ασφάλεια
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Προτιμήσεις
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Πληροφορίες Προφίλ</CardTitle>
                <CardDescription>
                  Ενημερώστε τα στοιχεία του προφίλ σας
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Το email δεν μπορεί να αλλάξει
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayName">Όνομα Εμφάνισης</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Το όνομά σας"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialty">Ειδικότητα</Label>
                  <Input
                    id="specialty"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="π.χ. Sous Chef, Pastry Chef"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Πόλη</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Η πόλη σας"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Βιογραφικό</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Πείτε μας λίγα λόγια για εσάς..."
                    rows={4}
                  />
                </div>

                <Button
                  onClick={handleUpdateProfile}
                  disabled={isLoading}
                  className="w-full"
                >
                  Αποθήκευση Αλλαγών
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Αλλαγή Κωδικού</CardTitle>
                <CardDescription>
                  Ενημερώστε τον κωδικό πρόσβασής σας
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Νέος Κωδικός</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Τουλάχιστον 6 χαρακτήρες"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Επιβεβαίωση Κωδικού</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Επαναλάβετε τον νέο κωδικό"
                  />
                </div>

                <Button
                  onClick={handleChangePassword}
                  disabled={isLoading || !newPassword || !confirmPassword}
                  className="w-full"
                >
                  Αλλαγή Κωδικού
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Προτιμήσεις</CardTitle>
                <CardDescription>
                  Προσαρμόστε την εμπειρία σας στην πλατφόρμα
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Οι προτιμήσεις θα είναι διαθέσιμες σύντομα...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfileSettings;
