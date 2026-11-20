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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      grades: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed: boolean
          lesson_id: string
          saved: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          lesson_id: string
          saved?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          lesson_id?: string
          saved?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          check_questions: string[]
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          key_terms: Json
          objectives: string[]
          origin: Database["public"]["Enums"]["content_origin"]
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          summary: string | null
          title: string
          unit_id: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          check_questions?: string[]
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          key_terms?: Json
          objectives?: string[]
          origin?: Database["public"]["Enums"]["content_origin"]
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string | null
          title: string
          unit_id: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          check_questions?: string[]
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          key_terms?: Json
          objectives?: string[]
          origin?: Database["public"]["Enums"]["content_origin"]
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string | null
          title?: string
          unit_id?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          grade_id: string | null
          id: string
          stream: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          grade_id?: string | null
          id: string
          stream?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          grade_id?: string | null
          id?: string
          stream?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_grade_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "grades"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          answer: Json
          created_at: string
          explanation: string | null
          id: string
          is_published: boolean
          lesson_id: string | null
          options: Json
          prompt: string
          sort_order: number
          type: string
          unit_id: string
        }
        Insert: {
          answer: Json
          created_at?: string
          explanation?: string | null
          id?: string
          is_published?: boolean
          lesson_id?: string | null
          options?: Json
          prompt: string
          sort_order?: number
          type: string
          unit_id: string
        }
        Update: {
          answer?: Json
          created_at?: string
          explanation?: string | null
          id?: string
          is_published?: boolean
          lesson_id?: string | null
          options?: Json
          prompt?: string
          sort_order?: number
          type?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          created_at: string
          id: string
          mode: string
          score: number
          total: number
          unit_id: string
          user_id: string
          wrong_lesson_ids: string[]
        }
        Insert: {
          created_at?: string
          id?: string
          mode?: string
          score: number
          total: number
          unit_id: string
          user_id: string
          wrong_lesson_ids?: string[]
        }
        Update: {
          created_at?: string
          id?: string
          mode?: string
          score?: number
          total?: number
          unit_id?: string
          user_id?: string
          wrong_lesson_ids?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          created_at: string
          description: string | null
          grade_id: string | null
          id: string
          is_published: boolean
          kind: string
          origin: Database["public"]["Enums"]["content_origin"]
          title: string
          unit_id: string | null
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          grade_id?: string | null
          id?: string
          is_published?: boolean
          kind?: string
          origin?: Database["public"]["Enums"]["content_origin"]
          title: string
          unit_id?: string | null
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          grade_id?: string | null
          id?: string
          is_published?: boolean
          kind?: string
          origin?: Database["public"]["Enums"]["content_origin"]
          title?: string
          unit_id?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_grade_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "grades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      streams: {
        Row: {
          grade_id: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          grade_id: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          grade_id?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "streams_grade_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "grades"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          created_at: string
          description: string | null
          grade_id: string
          id: string
          is_published: boolean
          sort_order: number
          stream_id: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          grade_id: string
          id?: string
          is_published?: boolean
          sort_order?: number
          stream_id?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          grade_id?: string
          id?: string
          is_published?: boolean
          sort_order?: number
          stream_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_grade_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "grades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "student"
      content_origin: "official" | "supplementary" | "demo"
      content_status: "draft" | "review" | "published"
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
    Enums: {
      app_role: ["admin", "student"],
      content_origin: ["official", "supplementary", "demo"],
      content_status: ["draft", "review", "published"],
    },
  },
} as const
