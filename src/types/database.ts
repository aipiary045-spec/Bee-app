export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      apiaries: {
        Row: {
          created_at: string
          description: string | null
          id: string
          location: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          apiary_id: string
          category: Database["public"]["Enums"]["expense_category"]
          created_at: string
          date: string
          description: string
          hive_id: string | null
          id: string
          updated_at: string
        }
        Insert: {
          amount: number
          apiary_id: string
          category: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          date?: string
          description: string
          hive_id?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          apiary_id?: string
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          date?: string
          description?: string
          hive_id?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_apiary_id_fkey"
            columns: ["apiary_id"]
            isOneToOne: false
            referencedRelation: "apiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_hive_id_fkey"
            columns: ["hive_id"]
            isOneToOne: false
            referencedRelation: "hives"
            referencedColumns: ["id"]
          },
        ]
      }
      hives: {
        Row: {
          apiary_id: string
          created_at: string
          deep_boxes: number
          frame_count: number
          has_queen_excluder: boolean
          honey_supers: number
          id: string
          name: string
          status: Database["public"]["Enums"]["hive_status"]
          updated_at: string
        }
        Insert: {
          apiary_id: string
          created_at?: string
          deep_boxes?: number
          frame_count?: number
          has_queen_excluder?: boolean
          honey_supers?: number
          id?: string
          name: string
          status?: Database["public"]["Enums"]["hive_status"]
          updated_at?: string
        }
        Update: {
          apiary_id?: string
          created_at?: string
          deep_boxes?: number
          frame_count?: number
          has_queen_excluder?: boolean
          honey_supers?: number
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["hive_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hives_apiary_id_fkey"
            columns: ["apiary_id"]
            isOneToOne: false
            referencedRelation: "apiaries"
            referencedColumns: ["id"]
          },
        ]
      }
      honey_yields: {
        Row: {
          created_at: string
          frames_harvested: number | null
          harvest_date: string
          hive_id: string
          id: string
          notes: string | null
          weight_lbs: number
          year: number
        }
        Insert: {
          created_at?: string
          frames_harvested?: number | null
          harvest_date: string
          hive_id: string
          id?: string
          notes?: string | null
          weight_lbs: number
          year?: number
        }
        Update: {
          created_at?: string
          frames_harvested?: number | null
          harvest_date?: string
          hive_id?: string
          id?: string
          notes?: string | null
          weight_lbs?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "honey_yields_hive_id_fkey"
            columns: ["hive_id"]
            isOneToOne: false
            referencedRelation: "hives"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections: {
        Row: {
          action_fed: boolean
          action_split: boolean
          action_super: boolean
          action_super_removed: boolean
          action_treatment: boolean
          brood_pattern: Database["public"]["Enums"]["brood_pattern"] | null
          created_at: string
          created_by: string
          date: string
          eggs_larvae: Database["public"]["Enums"]["eggs_larvae_status"] | null
          hive_id: string
          honey_stores: Database["public"]["Enums"]["store_level"] | null
          id: string
          inspection_time: string | null
          mite_count_per_100: number | null
          notes: string | null
          pests_diseases: Database["public"]["Enums"]["pest_disease"] | null
          pollen_stores: Database["public"]["Enums"]["store_level"] | null
          queen_mark_color:
            | Database["public"]["Enums"]["queen_mark_color"]
            | null
          queen_sighted: Database["public"]["Enums"]["queen_sighted"] | null
          queen_spotted: boolean
          temperament: Database["public"]["Enums"]["temperament"] | null
          temperature_f: number | null
          updated_at: string
          weather: string | null
        }
        Insert: {
          action_fed?: boolean
          action_split?: boolean
          action_super?: boolean
          action_super_removed?: boolean
          action_treatment?: boolean
          brood_pattern?: Database["public"]["Enums"]["brood_pattern"] | null
          created_at?: string
          created_by: string
          date?: string
          eggs_larvae?: Database["public"]["Enums"]["eggs_larvae_status"] | null
          hive_id: string
          honey_stores?: Database["public"]["Enums"]["store_level"] | null
          id?: string
          inspection_time?: string | null
          mite_count_per_100?: number | null
          notes?: string | null
          pests_diseases?: Database["public"]["Enums"]["pest_disease"] | null
          pollen_stores?: Database["public"]["Enums"]["store_level"] | null
          queen_mark_color?:
            | Database["public"]["Enums"]["queen_mark_color"]
            | null
          queen_sighted?: Database["public"]["Enums"]["queen_sighted"] | null
          queen_spotted?: boolean
          temperament?: Database["public"]["Enums"]["temperament"] | null
          temperature_f?: number | null
          updated_at?: string
          weather?: string | null
        }
        Update: {
          action_fed?: boolean
          action_split?: boolean
          action_super?: boolean
          action_super_removed?: boolean
          action_treatment?: boolean
          brood_pattern?: Database["public"]["Enums"]["brood_pattern"] | null
          created_at?: string
          created_by?: string
          date?: string
          eggs_larvae?: Database["public"]["Enums"]["eggs_larvae_status"] | null
          hive_id?: string
          honey_stores?: Database["public"]["Enums"]["store_level"] | null
          id?: string
          inspection_time?: string | null
          mite_count_per_100?: number | null
          notes?: string | null
          pests_diseases?: Database["public"]["Enums"]["pest_disease"] | null
          pollen_stores?: Database["public"]["Enums"]["store_level"] | null
          queen_mark_color?:
            | Database["public"]["Enums"]["queen_mark_color"]
            | null
          queen_sighted?: Database["public"]["Enums"]["queen_sighted"] | null
          queen_spotted?: boolean
          temperament?: Database["public"]["Enums"]["temperament"] | null
          temperature_f?: number | null
          updated_at?: string
          weather?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspections_hive_id_fkey"
            columns: ["hive_id"]
            isOneToOne: false
            referencedRelation: "hives"
            referencedColumns: ["id"]
          },
        ]
      }
      mite_counts: {
        Row: {
          count: number
          created_at: string
          date: string
          hive_id: string
          id: string
          inspection_id: string | null
          method: Database["public"]["Enums"]["mite_method"]
          threshold_exceeded: boolean
        }
        Insert: {
          count: number
          created_at?: string
          date?: string
          hive_id: string
          id?: string
          inspection_id?: string | null
          method: Database["public"]["Enums"]["mite_method"]
          threshold_exceeded?: boolean
        }
        Update: {
          count?: number
          created_at?: string
          date?: string
          hive_id?: string
          id?: string
          inspection_id?: string | null
          method?: Database["public"]["Enums"]["mite_method"]
          threshold_exceeded?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "mite_counts_hive_id_fkey"
            columns: ["hive_id"]
            isOneToOne: false
            referencedRelation: "hives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mite_counts_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      queen_logs: {
        Row: {
          created_at: string
          hive_id: string
          id: string
          inspection_id: string | null
          mark_color: Database["public"]["Enums"]["queen_mark_color"] | null
          notes: string | null
          status: Database["public"]["Enums"]["queen_status"]
        }
        Insert: {
          created_at?: string
          hive_id: string
          id?: string
          inspection_id?: string | null
          mark_color?: Database["public"]["Enums"]["queen_mark_color"] | null
          notes?: string | null
          status: Database["public"]["Enums"]["queen_status"]
        }
        Update: {
          created_at?: string
          hive_id?: string
          id?: string
          inspection_id?: string | null
          mark_color?: Database["public"]["Enums"]["queen_mark_color"] | null
          notes?: string | null
          status?: Database["public"]["Enums"]["queen_status"]
        }
        Relationships: [
          {
            foreignKeyName: "queen_logs_hive_id_fkey"
            columns: ["hive_id"]
            isOneToOne: false
            referencedRelation: "hives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queen_logs_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      revenues: {
        Row: {
          amount: number
          apiary_id: string
          category: Database["public"]["Enums"]["revenue_category"]
          created_at: string
          date: string
          description: string
          hive_id: string | null
          id: string
          updated_at: string
        }
        Insert: {
          amount: number
          apiary_id: string
          category: Database["public"]["Enums"]["revenue_category"]
          created_at?: string
          date?: string
          description: string
          hive_id?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          apiary_id?: string
          category?: Database["public"]["Enums"]["revenue_category"]
          created_at?: string
          date?: string
          description?: string
          hive_id?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenues_apiary_id_fkey"
            columns: ["apiary_id"]
            isOneToOne: false
            referencedRelation: "apiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenues_hive_id_fkey"
            columns: ["hive_id"]
            isOneToOne: false
            referencedRelation: "hives"
            referencedColumns: ["id"]
          },
        ]
      }
      treatments: {
        Row: {
          created_at: string
          dosage: string | null
          end_date: string | null
          hive_id: string
          id: string
          notes: string | null
          product_name: string
          start_date: string
          status: Database["public"]["Enums"]["treatment_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          hive_id: string
          id?: string
          notes?: string | null
          product_name: string
          start_date: string
          status?: Database["public"]["Enums"]["treatment_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          hive_id?: string
          id?: string
          notes?: string | null
          product_name?: string
          start_date?: string
          status?: Database["public"]["Enums"]["treatment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "treatments_hive_id_fkey"
            columns: ["hive_id"]
            isOneToOne: false
            referencedRelation: "hives"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      user_owns_apiary: { Args: { apiary_uuid: string }; Returns: boolean }
      user_owns_hive: { Args: { hive_uuid: string }; Returns: boolean }
    }
    Enums: {
      brood_pattern: "excellent" | "good" | "fair" | "spotty" | "poor" | "none"
      eggs_larvae_status:
        | "eggs_and_larvae"
        | "eggs_only"
        | "larvae_only"
        | "none_observed"
      expense_category:
        | "equipment"
        | "treatments"
        | "feed"
        | "administrative"
        | "other"
      hive_status: "active" | "inactive" | "deadout"
      mite_method: "alcohol_wash" | "sugar_roll" | "sticky_board"
      pest_disease:
        | "none"
        | "varroa"
        | "chalkbrood"
        | "foulbrood_suspect"
        | "wax_moth"
        | "ants"
        | "other"
      queen_mark_color:
        | "white"
        | "yellow"
        | "red"
        | "green"
        | "blue"
        | "unmarked"
      queen_sighted: "yes" | "no" | "uncertain"
      queen_status: "marked" | "virgin" | "laying" | "cell_check" | "replaced"
      revenue_category:
        | "honey_sales"
        | "nucs"
        | "queens"
        | "pollination"
        | "wax"
        | "other"
      store_level: "empty" | "low" | "moderate" | "good" | "full"
      temperament: "calm" | "moderate" | "defensive" | "aggressive"
      treatment_status: "planned" | "in_progress" | "completed"
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
      brood_pattern: ["excellent", "good", "fair", "spotty", "poor", "none"],
      eggs_larvae_status: [
        "eggs_and_larvae",
        "eggs_only",
        "larvae_only",
        "none_observed",
      ],
      expense_category: [
        "equipment",
        "treatments",
        "feed",
        "administrative",
        "other",
      ],
      hive_status: ["active", "inactive", "deadout"],
      mite_method: ["alcohol_wash", "sugar_roll", "sticky_board"],
      pest_disease: [
        "none",
        "varroa",
        "chalkbrood",
        "foulbrood_suspect",
        "wax_moth",
        "ants",
        "other",
      ],
      queen_mark_color: ["white", "yellow", "red", "green", "blue", "unmarked"],
      queen_sighted: ["yes", "no", "uncertain"],
      queen_status: ["marked", "virgin", "laying", "cell_check", "replaced"],
      revenue_category: [
        "honey_sales",
        "nucs",
        "queens",
        "pollination",
        "wax",
        "other",
      ],
      store_level: ["empty", "low", "moderate", "good", "full"],
      temperament: ["calm", "moderate", "defensive", "aggressive"],
      treatment_status: ["planned", "in_progress", "completed"],
    },
  },
} as const

