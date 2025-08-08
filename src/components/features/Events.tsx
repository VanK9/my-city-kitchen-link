import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Calendar, MapPin, Users, Plus, Clock, Euro, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { el } from 'date-fns/locale';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  city: string;
  max_participants: number;
  current_participants: number;
  price: number;
  materials_needed: string[];
  is_approved: boolean;
  organizer: {
    display_name: string;
    verification_status: string;
  };
}

export function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    city: profile?.city || '',
    max_participants: 10,
    price: 0,
    materials_needed: '',
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_approved', true)
        .order('event_date', { ascending: true });

      if (error) throw error;
      // Προσθέτουμε mock organizer για τα events
      const eventsWithOrganizer = (data || []).map(event => ({
        ...event,
        organizer: { display_name: 'Organizer', verification_status: 'pending' }
      }));
      setEvents(eventsWithOrganizer);
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        title: 'Σφάλμα',
        description: 'Δεν μπόρεσαν να φορτωθούν τα events',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase.from('events').insert({
        organizer_id: user.id,
        title: newEvent.title,
        description: newEvent.description,
        event_date: newEvent.event_date,
        location: newEvent.location,
        city: newEvent.city,
        max_participants: newEvent.max_participants,
        price: newEvent.price,
        materials_needed: newEvent.materials_needed.split('\n').filter(item => item.trim()),
        is_approved: false, // Requires admin approval
      });

      if (error) throw error;

      toast({
        title: 'Επιτυχία!',
        description: 'Το event στάλθηκε για έγκριση. Θα ενημερωθείτε όταν εγκριθεί.',
      });

      setIsCreateOpen(false);
      setNewEvent({
        title: '',
        description: '',
        event_date: '',
        location: '',
        city: profile?.city || '',
        max_participants: 10,
        price: 0,
        materials_needed: '',
      });
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: 'Σφάλμα',
        description: 'Δεν μπόρεσε να δημιουργηθεί το event',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: el });
    } catch {
      return dateString;
    }
  };

  const isEventFull = (event: Event) => {
    return event.current_participants >= event.max_participants;
  };

  const isEventPast = (event: Event) => {
    return new Date(event.event_date) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Φόρτωση events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Events</h2>
          <p className="text-muted-foreground">
            Συμμετέχετε σε μαγειρικά events και εκδηλώσεις
          </p>
        </div>
        
        {user && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Πρότεινε Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Πρόταση Νέου Event</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Το event θα σταλεί για έγκριση από τους διαχειριστές
                </p>
              </DialogHeader>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Τίτλος Event</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Περιγραφή</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event_date">Ημερομηνία & Ώρα</Label>
                    <Input
                      id="event_date"
                      type="datetime-local"
                      value={newEvent.event_date}
                      onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">Πόλη</Label>
                    <Input
                      id="city"
                      value={newEvent.city}
                      onChange={(e) => setNewEvent({ ...newEvent, city: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Τοποθεσία/Διεύθυνση</Label>
                  <Input
                    id="location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="π.χ. Κεντρική κουζίνα, Πλάκα 15, Αθήνα"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max_participants">Μέγιστοι συμμετέχοντες</Label>
                    <Input
                      id="max_participants"
                      type="number"
                      min="1"
                      value={newEvent.max_participants}
                      onChange={(e) => setNewEvent({ ...newEvent, max_participants: parseInt(e.target.value) || 10 })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price">Τιμή (€) - προαιρετικό</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newEvent.price}
                      onChange={(e) => setNewEvent({ ...newEvent, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="materials_needed">Υλικά που θα χρησιμοποιηθούν (ένα ανά γραμμή)</Label>
                  <Textarea
                    id="materials_needed"
                    value={newEvent.materials_needed}
                    onChange={(e) => setNewEvent({ ...newEvent, materials_needed: e.target.value })}
                    placeholder="π.χ.&#10;Αλεύρι&#10;Ζάχαρη&#10;Αυγά&#10;Βούτυρο"
                  />
                </div>
                
                <div className="bg-accent/50 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Σημείωση:</p>
                      <p className="text-muted-foreground">
                        Το event σας θα εξεταστεί από τους διαχειριστές και θα δημοσιοποιηθεί μόνο αν εγκριθεί.
                      </p>
                    </div>
                  </div>
                </div>
                
                <Button type="submit" className="w-full">Υποβολή Event</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event.id} className={`overflow-hidden ${isEventPast(event) ? 'opacity-75' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {event.description}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  {isEventPast(event) && (
                    <Badge variant="secondary">Παρελθόν</Badge>
                  )}
                  {isEventFull(event) && !isEventPast(event) && (
                    <Badge variant="destructive">Πλήρες</Badge>
                  )}
                  {event.price > 0 && (
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Euro className="h-3 w-3" />
                      <span>{event.price}€</span>
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(event.event_date)}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}, {event.city}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{event.current_participants}/{event.max_participants} συμμετέχοντες</span>
                </div>
              </div>

              {event.materials_needed && event.materials_needed.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Υλικά που θα χρησιμοποιηθούν:</h4>
                  <div className="flex flex-wrap gap-1">
                    {event.materials_needed.slice(0, 3).map((material, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {material}
                      </Badge>
                    ))}
                    {event.materials_needed.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{event.materials_needed.length - 3} άλλα
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Οργανωτής: {event.organizer?.display_name}</span>
                  {event.organizer?.verification_status === 'verified' && (
                    <Badge variant="outline" className="text-xs">Verified</Badge>
                  )}
                </div>
              </div>

              <Button 
                className="w-full" 
                variant={isEventPast(event) || isEventFull(event) ? "outline" : "default"}
                disabled={isEventPast(event) || isEventFull(event)}
              >
                {isEventPast(event) 
                  ? "Event ολοκληρώθηκε" 
                  : isEventFull(event)
                  ? "Πλήρες - Λίστα αναμονής"
                  : "Συμμετοχή"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Δεν υπάρχουν events ακόμα</h3>
          <p className="text-muted-foreground mb-4">
            Προτείνετε το πρώτο event!
          </p>
          {user && (
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Πρότεινε Event
            </Button>
          )}
        </div>
      )}
    </div>
  );
}