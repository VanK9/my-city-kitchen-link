import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function AuthButtons() {
  const { user, signIn, signUp, signOut } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: 'Σφάλμα σύνδεσης',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Καλώς ήρθες!',
        description: 'Συνδέθηκες επιτυχώς.',
      });
      setOpen(false);
    }

    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const displayName = formData.get('displayName') as string;

    const { error } = await signUp(email, password, displayName);

    if (error) {
      toast({
        title: 'Σφάλμα εγγραφής',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Επιτυχής εγγραφή!',
        description: 'Έλεγξε το email σου για επιβεβαίωση.',
      });
      setOpen(false);
    }

    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Αποσυνδέθηκες',
      description: 'Τα λέμε σύντομα!',
    });
  };

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm text-muted-foreground">
          Γεια σου, {user.email}
        </span>
        <Button variant="outline" onClick={handleSignOut}>
          Αποσύνδεση
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex items-center space-x-4">
        <DialogTrigger asChild>
          <Button variant="outline">Σύνδεση</Button>
        </DialogTrigger>
        <DialogTrigger asChild>
          <Button>Εγγραφή</Button>
        </DialogTrigger>
      </div>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Συνδέσου στην Kitchen</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Σύνδεση</TabsTrigger>
            <TabsTrigger value="signup">Εγγραφή</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  name="email"
                  type="email"
                  required
                  placeholder="το_email_σου@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Κωδικός</Label>
                <Input
                  id="signin-password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Σύνδεση...' : 'Σύνδεση'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Όνομα εμφάνισης</Label>
                <Input
                  id="signup-name"
                  name="displayName"
                  type="text"
                  required
                  placeholder="Το όνομά σου"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  required
                  placeholder="το_email_σου@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Κωδικός</Label>
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Εγγραφή...' : 'Εγγραφή'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}