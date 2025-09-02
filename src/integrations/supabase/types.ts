export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      events: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          city: string
          created_at: string | null
          current_participants: number | null
          description: string | null
          event_date: string
          id: string
          is_approved: boolean | null
          location: string
          materials_needed: string[] | null
          max_participants: number | null
          organizer_id: string | null
          price: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          city: string
          created_at?: string | null
          current_participants?: number | null
          description?: string | null
          event_date: string
          id?: string
          is_approved?: boolean | null
          location: string
          materials_needed?: string[] | null
          max_participants?: number | null
          organizer_id?: string | null
          price?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          city?: string
          created_at?: string | null
          current_participants?: number | null
          description?: string | null
          event_date?: string
          id?: string
          is_approved?: boolean | null
          location?: string
          materials_needed?: string[] | null
          max_participants?: number | null
          organizer_id?: string | null
          price?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      peer_verifications: {
        Row: {
          comments: string | null
          created_at: string
          id: string
          verification_type: string
          verified_user_id: string
          verifier_id: string
        }
        Insert: {
          comments?: string | null
          created_at?: string
          id?: string
          verification_type: string
          verified_user_id: string
          verifier_id: string
        }
        Update: {
          comments?: string | null
          created_at?: string
          id?: string
          verification_type?: string
          verified_user_id?: string
          verifier_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          certifications: Json | null
          city: string | null
          country: string | null
          created_at: string | null
          display_name: string | null
          experience_years: number | null
          id: string
          is_verified: boolean | null
          linkedin_url: string | null
          portfolio_url: string | null
          skills: string[] | null
          specialty: string | null
          updated_at: string | null
          user_id: string | null
          verification_date: string | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verification_threshold: number | null
          verification_type: string | null
          verification_votes: number | null
          verified_at: string | null
          verified_by: string | null
          years_experience: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          certifications?: Json | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          experience_years?: number | null
          id?: string
          is_verified?: boolean | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          skills?: string[] | null
          specialty?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_date?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verification_threshold?: number | null
          verification_type?: string | null
          verification_votes?: number | null
          verified_at?: string | null
          verified_by?: string | null
          years_experience?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          certifications?: Json | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          experience_years?: number | null
          id?: string
          is_verified?: boolean | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          skills?: string[] | null
          specialty?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_date?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verification_threshold?: number | null
          verification_type?: string | null
          verification_votes?: number | null
          verified_at?: string | null
          verified_by?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      recipes: {
        Row: {
          author_id: string | null
          cook_time: number | null
          created_at: string | null
          description: string | null
          difficulty_level: number | null
          id: string
          image_url: string | null
          ingredients: Json
          instructions: Json
          is_premium: boolean | null
          prep_time: number | null
          price: number | null
          servings: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          cook_time?: number | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          id?: string
          image_url?: string | null
          ingredients: Json
          instructions: Json
          is_premium?: boolean | null
          prep_time?: number | null
          price?: number | null
          servings?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          cook_time?: number | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          id?: string
          image_url?: string | null
          ingredients?: Json
          instructions?: Json
          is_premium?: boolean | null
          prep_time?: number | null
          price?: number | null
          servings?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tutorials: {
        Row: {
          author_id: string | null
          category: string
          content: Json
          created_at: string | null
          description: string | null
          difficulty_level: number | null
          duration: number | null
          id: string
          is_free: boolean | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          author_id?: string | null
          category: string
          content: Json
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          duration?: number | null
          id?: string
          is_free?: boolean | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          author_id?: string | null
          category?: string
          content?: Json
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          duration?: number | null
          id?: string
          is_free?: boolean | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          awarded_by: string | null
          awarded_date: string
          badge_type: string
          id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          awarded_by?: string | null
          awarded_date?: string
          badge_type: string
          id?: string
          reason?: string | null
          user_id: string
        }
        Update: {
          awarded_by?: string | null
          awarded_date?: string
          badge_type?: string
          id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_tier: "basic" | "premium" | "pro"
      verification_status: "pending" | "verified" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      subscription_tier: ["basic", "premium", "pro"],
      verification_status: ["pending", "verified", "rejected"],
    },
  },
} as const
