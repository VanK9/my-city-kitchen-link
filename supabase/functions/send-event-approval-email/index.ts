import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EventApprovalRequest {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  organizerId: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-event-approval-email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { eventId, eventTitle, eventDate, eventLocation, organizerId }: EventApprovalRequest = await req.json();

    console.log("Processing approval email for event:", eventId, "organizer:", organizerId);

    // Create Supabase client to get organizer email
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get organizer's email from auth.users
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(organizerId);

    if (userError || !userData?.user?.email) {
      console.error("Error fetching user email:", userError);
      return new Response(
        JSON.stringify({ error: "Could not find organizer email" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const organizerEmail = userData.user.email;
    console.log("Sending email to:", organizerEmail);

    // Format date for display
    const formattedDate = new Date(eventDate).toLocaleDateString('el-GR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const emailResponse = await resend.emails.send({
      from: "SpreadIt <onboarding@resend.dev>",
      to: [organizerEmail],
      subject: `🎉 Το event σου "${eventTitle}" εγκρίθηκε!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 Συγχαρητήρια!</h1>
            </div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #333333; margin-top: 0;">Το event σου εγκρίθηκε!</h2>
              <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                Χαρούμαστε να σε ενημερώσουμε ότι το event σου έχει εγκριθεί και είναι πλέον ορατό σε όλους τους χρήστες της πλατφόρμας.
              </p>
              
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <h3 style="color: #333333; margin-top: 0; margin-bottom: 16px;">📋 Στοιχεία Event</h3>
                <p style="color: #666666; margin: 8px 0;"><strong>Τίτλος:</strong> ${eventTitle}</p>
                <p style="color: #666666; margin: 8px 0;"><strong>Ημερομηνία:</strong> ${formattedDate}</p>
                <p style="color: #666666; margin: 8px 0;"><strong>Τοποθεσία:</strong> ${eventLocation}</p>
              </div>
              
              <p style="color: #666666; font-size: 14px; line-height: 1.6;">
                Οι χρήστες μπορούν τώρα να δουν το event σου και να δηλώσουν συμμετοχή!
              </p>
            </div>
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="color: #999999; font-size: 12px; margin: 0;">
                SpreadIt - Η κοινότητα των επαγγελματιών
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-event-approval-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
