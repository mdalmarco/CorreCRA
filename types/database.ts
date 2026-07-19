export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_types: {
        Row: {
          accumulation_group: string | null
          active: boolean
          challenge_id: string
          created_at: string
          daily_limit: number | null
          default_points: number
          description: string | null
          id: string
          monthly_limit: number | null
          name: string
          proof_required: boolean
          requires_approval: boolean
          weekly_limit: number | null
        }
        Insert: {
          accumulation_group?: string | null
          active?: boolean
          challenge_id: string
          created_at?: string
          daily_limit?: number | null
          default_points?: number
          description?: string | null
          id?: string
          monthly_limit?: number | null
          name: string
          proof_required?: boolean
          requires_approval?: boolean
          weekly_limit?: number | null
        }
        Update: {
          accumulation_group?: string | null
          active?: boolean
          challenge_id?: string
          created_at?: string
          daily_limit?: number | null
          default_points?: number
          description?: string | null
          id?: string
          monthly_limit?: number | null
          name?: string
          proof_required?: boolean
          requires_approval?: boolean
          weekly_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_types_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      attachments: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          file_name: string
          file_size: number
          file_url: string
          id: string
          mime_type: string
          owner_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          file_name: string
          file_size: number
          file_url: string
          id?: string
          mime_type: string
          owner_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          file_name?: string
          file_size?: number
          file_url?: string
          id?: string
          mime_type?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          reason: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          reason?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          award_date: string | null
          created_at: string
          description: string | null
          end_date: string
          id: string
          name: string
          ranking_frozen_at: string | null
          registration_fee: number
          start_date: string
          status: string
          tie_break_rules: Json
        }
        Insert: {
          award_date?: string | null
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          name: string
          ranking_frozen_at?: string | null
          registration_fee?: number
          start_date: string
          status?: string
          tie_break_rules?: Json
        }
        Update: {
          award_date?: string | null
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          name?: string
          ranking_frozen_at?: string | null
          registration_fee?: number
          start_date?: string
          status?: string
          tie_break_rules?: Json
        }
        Relationships: []
      }
      draws: {
        Row: {
          challenge_id: string
          created_at: string
          eligibility_rule: Json | null
          event_id: string | null
          executed_at: string | null
          executed_by: string | null
          id: string
          name: string
          random_seed: string | null
          status: Database["public"]["Enums"]["draw_status"]
          winner_participant_id: string | null
        }
        Insert: {
          challenge_id: string
          created_at?: string
          eligibility_rule?: Json | null
          event_id?: string | null
          executed_at?: string | null
          executed_by?: string | null
          id?: string
          name: string
          random_seed?: string | null
          status?: Database["public"]["Enums"]["draw_status"]
          winner_participant_id?: string | null
        }
        Update: {
          challenge_id?: string
          created_at?: string
          eligibility_rule?: Json | null
          event_id?: string | null
          executed_at?: string | null
          executed_by?: string | null
          id?: string
          name?: string
          random_seed?: string | null
          status?: Database["public"]["Enums"]["draw_status"]
          winner_participant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "draws_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draws_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draws_executed_by_fkey"
            columns: ["executed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draws_winner_participant_id_fkey"
            columns: ["winner_participant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_checkins: {
        Row: {
          checked_in_at: string
          checkin_method: Database["public"]["Enums"]["checkin_method"]
          created_at: string
          event_id: string
          id: string
          participant_id: string
          status: Database["public"]["Enums"]["checkin_status"]
          validated_by: string | null
          validation_notes: string | null
        }
        Insert: {
          checked_in_at?: string
          checkin_method: Database["public"]["Enums"]["checkin_method"]
          created_at?: string
          event_id: string
          id?: string
          participant_id: string
          status?: Database["public"]["Enums"]["checkin_status"]
          validated_by?: string | null
          validation_notes?: string | null
        }
        Update: {
          checked_in_at?: string
          checkin_method?: Database["public"]["Enums"]["checkin_method"]
          created_at?: string
          event_id?: string
          id?: string
          participant_id?: string
          status?: Database["public"]["Enums"]["checkin_status"]
          validated_by?: string | null
          validation_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_checkins_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_checkins_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_checkins_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          activity_type_id: string | null
          challenge_id: string
          checkin_code: string | null
          checkin_end_at: string | null
          checkin_start_at: string | null
          city: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_at: string | null
          id: string
          is_sample: boolean
          latitude: number | null
          location: string | null
          longitude: number | null
          name: string
          points: number
          qr_token: string | null
          qr_token_expires_at: string | null
          start_at: string
          status: Database["public"]["Enums"]["event_status"]
        }
        Insert: {
          activity_type_id?: string | null
          challenge_id: string
          checkin_code?: string | null
          checkin_end_at?: string | null
          checkin_start_at?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_at?: string | null
          id?: string
          is_sample?: boolean
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name: string
          points?: number
          qr_token?: string | null
          qr_token_expires_at?: string | null
          start_at: string
          status?: Database["public"]["Enums"]["event_status"]
        }
        Update: {
          activity_type_id?: string | null
          challenge_id?: string
          checkin_code?: string | null
          checkin_end_at?: string | null
          checkin_start_at?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_at?: string | null
          id?: string
          is_sample?: boolean
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name?: string
          points?: number
          qr_token?: string | null
          qr_token_expires_at?: string | null
          start_at?: string
          status?: Database["public"]["Enums"]["event_status"]
        }
        Relationships: [
          {
            foreignKeyName: "events_activity_type_id_fkey"
            columns: ["activity_type_id"]
            isOneToOne: false
            referencedRelation: "activity_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      external_races: {
        Row: {
          city: string | null
          created_at: string
          distance: string | null
          id: string
          name: string
          notes: string | null
          official_url: string | null
          participant_id: string
          race_date: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["request_status"]
          submitted_at: string | null
          used_cra_registration: boolean
          used_cra_shirt: boolean
        }
        Insert: {
          city?: string | null
          created_at?: string
          distance?: string | null
          id?: string
          name: string
          notes?: string | null
          official_url?: string | null
          participant_id: string
          race_date: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          submitted_at?: string | null
          used_cra_registration?: boolean
          used_cra_shirt?: boolean
        }
        Update: {
          city?: string | null
          created_at?: string
          distance?: string | null
          id?: string
          name?: string
          notes?: string | null
          official_url?: string | null
          participant_id?: string
          race_date?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          submitted_at?: string | null
          used_cra_registration?: boolean
          used_cra_shirt?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "external_races_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_races_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read_at?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      point_ledger: {
        Row: {
          activity_type_id: string | null
          approved_at: string | null
          approved_by: string | null
          challenge_id: string
          created_at: string
          description: string | null
          event_id: string | null
          id: string
          occurred_at: string
          participant_id: string
          point_request_id: string | null
          points: number
          rule_snapshot: Json | null
          status: Database["public"]["Enums"]["point_status"]
          transaction_type: Database["public"]["Enums"]["ledger_transaction_type"]
        }
        Insert: {
          activity_type_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          challenge_id: string
          created_at?: string
          description?: string | null
          event_id?: string | null
          id?: string
          occurred_at?: string
          participant_id: string
          point_request_id?: string | null
          points: number
          rule_snapshot?: Json | null
          status?: Database["public"]["Enums"]["point_status"]
          transaction_type: Database["public"]["Enums"]["ledger_transaction_type"]
        }
        Update: {
          activity_type_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          challenge_id?: string
          created_at?: string
          description?: string | null
          event_id?: string | null
          id?: string
          occurred_at?: string
          participant_id?: string
          point_request_id?: string | null
          points?: number
          rule_snapshot?: Json | null
          status?: Database["public"]["Enums"]["point_status"]
          transaction_type?: Database["public"]["Enums"]["ledger_transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "point_ledger_activity_type_id_fkey"
            columns: ["activity_type_id"]
            isOneToOne: false
            referencedRelation: "activity_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_ledger_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_ledger_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_ledger_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_ledger_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_ledger_point_request_id_fkey"
            columns: ["point_request_id"]
            isOneToOne: false
            referencedRelation: "point_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      point_requests: {
        Row: {
          activity_type_id: string
          approved_points: number | null
          created_at: string
          external_race_id: string | null
          id: string
          participant_id: string
          participant_notes: string | null
          requested_points: number
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string
        }
        Insert: {
          activity_type_id: string
          approved_points?: number | null
          created_at?: string
          external_race_id?: string | null
          id?: string
          participant_id: string
          participant_notes?: string | null
          requested_points?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
        }
        Update: {
          activity_type_id?: string
          approved_points?: number | null
          created_at?: string
          external_race_id?: string | null
          id?: string
          participant_id?: string
          participant_notes?: string | null
          requested_points?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "point_requests_activity_type_id_fkey"
            columns: ["activity_type_id"]
            isOneToOne: false
            referencedRelation: "activity_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_requests_external_race_id_fkey"
            columns: ["external_race_id"]
            isOneToOne: false
            referencedRelation: "external_races"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_requests_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          city: string | null
          created_at: string
          display_name: string | null
          email: string
          full_name: string
          id: string
          participant_status: Database["public"]["Enums"]["participant_status"]
          payment_status: Database["public"]["Enums"]["payment_status"]
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          shirt_size: string | null
          state: string | null
          terms_accepted_at: string | null
          terms_version: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          full_name: string
          id?: string
          participant_status?: Database["public"]["Enums"]["participant_status"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          shirt_size?: string | null
          state?: string | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          full_name?: string
          id?: string
          participant_status?: Database["public"]["Enums"]["participant_status"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          shirt_size?: string | null
          state?: string | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ranking_snapshots: {
        Row: {
          challenge_id: string
          created_at: string
          id: string
          participant_id: string
          position: number
          snapshot_date: string
          tie_break_data: Json | null
          total_points: number
        }
        Insert: {
          challenge_id: string
          created_at?: string
          id?: string
          participant_id: string
          position: number
          snapshot_date?: string
          tie_break_data?: Json | null
          total_points: number
        }
        Update: {
          challenge_id?: string
          created_at?: string
          id?: string
          participant_id?: string
          position?: number
          snapshot_date?: string
          tie_break_data?: Json | null
          total_points?: number
        }
        Relationships: [
          {
            foreignKeyName: "ranking_snapshots_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_snapshots_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_profile_id: { Args: never; Returns: string }
      current_profile_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      fn_do_checkin: {
        Args: {
          p_event_id: string
          p_method: Database["public"]["Enums"]["checkin_method"]
          p_participant_id: string
        }
        Returns: {
          checked_in_at: string
          checkin_method: Database["public"]["Enums"]["checkin_method"]
          created_at: string
          event_id: string
          id: string
          participant_id: string
          status: Database["public"]["Enums"]["checkin_status"]
          validated_by: string | null
          validation_notes: string | null
        }
        SetofOptions: {
          from: "*"
          to: "event_checkins"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      fn_manual_point_adjustment: {
        Args: {
          p_actor_id: string
          p_challenge_id: string
          p_participant_id: string
          p_points: number
          p_reason: string
        }
        Returns: {
          activity_type_id: string | null
          approved_at: string | null
          approved_by: string | null
          challenge_id: string
          created_at: string
          description: string | null
          event_id: string | null
          id: string
          occurred_at: string
          participant_id: string
          point_request_id: string | null
          points: number
          rule_snapshot: Json | null
          status: Database["public"]["Enums"]["point_status"]
          transaction_type: Database["public"]["Enums"]["ledger_transaction_type"]
        }
        SetofOptions: {
          from: "*"
          to: "point_ledger"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      fn_review_point_request: {
        Args: {
          p_approved_points: number
          p_new_status: Database["public"]["Enums"]["request_status"]
          p_request_id: string
          p_reviewer_id: string
          p_reviewer_notes: string
        }
        Returns: {
          activity_type_id: string
          approved_points: number | null
          created_at: string
          external_race_id: string | null
          id: string
          participant_id: string
          participant_notes: string | null
          requested_points: number
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "point_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      is_admin: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
    }
    Enums: {
      checkin_method: "qr_code" | "event_code" | "manual"
      checkin_status: "valid" | "pending" | "rejected"
      draw_status: "draft" | "scheduled" | "completed" | "cancelled"
      event_status:
        | "draft"
        | "scheduled"
        | "checkin_open"
        | "checkin_closed"
        | "completed"
        | "cancelled"
      ledger_transaction_type:
        | "checkin"
        | "point_request"
        | "manual_adjustment"
        | "badge"
      participant_status:
        | "incomplete"
        | "awaiting_payment"
        | "active"
        | "suspended"
        | "closed"
      payment_status: "pending" | "confirmed" | "refunded"
      point_status:
        | "pending"
        | "validated"
        | "rejected"
        | "cancelled"
        | "admin_adjustment"
      request_status:
        | "draft"
        | "submitted"
        | "in_review"
        | "complement_requested"
        | "approved"
        | "partially_approved"
        | "rejected"
        | "cancelled"
      user_role: "participant" | "organizer" | "admin"
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
      checkin_method: ["qr_code", "event_code", "manual"],
      checkin_status: ["valid", "pending", "rejected"],
      draw_status: ["draft", "scheduled", "completed", "cancelled"],
      event_status: [
        "draft",
        "scheduled",
        "checkin_open",
        "checkin_closed",
        "completed",
        "cancelled",
      ],
      ledger_transaction_type: [
        "checkin",
        "point_request",
        "manual_adjustment",
        "badge",
      ],
      participant_status: [
        "incomplete",
        "awaiting_payment",
        "active",
        "suspended",
        "closed",
      ],
      payment_status: ["pending", "confirmed", "refunded"],
      point_status: [
        "pending",
        "validated",
        "rejected",
        "cancelled",
        "admin_adjustment",
      ],
      request_status: [
        "draft",
        "submitted",
        "in_review",
        "complement_requested",
        "approved",
        "partially_approved",
        "rejected",
        "cancelled",
      ],
      user_role: ["participant", "organizer", "admin"],
    },
  },
} as const
