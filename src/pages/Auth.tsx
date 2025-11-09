import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Loader2, ChefHat } from 'lucide-react';

const emailSchema = z.string().email('Μη έγκυρη διεύθυνση email');
const passwordSchema = z.string().min(6, 'Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες');
const displayNameSchema = z.string().min(2, 'Το όνομα πρέπει να έχει τουλάχιστον 2 χαρακτήρες');

const Auth = () => {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup form
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate inputs
      emailSchema.parse(loginEmail);
      passwordSchema.parse(loginPassword);
      
      setLoading(true);
      const { error } = await signIn(loginEmail, loginPassword);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: 'Σφάλμα σύνδεσης',
            description: 'Λάθος email ή κωδικός',
            variant: 'destructive',
          });
        } else if (error.message.includes('Email not confirmed')) {
          toast({
            title: 'Email μη επιβεβαιωμένο',
            description: 'Παρακαλώ επιβεβαιώστε το email σας πρώτα',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Σφάλμα',
            description: error.message,
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Επιτυχής σύνδεση!',
          description: 'Καλώς ήρθατε πίσω',
        });
        navigate('/');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Σφάλμα επικύρωσης',
          description: error.errors[0].message,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate inputs
      emailSchema.parse(signupEmail);
      passwordSchema.parse(signupPassword);
      displayNameSchema.parse(displayName);
      
      setLoading(true);
      const { error } = await signUp(signupEmail, signupPassword, displayName);
      
      if (error) {
        if (error.message.includes('User already registered')) {
          toast({
            title: 'Ο χρήστης υπάρχει ήδη',
            description: 'Αυτό το email είναι ήδη εγγεγραμμένο. Παρακαλώ συνδεθείτε.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Σφάλμα εγγραφής',
            description: error.message,
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Επιτυχής εγγραφή!',
          description: 'Ελέγξτε το email σας για επιβεβαίωση (αν είναι ενεργοποιημένο)',
        });
        // Redirect after successful signup
        setTimeout(() => navigate('/'), 1500);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Σφάλμα επικύρωσης',
          description: error.errors[0].message,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-gradient-to-br from-primary to-primary-glow rounded-2xl flex items-center justify-center shadow-warm">
              <ChefHat className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">SpreadIt</CardTitle>
          <CardDescription>
            Η κοινότητα των επαγγελματιών της εστίασης
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Σύνδεση</TabsTrigger>
              <TabsTrigger value="signup">Εγγραφή</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Κωδικός</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Σύνδεση...
                    </>
                  ) : (
                    'Σύνδεση'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display-name">Όνομα Χρήστη</Label>
                  <Input
                    id="display-name"
                    type="text"
                    placeholder="Γιάννης Παπαδόπουλος"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Κωδικός</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Τουλάχιστον 6 χαρακτήρες
                  </p>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Εγγραφή...
                    </>
                  ) : (
                    'Δημιουργία Λογαριασμού'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
