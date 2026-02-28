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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      credit_card_products: {
        Row: {
          annual_fee: number
          bank: string
          card_image_url: string | null
          category: string
          created_at: string
          created_by: string | null
          dsa_commission: number
          features: string[]
          highlights: string
          id: string
          image_url: string
          joining_fee: number
          name: string
          payout_source: string
          redirect_url: string
          reward_points: string
          serviceable_pincodes: string[]
          status: string
          terms: string
          type: string
          updated_at: string
          utm_link: string
          variant_image_url: string | null
        }
        Insert: {
          annual_fee?: number
          bank: string
          card_image_url?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          dsa_commission?: number
          features?: string[]
          highlights?: string
          id?: string
          image_url?: string
          joining_fee?: number
          name: string
          payout_source?: string
          redirect_url?: string
          reward_points?: string
          serviceable_pincodes?: string[]
          status?: string
          terms?: string
          type?: string
          updated_at?: string
          utm_link?: string
          variant_image_url?: string | null
        }
        Update: {
          annual_fee?: number
          bank?: string
          card_image_url?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          dsa_commission?: number
          features?: string[]
          highlights?: string
          id?: string
          image_url?: string
          joining_fee?: number
          name?: string
          payout_source?: string
          redirect_url?: string
          reward_points?: string
          serviceable_pincodes?: string[]
          status?: string
          terms?: string
          type?: string
          updated_at?: string
          utm_link?: string
          variant_image_url?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          applicant_email: string
          applicant_name: string
          applicant_phone: string
          assigned_to: string | null
          bank_name: string
          card_name: string
          created_at: string
          credit_card_id: string | null
          id: string
          lead_id: string
          notes: string
          status: string
          submitted_by: string | null
          updated_at: string
          utm_link: string
        }
        Insert: {
          applicant_email?: string
          applicant_name: string
          applicant_phone?: string
          assigned_to?: string | null
          bank_name?: string
          card_name?: string
          created_at?: string
          credit_card_id?: string | null
          id?: string
          lead_id?: string
          notes?: string
          status?: string
          submitted_by?: string | null
          updated_at?: string
          utm_link?: string
        }
        Update: {
          applicant_email?: string
          applicant_name?: string
          applicant_phone?: string
          assigned_to?: string | null
          bank_name?: string
          card_name?: string
          created_at?: string
          credit_card_id?: string | null
          id?: string
          lead_id?: string
          notes?: string
          status?: string
          submitted_by?: string | null
          updated_at?: string
          utm_link?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_credit_card_id_fkey"
            columns: ["credit_card_id"]
            isOneToOne: false
            referencedRelation: "credit_card_products"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_applications: {
        Row: {
          applicant_email: string
          applicant_name: string
          applicant_phone: string
          assigned_to: string | null
          created_at: string
          id: string
          loan_amount: number
          loan_id: string
          loan_type: string
          notes: string
          status: string
          submitted_by: string | null
          updated_at: string
        }
        Insert: {
          applicant_email: string
          applicant_name: string
          applicant_phone: string
          assigned_to?: string | null
          created_at?: string
          id?: string
          loan_amount?: number
          loan_id?: string
          loan_type: string
          notes?: string
          status?: string
          submitted_by?: string | null
          updated_at?: string
        }
        Update: {
          applicant_email?: string
          applicant_name?: string
          applicant_phone?: string
          assigned_to?: string | null
          created_at?: string
          id?: string
          loan_amount?: number
          loan_id?: string
          loan_type?: string
          notes?: string
          status?: string
          submitted_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payouts: {
        Row: {
          aadhar_number: string | null
          account_number: string | null
          bank_name: string
          bank_name_user: string | null
          commission: number
          created_at: string
          customer_name: string
          deduction: number
          id: string
          ifsc_code: string | null
          lead_id: string
          lead_status: string
          net_payout: number
          pan_number: string | null
          payout_date: string | null
          payout_status: string
          product_name: string
          remark: string
          team_earning: number
          updated_at: string
          user_id: string
        }
        Insert: {
          aadhar_number?: string | null
          account_number?: string | null
          bank_name: string
          bank_name_user?: string | null
          commission?: number
          created_at?: string
          customer_name: string
          deduction?: number
          id?: string
          ifsc_code?: string | null
          lead_id: string
          lead_status?: string
          net_payout?: number
          pan_number?: string | null
          payout_date?: string | null
          payout_status?: string
          product_name: string
          remark?: string
          team_earning?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          aadhar_number?: string | null
          account_number?: string | null
          bank_name?: string
          bank_name_user?: string | null
          commission?: number
          created_at?: string
          customer_name?: string
          deduction?: number
          id?: string
          ifsc_code?: string | null
          lead_id?: string
          lead_status?: string
          net_payout?: number
          pan_number?: string | null
          payout_date?: string | null
          payout_status?: string
          product_name?: string
          remark?: string
          team_earning?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin"
        | "manager"
        | "team_leader"
        | "employee"
        | "dsa_partner"
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
      app_role: [
        "super_admin",
        "admin",
        "manager",
        "team_leader",
        "employee",
        "dsa_partner",
      ],
    },
  },
} as const
