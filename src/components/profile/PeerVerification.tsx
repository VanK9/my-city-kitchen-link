import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCheck, Search, Award, Loader2, Shield, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UserProfile {
  user_id: string;
  display_name: string;
  specialty: string;
  city: string;
  is_verified: boolean;
  years_experience: number;
}

interface Verification {
  id: string;
  verifier_id: string;
  verification_type: string;
  comments: string;
  created_at: string;
  verifier?: {
    display_name: string;
    specialty: string;
  };
}

const PeerVerification: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [verifiedUsers, setVerifiedUsers] = useState<Set<string>>(new Set());
  const [myVerifications, setMyVerifications] = useState<Verification[]>([]);
  const [verificationStats, setVerificationStats] = useState({ given: 0, received: 0 });

  useEffect(() => {
    if (user) {
      loadVerifiedUsers();
      loadMyVerifications();
      loadVerificationStats();
    }
  }, [user]);

  const loadVerifiedUsers = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('peer_verifications')
      .select('verified_user_id')
      .eq('verifier_id', user.id);

    if (data) {
      setVerifiedUsers(new Set(data.map(v => v.verified_user_id)));
    }
  };

  const loadMyVerifications = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('peer_verifications')
      .select('*')
      .eq('verified_user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      // Fetch verifier info for each verification
      const verificationsWithVerifiers = await Promise.all(
        data.map(async (verification) => {
          const { data: verifierData } = await supabase
            .from('profiles')
            .select('display_name, specialty')
            .eq('user_id', verification.verifier_id)
            .maybeSingle();
          
          return {
            ...verification,
            verifier: verifierData || { display_name: 'Άγνωστος', specialty: '' }
          };
        })
      );
      setMyVerifications(verificationsWithVerifiers);
    }
  };

  const loadVerificationStats = async () => {
    if (!user) return;

    const { count: given } = await supabase
      .from('peer_verifications')
      .select('*', { count: 'exact', head: true })
      .eq('verifier_id', user.id);

    const { count: received } = await supabase
      .from('peer_verifications')
      .select('*', { count: 'exact', head: true })
      .eq('verified_user_id', user.id);

    setVerificationStats({
      given: given || 0,
      received: received || 0
    });
  };

  const searchUsers = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, display_name, specialty, city, is_verified, years_experience')
      .neq('user_id', user?.id)
      .or(`display_name.ilike.%${searchTerm}%,specialty.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`)
      .limit(10);

    setLoading(false);

    if (error) {
      toast({
        title: 'Σφάλμα',
        description: 'Αποτυχία αναζήτησης χρηστών',
        variant: 'destructive'
      });
    } else {
      setUsers(data || []);
    }
  };

  const verifyUser = async (verifiedUserId: string, verificationType: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('peer_verifications')
      .insert({
        verifier_id: user.id,
        verified_user_id: verifiedUserId,
        verification_type: verificationType,
        comments: `Επαλήθευση ${verificationType}`
      });

    if (error) {
      if (error.code === '23505') {
        toast({
          title: 'Προειδοποίηση',
          description: 'Έχετε ήδη επαληθεύσει αυτόν τον χρήστη για αυτή την κατηγορία',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Σφάλμα',
          description: 'Αποτυχία επαλήθευσης',
          variant: 'destructive'
        });
      }
    } else {
      toast({
        title: 'Επιτυχία',
        description: 'Η επαλήθευση καταχωρήθηκε'
      });
      setVerifiedUsers(prev => new Set([...prev, verifiedUserId]));
      loadVerificationStats();
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Παρακαλώ συνδεθείτε για να επαληθεύσετε συναδέλφους
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Επαληθεύσεις που έδωσα</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verificationStats.given}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Επαληθεύσεις που έλαβα</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verificationStats.received}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Χρειάζεστε 5 για πλήρη επαλήθευση
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Κατάσταση</CardTitle>
          </CardHeader>
          <CardContent>
            {profile?.is_verified ? (
              <Badge variant="default" className="text-sm">
                <Award className="h-4 w-4 mr-1" />
                Επαληθευμένος
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-sm">
                Σε αναμονή ({verificationStats.received}/5)
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search">
            <Search className="h-4 w-4 mr-2" />
            Αναζήτηση Συναδέλφων
          </TabsTrigger>
          <TabsTrigger value="my-verifications">
            <Shield className="h-4 w-4 mr-2" />
            Οι Επαληθεύσεις μου
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="mt-4">
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Επαλήθευση Συναδέλφων
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Αναζήτηση με όνομα, ειδικότητα ή πόλη..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
            />
            <Button onClick={searchUsers} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Αναζήτηση
            </Button>
          </div>

          {users.length > 0 && (
            <div className="space-y-3">
              {users.map((profile) => (
                <div 
                  key={profile.user_id} 
                  className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{profile.display_name || 'Ανώνυμος'}</span>
                        {profile.is_verified && (
                          <Badge variant="default" className="text-xs">
                            <Award className="h-3 w-3 mr-1" />
                            Επαληθευμένος
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {profile.specialty || 'Χωρίς ειδικότητα'} • {profile.city || 'Άγνωστη πόλη'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {profile.years_experience || 0} χρόνια εμπειρίας
                      </p>
                    </div>
                    
                    {verifiedUsers.has(profile.user_id) ? (
                      <Badge variant="secondary">Επαληθευμένος από εσάς</Badge>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => verifyUser(profile.user_id, 'skills')}
                        >
                          Δεξιότητες
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => verifyUser(profile.user_id, 'experience')}
                        >
                          Εμπειρία
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => verifyUser(profile.user_id, 'identity')}
                        >
                          Ταυτότητα
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {users.length === 0 && searchTerm && !loading && (
            <Alert>
              <AlertDescription>
                Δεν βρέθηκαν χρήστες με αυτά τα κριτήρια
              </AlertDescription>
            </Alert>
          )}
          
          {!searchTerm && (
            <Alert>
              <AlertDescription>
                Χρησιμοποιήστε την αναζήτηση για να βρείτε συναδέλφους και να τους επαληθεύσετε
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </TabsContent>

    <TabsContent value="my-verifications" className="mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Επαληθεύσεις που έχω λάβει
          </CardTitle>
          <CardDescription>
            Προβολή όλων των επαληθεύσεων από συναδέλφους
          </CardDescription>
        </CardHeader>
        <CardContent>
          {myVerifications.length > 0 ? (
            <div className="space-y-3">
              {myVerifications.map((verification) => (
                <div
                  key={verification.id}
                  className="p-4 border rounded-lg bg-muted/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {verification.verifier?.display_name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {verification.verification_type}
                        </Badge>
                      </div>
                      {verification.verifier?.specialty && (
                        <p className="text-sm text-muted-foreground">
                          {verification.verifier.specialty}
                        </p>
                      )}
                      {verification.comments && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {verification.comments}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(verification.created_at).toLocaleDateString('el-GR')}
                      </p>
                    </div>
                    <UserCheck className="h-5 w-5 text-primary" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertDescription>
                Δεν έχετε λάβει επαληθεύσεις ακόμα. Συμπληρώστε το προφίλ σας και συνδεθείτε με συναδέλφους!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  </Tabs>
    </div>
  );
};

export default PeerVerification;