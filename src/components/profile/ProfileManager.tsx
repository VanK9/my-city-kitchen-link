import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  User, CheckCircle, Award, Star, Users, 
  Briefcase, Calendar, Link, Save, Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ProfileManager: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    specialty: '',
    city: '',
    years_experience: 0,
    linkedin_url: '',
    portfolio_url: '',
    skills: [] as string[]
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        specialty: profile.specialty || '',
        city: profile.city || '',
        years_experience: profile.years_experience || 0,
        linkedin_url: profile.linkedin_url || '',
        portfolio_url: profile.portfolio_url || '',
        skills: profile.skills || []
      });
    }
    loadVerificationsAndBadges();
  }, [profile]);

  const loadVerificationsAndBadges = async () => {
    if (!user) return;

    // Load verifications
    const { data: verificationsData } = await supabase
      .from('peer_verifications')
      .select('*, verifier:profiles!peer_verifications_verifier_id_fkey(display_name)')
      .eq('verified_user_id', user.id);
    
    if (verificationsData) setVerifications(verificationsData);

    // Load badges
    const { data: badgesData } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', user.id);
    
    if (badgesData) setBadges(badgesData);
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        ...formData,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    setLoading(false);

    if (error) {
      toast({
        title: 'Σφάλμα',
        description: 'Αποτυχία ενημέρωσης προφίλ',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Επιτυχία',
        description: 'Το προφίλ σας ενημερώθηκε'
      });
    }
  };

  const getBadgeIcon = (badgeType: string) => {
    switch (badgeType) {
      case 'verified': return <CheckCircle className="h-4 w-4" />;
      case 'expert': return <Star className="h-4 w-4" />;
      case 'mentor': return <Users className="h-4 w-4" />;
      case 'contributor': return <Award className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getBadgeVariant = (badgeType: string) => {
    switch (badgeType) {
      case 'verified': return 'default';
      case 'expert': return 'secondary';
      default: return 'outline';
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Παρακαλώ συνδεθείτε για να διαχειριστείτε το προφίλ σας
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header with Badges */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Το Προφίλ μου
            </CardTitle>
            <div className="flex gap-2">
              {badges.map((badge) => (
                <Badge 
                  key={badge.id} 
                  variant={getBadgeVariant(badge.badge_type) as any}
                  className="flex items-center gap-1"
                >
                  {getBadgeIcon(badge.badge_type)}
                  {badge.badge_type}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="display_name">Όνομα Εμφάνισης</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="Το όνομά σας"
              />
            </div>
            <div>
              <Label htmlFor="specialty">Ειδικότητα</Label>
              <Input
                id="specialty"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                placeholder="π.χ. Μάγειρας, Σερβιτόρος"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Βιογραφικό</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Πείτε μας λίγα λόγια για εσάς..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">Πόλη</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="π.χ. Αθήνα"
              />
            </div>
            <div>
              <Label htmlFor="years_experience">Χρόνια Εμπειρίας</Label>
              <Input
                id="years_experience"
                type="number"
                value={formData.years_experience}
                onChange={(e) => setFormData({ ...formData, years_experience: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
              <Input
                id="linkedin_url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div>
              <Label htmlFor="portfolio_url">Portfolio/Website</Label>
              <Input
                id="portfolio_url"
                value={formData.portfolio_url}
                onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Αποθήκευση...' : 'Αποθήκευση Αλλαγών'}
          </Button>
        </CardContent>
      </Card>

      {/* Verification Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Κατάσταση Επαλήθευσης
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profile?.is_verified ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">Επαληθευμένο Προφίλ</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Τύπος επαλήθευσης: {profile.verification_type === 'peer' ? 'Από συναδέλφους' : profile.verification_type}
              </p>
              {profile.verification_date && (
                <p className="text-sm text-muted-foreground">
                  Ημερομηνία επαλήθευσης: {new Date(profile.verification_date).toLocaleDateString('el-GR')}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Το προφίλ σας δεν έχει επαληθευτεί ακόμα. Χρειάζεστε τουλάχιστον 5 επαληθεύσεις από συναδέλφους.
              </p>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm font-semibold mb-2">Επαληθεύσεις που έχετε λάβει:</p>
                {verifications.length > 0 ? (
                  <ul className="space-y-2">
                    {verifications.map((ver) => (
                      <li key={ver.id} className="text-sm">
                        • {ver.verifier?.display_name || 'Ανώνυμος'} - {ver.verification_type}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Δεν έχετε λάβει επαληθεύσεις ακόμα</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileManager;