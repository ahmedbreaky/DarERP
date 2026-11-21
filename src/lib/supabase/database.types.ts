// Database types. Matches supabase/migrations.
// After changing the database you can regenerate this file with:
//   npx supabase gen types typescript --project-id <your-project-id> > src/lib/supabase/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: Database["public"]["Enums"]["app_role"];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          role?: Database["public"]["Enums"]["app_role"];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: Database["public"]["Enums"]["app_role"];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      permissions: {
        Row: { key: string; module: string; sort_order: number };
        Insert: { key: string; module: string; sort_order?: number };
        Update: { key?: string; module?: string; sort_order?: number };
        Relationships: [];
      };
      role_permissions: {
        Row: { role: Database["public"]["Enums"]["app_role"]; permission: string };
        Insert: { role: Database["public"]["Enums"]["app_role"]; permission: string };
        Update: { role?: Database["public"]["Enums"]["app_role"]; permission?: string };
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_fkey";
            columns: ["permission"];
            isOneToOne: false;
            referencedRelation: "permissions";
            referencedColumns: ["key"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      has_permission: { Args: { perm: string }; Returns: boolean };
      my_permissions: { Args: Record<PropertyKey, never>; Returns: string[] };
    };
    Enums: {
      app_role: "admin" | "manager" | "staff";
    };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
