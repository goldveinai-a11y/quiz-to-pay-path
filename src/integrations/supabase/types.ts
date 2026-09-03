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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      artworks: {
        Row: {
          artist: string | null
          created_at: string
          id: string
          image_url: string | null
          slug: string
          source: string | null
          tone: string
          year: string | null
        }
        Insert: {
          artist?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          slug: string
          source?: string | null
          tone?: string
          year?: string | null
        }
        Update: {
          artist?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          slug?: string
          source?: string | null
          tone?: string
          year?: string | null
        }
        Relationships: []
      }
      email_events: {
        Row: {
          day_number: number | null
          id: string
          kind: string
          sent_at: string
          user_id: string
        }
        Insert: {
          day_number?: number | null
          id?: string
          kind: string
          sent_at?: string
          user_id: string
        }
        Update: {
          day_number?: number | null
          id?: string
          kind?: string
          sent_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_job_runs: {
        Row: {
          daily: number
          error: string | null
          finish: number
          id: string
          ok: boolean
          ran_at: string
          reasons: Json | null
          skipped: number
          win_back: number
        }
        Insert: {
          daily?: number
          error?: string | null
          finish?: number
          id?: string
          ok?: boolean
          ran_at?: string
          reasons?: Json | null
          skipped?: number
          win_back?: number
        }
        Update: {
          daily?: number
          error?: string | null
          finish?: number
          id?: string
          ok?: boolean
          ran_at?: string
          reasons?: Json | null
          skipped?: number
          win_back?: number
        }
        Relationships: []
      }
      email_preferences: {
        Row: {
          created_at: string
          daily_reminder: boolean
          email: string
          milestone: boolean
          unsubscribe_token: string
          updated_at: string
          user_id: string
          win_back: boolean
        }
        Insert: {
          created_at?: string
          daily_reminder?: boolean
          email: string
          milestone?: boolean
          unsubscribe_token?: string
          updated_at?: string
          user_id: string
          win_back?: boolean
        }
        Update: {
          created_at?: string
          daily_reminder?: boolean
          email?: string
          milestone?: boolean
          unsubscribe_token?: string
          updated_at?: string
          user_id?: string
          win_back?: boolean
        }
        Relationships: []
      }
      job_secrets: {
        Row: {
          created_at: string
          name: string
          value: string
        }
        Insert: {
          created_at?: string
          name: string
          value?: string
        }
        Update: {
          created_at?: string
          name?: string
          value?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string
          id: string
          newsletter: boolean
          segment: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          newsletter?: boolean
          segment?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          newsletter?: boolean
          segment?: string | null
        }
        Relationships: []
      }
      reader_state: {
        Row: {
          created_at: string
          freezes_used: number
          last_completed_on: string | null
          longest_streak: number
          streak_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          freezes_used?: number
          last_completed_on?: string | null
          longest_streak?: number
          streak_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          freezes_used?: number
          last_completed_on?: string | null
          longest_streak?: number
          streak_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      session_questions: {
        Row: {
          answer: string
          book_slug: string
          created_at: string
          day_number: number
          id: string
          question: string
          user_id: string
        }
        Insert: {
          answer: string
          book_slug: string
          created_at?: string
          day_number: number
          id?: string
          question: string
          user_id: string
        }
        Update: {
          answer?: string
          book_slug?: string
          created_at?: string
          day_number?: number
          id?: string
          question?: string
          user_id?: string
        }
        Relationships: []
      }
      session_quiz: {
        Row: {
          book_slug: string
          correct_index: number
          created_at: string
          day_number: number
          explanation: string
          id: string
          options: Json
          question: string
        }
        Insert: {
          book_slug: string
          correct_index: number
          created_at?: string
          day_number: number
          explanation: string
          id?: string
          options: Json
          question: string
        }
        Update: {
          book_slug?: string
          correct_index?: number
          created_at?: string
          day_number?: number
          explanation?: string
          id?: string
          options?: Json
          question?: string
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          application: Json | null
          art_tone: string
          book: string
          book_slug: string
          chapter: number
          context_body: string
          created_at: string
          cross_reference: Json | null
          day_number: number
          divide_common: string | null
          divide_question: string | null
          divide_readings: Json | null
          divides: boolean
          highlight_word: string | null
          id: string
          insight_author: string
          insight_body: string
          insight_title: string
          insight_year: string
          question: string
          reference: string
          setup: string
          title: string
          verse_end: number
          verse_start: number
          voices: Json | null
          word_study: Json | null
        }
        Insert: {
          application?: Json | null
          art_tone?: string
          book: string
          book_slug: string
          chapter: number
          context_body: string
          created_at?: string
          cross_reference?: Json | null
          day_number: number
          divide_common?: string | null
          divide_question?: string | null
          divide_readings?: Json | null
          divides?: boolean
          highlight_word?: string | null
          id?: string
          insight_author: string
          insight_body: string
          insight_title: string
          insight_year: string
          question: string
          reference: string
          setup: string
          title: string
          verse_end: number
          verse_start: number
          voices?: Json | null
          word_study?: Json | null
        }
        Update: {
          application?: Json | null
          art_tone?: string
          book?: string
          book_slug?: string
          chapter?: number
          context_body?: string
          created_at?: string
          cross_reference?: Json | null
          day_number?: number
          divide_common?: string | null
          divide_question?: string | null
          divide_readings?: Json | null
          divides?: boolean
          highlight_word?: string | null
          id?: string
          insight_author?: string
          insight_body?: string
          insight_title?: string
          insight_year?: string
          question?: string
          reference?: string
          setup?: string
          title?: string
          verse_end?: number
          verse_start?: number
          voices?: Json | null
          word_study?: Json | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount_cents: number
          cancel_at_period_end: boolean
          canceled_at: string | null
          created_at: string
          currency: string
          current_period_end: string | null
          id: string
          is_test: boolean
          paid_at: string
          plan_code: string
          plan_label: string
          provider: string
          provider_customer_id: string | null
          provider_subscription_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount_cents?: number
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          currency?: string
          current_period_end?: string | null
          id?: string
          is_test?: boolean
          paid_at?: string
          plan_code?: string
          plan_label?: string
          provider?: string
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          currency?: string
          current_period_end?: string | null
          id?: string
          is_test?: boolean
          paid_at?: string
          plan_code?: string
          plan_label?: string
          provider?: string
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      user_plans: {
        Row: {
          book_slug: string
          book_title: string
          completed_at: string | null
          created_at: string
          freezes_used: number
          id: string
          is_active: boolean
          last_completed_on: string | null
          longest_streak: number
          paused_until: string | null
          reader_name: string | null
          review_asked_at: string | null
          show_both_sides: boolean
          started_at: string
          streak_count: number
          tradition: string
          translation: string
          user_id: string
          voices: string
        }
        Insert: {
          book_slug?: string
          book_title?: string
          completed_at?: string | null
          created_at?: string
          freezes_used?: number
          id?: string
          is_active?: boolean
          last_completed_on?: string | null
          longest_streak?: number
          paused_until?: string | null
          reader_name?: string | null
          review_asked_at?: string | null
          show_both_sides?: boolean
          started_at?: string
          streak_count?: number
          tradition?: string
          translation?: string
          user_id: string
          voices?: string
        }
        Update: {
          book_slug?: string
          book_title?: string
          completed_at?: string | null
          created_at?: string
          freezes_used?: number
          id?: string
          is_active?: boolean
          last_completed_on?: string | null
          longest_streak?: number
          paused_until?: string | null
          reader_name?: string | null
          review_asked_at?: string | null
          show_both_sides?: boolean
          started_at?: string
          streak_count?: number
          tradition?: string
          translation?: string
          user_id?: string
          voices?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed_at: string | null
          day_number: number
          id: string
          note: string | null
          plan_id: string
          step: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          day_number: number
          id?: string
          note?: string | null
          plan_id: string
          step?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          day_number?: number
          id?: string
          note?: string | null
          plan_id?: string
          step?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "user_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      verse_highlights: {
        Row: {
          book_slug: string
          created_at: string
          day_number: number
          id: string
          reference: string
          text: string
          user_id: string
          verse: number
        }
        Insert: {
          book_slug: string
          created_at?: string
          day_number: number
          id?: string
          reference: string
          text: string
          user_id: string
          verse: number
        }
        Update: {
          book_slug?: string
          created_at?: string
          day_number?: number
          id?: string
          reference?: string
          text?: string
          user_id?: string
          verse?: number
        }
        Relationships: []
      }
      verses: {
        Row: {
          book: string
          chapter: number
          id: number
          text: string
          translation: string
          verse: number
        }
        Insert: {
          book: string
          chapter: number
          id?: number
          text: string
          translation?: string
          verse: number
        }
        Update: {
          book?: string
          chapter?: number
          id?: number
          text?: string
          translation?: string
          verse?: number
        }
        Relationships: []
      }
      word_notes: {
        Row: {
          also_in: string | null
          book: string
          chapter: number
          created_at: string
          id: string
          language: string
          meaning: string
          original: string
          transliteration: string
          verse: number
          word: string
        }
        Insert: {
          also_in?: string | null
          book: string
          chapter: number
          created_at?: string
          id?: string
          language?: string
          meaning: string
          original: string
          transliteration: string
          verse: number
          word: string
        }
        Update: {
          also_in?: string | null
          book?: string
          chapter?: number
          created_at?: string
          id?: string
          language?: string
          meaning?: string
          original?: string
          transliteration?: string
          verse?: number
          word?: string
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
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
