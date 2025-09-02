import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Search, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  user_id: string;
  display_name: string;
  specialty: string;
  city: string;
  is_verified: boolean;
  years_experience: number;
}

const PeerVerification: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [verifiedUsers, setVerifiedUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      loadVerifiedUsers();
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
              <Search className="h-4 w-4 mr-2" />
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
            <p className="text-center text-muted-foreground py-4">
              Δεν βρέθηκαν χρήστες με αυτά τα κριτήρια
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PeerVerification;