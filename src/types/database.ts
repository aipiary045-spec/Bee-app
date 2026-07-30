export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      apiaries: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          location: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          location?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          location?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      hives: {
        Row: {
          id: string;
          apiary_id: string;
          name: string;
          status: Database["public"]["Enums"]["hive_status"];
          frame_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          apiary_id: string;
          name: string;
          status?: Database["public"]["Enums"]["hive_status"];
          frame_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          apiary_id?: string;
          name?: string;
          status?: Database["public"]["Enums"]["hive_status"];
          frame_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "hives_apiary_id_fkey";
            columns: ["apiary_id"];
            isOneToOne: false;
            referencedRelation: "apiaries";
            referencedColumns: ["id"];
          },
        ];
      };
      inspections: {
        Row: {
          id: string;
          hive_id: string;
          date: string;
          queen_spotted: boolean;
          brood_pattern: Database["public"]["Enums"]["brood_pattern"] | null;
          temperament: Database["public"]["Enums"]["temperament"] | null;
          notes: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hive_id: string;
          date?: string;
          queen_spotted?: boolean;
          brood_pattern?: Database["public"]["Enums"]["brood_pattern"] | null;
          temperament?: Database["public"]["Enums"]["temperament"] | null;
          notes?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          hive_id?: string;
          date?: string;
          queen_spotted?: boolean;
          brood_pattern?: Database["public"]["Enums"]["brood_pattern"] | null;
          temperament?: Database["public"]["Enums"]["temperament"] | null;
          notes?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inspections_hive_id_fkey";
            columns: ["hive_id"];
            isOneToOne: false;
            referencedRelation: "hives";
            referencedColumns: ["id"];
          },
        ];
      };
      queen_logs: {
        Row: {
          id: string;
          hive_id: string;
          inspection_id: string | null;
          status: Database["public"]["Enums"]["queen_status"];
          mark_color: Database["public"]["Enums"]["queen_mark_color"] | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          hive_id: string;
          inspection_id?: string | null;
          status: Database["public"]["Enums"]["queen_status"];
          mark_color?: Database["public"]["Enums"]["queen_mark_color"] | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          hive_id?: string;
          inspection_id?: string | null;
          status?: Database["public"]["Enums"]["queen_status"];
          mark_color?: Database["public"]["Enums"]["queen_mark_color"] | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "queen_logs_hive_id_fkey";
            columns: ["hive_id"];
            isOneToOne: false;
            referencedRelation: "hives";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "queen_logs_inspection_id_fkey";
            columns: ["inspection_id"];
            isOneToOne: false;
            referencedRelation: "inspections";
            referencedColumns: ["id"];
          },
        ];
      };
      mite_counts: {
        Row: {
          id: string;
          hive_id: string;
          inspection_id: string | null;
          method: Database["public"]["Enums"]["mite_method"];
          count: number;
          threshold_exceeded: boolean;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          hive_id: string;
          inspection_id?: string | null;
          method: Database["public"]["Enums"]["mite_method"];
          count: number;
          threshold_exceeded?: boolean;
          date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          hive_id?: string;
          inspection_id?: string | null;
          method?: Database["public"]["Enums"]["mite_method"];
          count?: number;
          threshold_exceeded?: boolean;
          date?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mite_counts_hive_id_fkey";
            columns: ["hive_id"];
            isOneToOne: false;
            referencedRelation: "hives";
            referencedColumns: ["id"];
          },
        ];
      };
      treatments: {
        Row: {
          id: string;
          hive_id: string;
          product_name: string;
          start_date: string;
          end_date: string | null;
          dosage: string | null;
          status: Database["public"]["Enums"]["treatment_status"];
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hive_id: string;
          product_name: string;
          start_date: string;
          end_date?: string | null;
          dosage?: string | null;
          status?: Database["public"]["Enums"]["treatment_status"];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          hive_id?: string;
          product_name?: string;
          start_date?: string;
          end_date?: string | null;
          dosage?: string | null;
          status?: Database["public"]["Enums"]["treatment_status"];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "treatments_hive_id_fkey";
            columns: ["hive_id"];
            isOneToOne: false;
            referencedRelation: "hives";
            referencedColumns: ["id"];
          },
        ];
      };
      honey_yields: {
        Row: {
          id: string;
          hive_id: string;
          harvest_date: string;
          year: number;
          weight_lbs: number;
          frames_harvested: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          hive_id: string;
          harvest_date: string;
          weight_lbs: number;
          frames_harvested?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          hive_id?: string;
          harvest_date?: string;
          weight_lbs?: number;
          frames_harvested?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "honey_yields_hive_id_fkey";
            columns: ["hive_id"];
            isOneToOne: false;
            referencedRelation: "hives";
            referencedColumns: ["id"];
          },
        ];
      };
      expenses: {
        Row: {
          id: string;
          apiary_id: string;
          hive_id: string | null;
          category: Database["public"]["Enums"]["expense_category"];
          amount: number;
          date: string;
          description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          apiary_id: string;
          hive_id?: string | null;
          category: Database["public"]["Enums"]["expense_category"];
          amount: number;
          date?: string;
          description: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          apiary_id?: string;
          hive_id?: string | null;
          category?: Database["public"]["Enums"]["expense_category"];
          amount?: number;
          date?: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "expenses_apiary_id_fkey";
            columns: ["apiary_id"];
            isOneToOne: false;
            referencedRelation: "apiaries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expenses_hive_id_fkey";
            columns: ["hive_id"];
            isOneToOne: false;
            referencedRelation: "hives";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      user_owns_hive: {
        Args: { hive_uuid: string };
        Returns: boolean;
      };
      user_owns_apiary: {
        Args: { apiary_uuid: string };
        Returns: boolean;
      };
    };
    Enums: {
      hive_status: "active" | "inactive" | "deadout";
      brood_pattern: "excellent" | "good" | "fair" | "spotty" | "poor" | "none";
      temperament: "calm" | "moderate" | "defensive" | "aggressive";
      queen_status: "marked" | "virgin" | "laying" | "cell_check" | "replaced";
      queen_mark_color: "white" | "yellow" | "red" | "green" | "blue" | "unmarked";
      mite_method: "alcohol_wash" | "sugar_roll" | "sticky_board";
      treatment_status: "planned" | "in_progress" | "completed";
      expense_category: "equipment" | "treatments" | "feed" | "administrative" | "other";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
