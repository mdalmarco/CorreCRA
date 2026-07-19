export type UserRole = "participant" | "organizer" | "admin";
export type ParticipantStatus = "incomplete" | "awaiting_payment" | "active" | "suspended" | "closed";
export type EventStatus = "draft" | "scheduled" | "checkin_open" | "checkin_closed" | "completed" | "cancelled";
export type RequestStatus =
  | "draft" | "submitted" | "in_review" | "complement_requested"
  | "approved" | "partially_approved" | "rejected" | "cancelled";
export type PointStatus = "pending" | "validated" | "rejected" | "cancelled" | "admin_adjustment";
export type CheckinMethod = "qr_code" | "event_code" | "manual";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  display_name: string | null;
  avatar_url: string | null;
  email: string;
  phone: string | null;
  birth_date: string | null;
  city: string | null;
  state: string | null;
  shirt_size: string | null;
  role: UserRole;
  participant_status: ParticipantStatus;
  payment_status: "pending" | "confirmed" | "refunded";
  created_at: string;
  updated_at: string;
}

export interface Challenge {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  award_date: string | null;
  registration_fee: number;
  status: string;
  ranking_frozen_at: string | null;
}

export interface EventRow {
  id: string;
  challenge_id: string;
  activity_type_id: string | null;
  name: string;
  city: string | null;
  start_at: string;
  checkin_start_at: string | null;
  checkin_end_at: string | null;
  status: EventStatus;
  points: number;
  is_sample: boolean;
}

export interface PointLedgerEntry {
  id: string;
  participant_id: string;
  points: number;
  status: PointStatus;
  description: string | null;
  occurred_at: string;
}

// Placeholder Database type for @supabase/ssr generics.
// Substitua pelo output real de `supabase gen types typescript` quando tiver a CLI conectada.
export type Database = {
  public: {
    Tables: Record<string, { Row: Record<string, unknown> }>;
  };
};
