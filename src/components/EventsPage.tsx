import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, MapPin, Users, Plus, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const EventsPage = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    max_participants: '',
    equipment_needed: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          profiles (display_name, verified_chef)
        `)
        .eq('status', 'approved')
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitEvent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Απαιτείται σύνδεση",
          description: "Παρακαλώ συνδεθείτε για να προτείνετε event",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('events')
        .insert({
          ...newEvent,
          user_id: user.id,
          max_participants: newEvent.max_participants ? parseInt(newEvent.max_participants) : null
        });

      if (error) throw error;

      toast({
        title: "Επιτυχής υποβολή!",
        description: "Το event σας υποβλήθηκε για έγκριση",
      });

      setNewEvent({
        title: '',
        description: '',
        event_date: '',
        location: '',
        max_participants: '',
        equipment_needed: ''
      });

      loadEvents();
    } catch (error) {
      console.error('Error submitting event:', error);
      toast({
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η υποβολή του event",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="p-6">Φόρτωση events...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Events & Εκδηλώσεις
            </h1>
            <p className="text-muted-foreground">
              Συμμετέχετε σε μαγειρικές εκδηλώσεις και προτείνετε δικά σας events
            </p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Πρόταση Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Πρόταση Νέου Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Τίτλος Event</label>
                  <Input
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    placeholder="π.χ. Μαγειρικό Workshop Ιταλικής Κουζίνας"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Περιγραφή</label>
                  <Textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    placeholder="Περιγράψτε το event, τι θα περιλαμβάνει..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Ημερομηνία & Ώρα</label>
                    <Input
                      type="datetime-local"
                      value={newEvent.event_date}
                      onChange={(e) => setNewEvent({...newEvent, event_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Μέγιστοι Συμμετέχοντες</label>
                    <Input
                      type="number"
                      value={newEvent.max_participants}
                      onChange={(e) => setNewEvent({...newEvent, max_participants: e.target.value})}
                      placeholder="20"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Τοποθεσία</label>
                  <Input
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    placeholder="π.χ. Κεντρική Κουζίνα, Αθήνα"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Απαιτούμενος Εξοπλισμός</label>
                  <Textarea
                    value={newEvent.equipment_needed}
                    onChange={(e) => setNewEvent({...newEvent, equipment_needed: e.target.value})}
                    placeholder="Αναφέρετε τον εξοπλισμό που θα χρησιμοποιηθεί..."
                    rows={3}
                  />
                </div>

                <Button onClick={handleSubmitEvent} className="w-full">
                  Υποβολή Πρότασης
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                  <Badge variant="outline">
                    {new Date(event.event_date) > new Date() ? 'Επερχόμενο' : 'Ολοκληρώθηκε'}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {event.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(event.event_date).toLocaleDateString('el-GR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(event.event_date).toLocaleTimeString('el-GR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="line-clamp-1">{event.location}</span>
                </div>

                {event.max_participants && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Μέγιστα {event.max_participants} άτομα</span>
                  </div>
                )}

                <div className="pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{event.profiles?.display_name}</span>
                      {event.profiles?.verified_chef && (
                        <Badge variant="outline" className="text-xs">Verified</Badge>
                      )}
                    </div>
                    
                    <Button size="sm" variant="outline">
                      Συμμετοχή
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Δεν υπάρχουν events προς το παρόν.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Προτείνετε ένα event για να ξεκινήσετε!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;