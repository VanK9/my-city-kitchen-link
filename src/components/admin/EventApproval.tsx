import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Users, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { el } from 'date-fns/locale';

interface PendingEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  city: string;
  max_participants: number;
  price: number;
  materials_needed: string[];
  organizer_id: string;
  created_at: string;
  organizer?: {
    display_name: string;
    is_verified: boolean;
  };
}

export const EventApproval = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([]);
  const [approvedEvents, setApprovedEvents] = useState<PendingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      loadEvents();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) throw error;
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      // Load pending events
      const { data: pending, error: pendingError } = await supabase
        .from('events')
        .select('*')
        .eq('is_approved', false)
        .order('created_at', { ascending: false });

      if (pendingError) throw pendingError;

      // Load approved events (recent)
      const { data: approved, error: approvedError } = await supabase
        .from('events')
        .select('*')
        .eq('is_approved', true)
        .order('approved_at', { ascending: false })
        .limit(20);

      if (approvedError) throw approvedError;

      // Fetch organizer info for all events
      const allEvents = [...(pending || []), ...(approved || [])];
      const eventsWithOrganizers = await Promise.all(
        allEvents.map(async (event) => {
          const { data: organizer } = await supabase
            .from('profiles')
            .select('display_name, is_verified')
            .eq('user_id', event.organizer_id)
            .maybeSingle();

          return {
            ...event,
            organizer: organizer || undefined
          };
        })
      );

      setPendingEvents(eventsWithOrganizers.filter(e => !e.is_approved));
      setApprovedEvents(eventsWithOrganizers.filter(e => e.is_approved));
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        title: 'Σφάλμα',
        description: 'Δεν μπόρεσαν να φορτωθούν τα events',
        variant: 'destructive',
      });
    }
  };

  const handleApprove = async (eventId: string) => {
    setProcessingId(eventId);
    try {
      // Find the event to get details for email
      const eventToApprove = pendingEvents.find(e => e.id === eventId);
      
      const { error } = await supabase
        .from('events')
        .update({
          is_approved: true,
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', eventId);

      if (error) {
        // Handle RLS policy violations with user-friendly message
        if (error.code === '42501') {
          toast({
            title: 'Άρνηση Πρόσβασης',
            description: 'Δεν έχετε δικαίωμα να εγκρίνετε events. Χρειάζεστε ρόλο admin.',
            variant: 'destructive',
          });
          return;
        }
        throw error;
      }

      // Send approval email notification
      if (eventToApprove) {
        try {
          const { error: emailError } = await supabase.functions.invoke('send-event-approval-email', {
            body: {
              eventId: eventToApprove.id,
              eventTitle: eventToApprove.title,
              eventDate: eventToApprove.event_date,
              eventLocation: `${eventToApprove.location}, ${eventToApprove.city}`,
              organizerId: eventToApprove.organizer_id,
            },
          });

          if (emailError) {
            console.error('Error sending approval email:', emailError);
            // Don't fail the approval if email fails
          } else {
            console.log('Approval email sent successfully');
          }
        } catch (emailErr) {
          console.error('Error invoking email function:', emailErr);
        }
      }

      toast({
        title: 'Επιτυχία',
        description: 'Το event εγκρίθηκε και ο οργανωτής ενημερώθηκε!',
      });

      await loadEvents();
    } catch (error) {
      console.error('Error approving event:', error);
      toast({
        title: 'Σφάλμα',
        description: 'Δεν μπόρεσε να εγκριθεί το event',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (eventId: string) => {
    setProcessingId(eventId);
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) {
        // Handle RLS policy violations with user-friendly message
        if (error.code === '42501') {
          toast({
            title: 'Άρνηση Πρόσβασης',
            description: 'Δεν έχετε δικαίωμα να διαγράψετε events. Χρειάζεστε ρόλο admin.',
            variant: 'destructive',
          });
          return;
        }
        throw error;
      }

      toast({
        title: 'Επιτυχία',
        description: 'Το event απορρίφθηκε και διαγράφηκε.',
      });

      await loadEvents();
    } catch (error) {
      console.error('Error rejecting event:', error);
      toast({
        title: 'Σφάλμα',
        description: 'Δεν μπόρεσε να διαγραφεί το event',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: el });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Δεν έχετε πρόσβαση
            </CardTitle>
            <CardDescription>
              Αυτή η σελίδα είναι διαθέσιμη μόνο σε διαχειριστές.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const EventCard = ({ event, showActions }: { event: PendingEvent; showActions: boolean }) => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle>{event.title}</CardTitle>
            <CardDescription className="mt-2">{event.description}</CardDescription>
          </div>
          {event.price > 0 && (
            <Badge variant="outline">{event.price}€</Badge>
          )}
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
            <span>Μέγιστοι συμμετέχοντες: {event.max_participants}</span>
          </div>
        </div>

        {event.materials_needed && event.materials_needed.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Υλικά:</h4>
            <div className="flex flex-wrap gap-1">
              {event.materials_needed.map((material, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {material}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {event.organizer && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
            <span>Οργανωτής: {event.organizer.display_name}</span>
            {event.organizer.is_verified && (
              <Badge variant="outline" className="text-xs">Verified</Badge>
            )}
          </div>
        )}

        {showActions && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={() => handleApprove(event.id)}
              disabled={processingId === event.id}
              className="flex-1"
            >
              {processingId === event.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Έγκριση
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleReject(event.id)}
              disabled={processingId === event.id}
              className="flex-1"
            >
              {processingId === event.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <X className="h-4 w-4 mr-2" />
              )}
              Απόρριψη
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Διαχείριση Events</h2>
        <p className="text-muted-foreground">
          Έγκριση και διαχείριση events που υποβλήθηκαν από χρήστες
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Εκκρεμή ({pendingEvents.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Εγκεκριμένα ({approvedEvents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingEvents.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Check className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Δεν υπάρχουν εκκρεμή events προς έγκριση</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingEvents.map((event) => (
                <EventCard key={event.id} event={event} showActions={true} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedEvents.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Δεν υπάρχουν εγκεκριμένα events</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {approvedEvents.map((event) => (
                <EventCard key={event.id} event={event} showActions={false} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
