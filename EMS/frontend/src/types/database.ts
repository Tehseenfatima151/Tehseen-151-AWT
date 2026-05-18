// ============================================================
// VoteSphere — Supabase Database Type Definitions
// Auto-generated shape for all tables: Row, Insert, Update
// ============================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          phone: string;
          role: 'super_admin' | 'election_creator' | 'voter';
          organization: string | null;
          avatar_url: string | null;
          is_verified: boolean;
          is_2fa_enabled: boolean;
          is_blocked: boolean;
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          phone: string;
          role: 'super_admin' | 'election_creator' | 'voter';
          organization?: string | null;
          avatar_url?: string | null;
          is_verified?: boolean;
          is_2fa_enabled?: boolean;
          is_blocked?: boolean;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };

      elections: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: 'government' | 'corporate' | 'educational' | 'community' | 'ngo';
          organization: string;
          status: 'draft' | 'pending' | 'approved' | 'rejected' | 'active' | 'completed';
          creator_id: string;
          start_date: string;
          end_date: string;
          registration_deadline: string;
          timezone: string;
          max_voters: number;
          current_voters: number;
          is_waitlist_enabled: boolean;
          waitlist_count: number;
          is_voter_list_locked: boolean;
          require_secret_id: boolean;
          require_2fa: boolean;
          allow_anonymous: boolean;
          total_votes: number;
          turnout_percentage: number;
          rejection_reason: string | null;
          published_at: string | null;
          completed_at: string | null;
          cover_image: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          category: 'government' | 'corporate' | 'educational' | 'community' | 'ngo';
          organization: string;
          status?: 'draft' | 'pending' | 'approved' | 'rejected' | 'active' | 'completed';
          creator_id: string;
          start_date: string;
          end_date: string;
          registration_deadline: string;
          timezone?: string;
          max_voters?: number;
          current_voters?: number;
          is_waitlist_enabled?: boolean;
          waitlist_count?: number;
          is_voter_list_locked?: boolean;
          require_secret_id?: boolean;
          require_2fa?: boolean;
          allow_anonymous?: boolean;
          total_votes?: number;
          turnout_percentage?: number;
          rejection_reason?: string | null;
          published_at?: string | null;
          completed_at?: string | null;
          cover_image?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['elections']['Insert']>;
      };

      candidates: {
        Row: {
          id: string;
          election_id: string;
          name: string;
          designation: string;
          photo_url: string | null;
          manifesto: string;
          vote_count: number;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          election_id: string;
          name: string;
          designation: string;
          photo_url?: string | null;
          manifesto?: string;
          vote_count?: number;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['candidates']['Insert']>;
      };

      voter_registrations: {
        Row: {
          id: string;
          election_id: string;
          user_id: string;
          status: 'registered' | 'waitlisted' | 'voted' | 'blocked';
          secret_id_code: string;
          secret_id_masked: string;
          waitlist_position: number | null;
          vote_hash: string | null;
          voted_at: string | null;
          registered_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          election_id: string;
          user_id: string;
          status?: 'registered' | 'waitlisted' | 'voted' | 'blocked';
          secret_id_code: string;
          secret_id_masked: string;
          waitlist_position?: number | null;
          vote_hash?: string | null;
          voted_at?: string | null;
          registered_at?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['voter_registrations']['Insert']>;
      };

      votes: {
        Row: {
          id: string;
          election_id: string;
          candidate_id: string;
          // NOTE: voter_id is stored as a one-way hash — never the raw auth uid
          // This ensures true anonymity: you cannot reverse-lookup who voted
          voter_hash: string;
          secret_id_code: string;
          casted_at: string;
        };
        Insert: {
          id?: string;
          election_id: string;
          candidate_id: string;
          voter_hash: string;
          secret_id_code: string;
          casted_at?: string;
        };
        Update: never; // Votes are IMMUTABLE — no updates allowed
      };

      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'info' | 'success' | 'warning' | 'error';
          title: string;
          message: string;
          is_read: boolean;
          action_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'info' | 'success' | 'warning' | 'error';
          title: string;
          message: string;
          is_read?: boolean;
          action_url?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };

      audit_logs: {
        Row: {
          id: string;
          action: string;
          user_id: string | null;
          user_email: string | null;
          user_role: string | null;
          target_id: string | null;
          target_type: string | null;
          description: string;
          ip_address: string | null;
          user_agent: string | null;
          is_admin_override: boolean;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          action: string;
          user_id?: string | null;
          user_email?: string | null;
          user_role?: string | null;
          target_id?: string | null;
          target_type?: string | null;
          description: string;
          ip_address?: string | null;
          user_agent?: string | null;
          is_admin_override?: boolean;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: never; // Audit logs are IMMUTABLE
      };

      election_requests: {
        Row: {
          id: string;
          creator_id: string;
          organization: string;
          purpose: string;
          status: 'pending' | 'approved' | 'rejected';
          rejection_reason: string | null;
          reviewed_by: string | null;
          submitted_at: string;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          organization: string;
          purpose: string;
          status?: 'pending' | 'approved' | 'rejected';
          rejection_reason?: string | null;
          reviewed_by?: string | null;
          submitted_at?: string;
          reviewed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['election_requests']['Insert']>;
      };

      waitlist: {
        Row: {
          id: string;
          election_id: string;
          user_id: string;
          position: number;
          status: 'waiting' | 'promoted' | 'expired';
          joined_at: string;
          promoted_at: string | null;
        };
        Insert: {
          id?: string;
          election_id: string;
          user_id: string;
          position?: number;
          status?: 'waiting' | 'promoted' | 'expired';
          joined_at?: string;
          promoted_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['waitlist']['Insert']>;
      };
    };

    Views: {
      election_results: {
        Row: {
          election_id: string;
          candidate_id: string;
          candidate_name: string;
          vote_count: number;
          percentage: number;
        };
      };
    };

    Functions: {
      cast_vote: {
        Args: {
          p_election_id: string;
          p_candidate_id: string;
          p_secret_id_code: string;
          p_voter_hash: string;
        };
        Returns: string; // vote confirmation hash
      };
      get_election_results: {
        Args: { p_election_id: string };
        Returns: Array<{
          candidate_id: string;
          candidate_name: string;
          vote_count: number;
          percentage: number;
        }>;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
  };
}

// ── Convenience type aliases ─────────────────────────────────
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type ElectionRow = Database['public']['Tables']['elections']['Row'];
export type CandidateRow = Database['public']['Tables']['candidates']['Row'];
export type VoterRegistrationRow = Database['public']['Tables']['voter_registrations']['Row'];
export type VoteRow = Database['public']['Tables']['votes']['Row'];
export type NotificationRow = Database['public']['Tables']['notifications']['Row'];
export type AuditLogRow = Database['public']['Tables']['audit_logs']['Row'];
export type ElectionRequestRow = Database['public']['Tables']['election_requests']['Row'];
export type WaitlistRow = Database['public']['Tables']['waitlist']['Row'];
