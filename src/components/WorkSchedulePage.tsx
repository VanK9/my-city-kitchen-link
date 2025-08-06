import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Plus, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const WorkSchedulePage = () => {
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUserSubscription();
  }, []);

  const loadUserSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      setSubscription(data);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (plan: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Απαιτείται σύνδεση",
          description: "Παρακαλώ συνδεθείτε για να συνεχίσετε",
          variant: "destructive",
        });
        return;
      }

      const price = plan === 'basic' ? 29.99 : 49.99;
      
      const { error } = await supabase
        .from('subscribers')
        .insert({
          user_id: user.id,
          subscription_type: plan,
          price,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) throw error;

      toast({
        title: "Επιτυχής εγγραφή!",
        description: `Εγγραφήκατε στο πλάνο ${plan}`,
      });

      loadUserSubscription();
    } catch (error) {
      console.error('Error subscribing:', error);
      toast({
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η εγγραφή",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="p-6">Φόρτωση...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Πρόγραμμα Εργασίας
          </h1>
          <p className="text-muted-foreground">
            Διαχειριστείτε το πρόγραμμα εργασίας σας και αναπτύξτε την καριέρα σας
          </p>
        </div>

        {!subscription ? (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">Basic</Badge>
                  Βασικό Πλάνο
                </CardTitle>
                <CardDescription>
                  Ιδανικό για νέους μάγειρες που ξεκινούν
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold text-primary">
                  €29.99<span className="text-sm font-normal text-muted-foreground">/μήνα</span>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Βασικό πρόγραμμα εργασίας
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Παρακολούθηση εργασιών
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Βασικές συνταγές
                  </li>
                </ul>
                <Button 
                  onClick={() => handleSubscribe('basic')}
                  className="w-full"
                >
                  Επιλογή Βασικού
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary hover:border-primary/70 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge className="bg-primary">Premium</Badge>
                  Επαγγελματικό Πλάνο
                </CardTitle>
                <CardDescription>
                  Για επαγγελματίες μάγειρες
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold text-primary">
                  €49.99<span className="text-sm font-normal text-muted-foreground">/μήνα</span>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Πλήρες πρόγραμμα εργασίας
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Προηγμένη παρακολούθηση
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Πώληση συνταγών
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Verified member status
                  </li>
                </ul>
                <Button 
                  onClick={() => handleSubscribe('premium')}
                  className="w-full"
                >
                  Επιλογή Premium
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Το Πλάνο σας
                  <Badge variant={subscription.subscription_type === 'premium' ? 'default' : 'secondary'}>
                    {subscription.subscription_type === 'premium' ? 'Premium' : 'Basic'}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Ενεργό έως: {new Date(subscription.end_date).toLocaleDateString('el-GR')}
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5" />
                    Σημερινό Πρόγραμμα
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">08:00 - 16:00</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Restaurant XYZ</span>
                    </div>
                    <Button size="sm" variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Προσθήκη Βάρδιας
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Στατιστικά Μήνα</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Ώρες εργασίας:</span>
                      <span className="font-semibold">128h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Βάρδιες:</span>
                      <span className="font-semibold">16</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Εισόδημα:</span>
                      <span className="font-semibold text-green-600">€1,280</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Γρήγορες Ενέργειες</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button size="sm" variant="outline" className="w-full">
                      Καταχώρηση Βάρδιας
                    </Button>
                    <Button size="sm" variant="outline" className="w-full">
                      Εβδομαδιαίο Πρόγραμμα
                    </Button>
                    <Button size="sm" variant="outline" className="w-full">
                      Αναφορά Εισοδημάτων
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkSchedulePage;