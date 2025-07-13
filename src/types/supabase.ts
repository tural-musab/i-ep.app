export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      class_students: {
        Row: {
          class_id: string
          created_at: string | null
          enrollment_date: string
          id: string
          status: string
          student_id: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          class_id: string
          created_at?: string | null
          enrollment_date?: string
          id?: string
          status?: string
          student_id: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string | null
          enrollment_date?: string
          id?: string
          status?: string
          student_id?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_students_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      class_teachers: {
        Row: {
          class_id: string
          created_at: string | null
          id: string
          role: string
          subject: string | null
          teacher_id: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          class_id: string
          created_at?: string | null
          id?: string
          role?: string
          subject?: string | null
          teacher_id: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string | null
          id?: string
          role?: string
          subject?: string | null
          teacher_id?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_teachers_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_teachers_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_teachers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          academic_year: string
          capacity: number
          created_at: string | null
          grade_level: number
          id: string
          is_active: boolean | null
          name: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          academic_year: string
          capacity?: number
          created_at?: string | null
          grade_level: number
          id?: string
          is_active?: boolean | null
          name: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          capacity?: number
          created_at?: string | null
          grade_level?: number
          id?: string
          is_active?: boolean | null
          name?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      file_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_system: boolean | null
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_system?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "file_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "file_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      file_category_assignments: {
        Row: {
          assigned_at: string | null
          category_id: string
          file_id: string
        }
        Insert: {
          assigned_at?: string | null
          category_id: string
          file_id: string
        }
        Update: {
          assigned_at?: string | null
          category_id?: string
          file_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_category_assignments_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "file_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_category_assignments_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      file_migrations: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          file_id: string
          from_path: string
          from_provider: string
          id: string
          retry_count: number | null
          started_at: string | null
          status: string
          to_path: string | null
          to_provider: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          file_id: string
          from_path: string
          from_provider: string
          id?: string
          retry_count?: number | null
          started_at?: string | null
          status?: string
          to_path?: string | null
          to_provider: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          file_id?: string
          from_path?: string
          from_provider?: string
          id?: string
          retry_count?: number | null
          started_at?: string | null
          status?: string
          to_path?: string | null
          to_provider?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_migrations_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      file_shares: {
        Row: {
          access_count: number | null
          access_token: string | null
          can_delete: boolean | null
          can_download: boolean | null
          can_view: boolean | null
          created_at: string | null
          expires_at: string | null
          file_id: string
          id: string
          last_accessed_at: string | null
          password_hash: string | null
          shared_by: string
          shared_with_id: string | null
          shared_with_type: string
        }
        Insert: {
          access_count?: number | null
          access_token?: string | null
          can_delete?: boolean | null
          can_download?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          file_id: string
          id?: string
          last_accessed_at?: string | null
          password_hash?: string | null
          shared_by: string
          shared_with_id?: string | null
          shared_with_type: string
        }
        Update: {
          access_count?: number | null
          access_token?: string | null
          can_delete?: boolean | null
          can_download?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          file_id?: string
          id?: string
          last_accessed_at?: string | null
          password_hash?: string | null
          shared_by?: string
          shared_with_id?: string | null
          shared_with_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_shares_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_shares_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          access_count: number | null
          access_level: string
          cdn_url: string | null
          created_at: string | null
          deleted_at: string | null
          file_hash: string | null
          filename: string
          folder_path: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          mime_type: string | null
          original_filename: string
          related_to_id: string | null
          related_to_type: string | null
          size_bytes: number
          status: string
          storage_bucket: string | null
          storage_path: string
          storage_provider: string
          tenant_id: string
          updated_at: string | null
          uploaded_by: string
        }
        Insert: {
          access_count?: number | null
          access_level?: string
          cdn_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          file_hash?: string | null
          filename: string
          folder_path?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          mime_type?: string | null
          original_filename: string
          related_to_id?: string | null
          related_to_type?: string | null
          size_bytes: number
          status?: string
          storage_bucket?: string | null
          storage_path: string
          storage_provider?: string
          tenant_id: string
          updated_at?: string | null
          uploaded_by: string
        }
        Update: {
          access_count?: number | null
          access_level?: string
          cdn_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          file_hash?: string | null
          filename?: string
          folder_path?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          mime_type?: string | null
          original_filename?: string
          related_to_id?: string | null
          related_to_type?: string | null
          size_bytes?: number
          status?: string
          storage_bucket?: string | null
          storage_path?: string
          storage_provider?: string
          tenant_id?: string
          updated_at?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "files_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_quotas: {
        Row: {
          alert_at_percent: number | null
          current_file_count: number | null
          last_alert_sent_at: string | null
          max_file_count: number | null
          max_file_size_mb: number | null
          tenant_id: string
          total_quota_mb: number | null
          updated_at: string | null
          usage_by_type: Json | null
          used_storage_mb: number | null
        }
        Insert: {
          alert_at_percent?: number | null
          current_file_count?: number | null
          last_alert_sent_at?: string | null
          max_file_count?: number | null
          max_file_size_mb?: number | null
          tenant_id: string
          total_quota_mb?: number | null
          updated_at?: string | null
          usage_by_type?: Json | null
          used_storage_mb?: number | null
        }
        Update: {
          alert_at_percent?: number | null
          current_file_count?: number | null
          last_alert_sent_at?: string | null
          max_file_count?: number | null
          max_file_size_mb?: number | null
          tenant_id?: string
          total_quota_mb?: number | null
          updated_at?: string | null
          usage_by_type?: Json | null
          used_storage_mb?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "storage_quotas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          additional_info: Json | null
          birth_date: string | null
          created_at: string | null
          first_name: string
          gender: string | null
          id: string
          is_active: boolean | null
          last_name: string
          student_number: string | null
          tenant_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          additional_info?: Json | null
          birth_date?: string | null
          created_at?: string | null
          first_name: string
          gender?: string | null
          id?: string
          is_active?: boolean | null
          last_name: string
          student_number?: string | null
          tenant_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          additional_info?: Json | null
          birth_date?: string | null
          created_at?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string
          student_number?: string | null
          tenant_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          additional_info: Json | null
          created_at: string | null
          first_name: string
          id: string
          is_active: boolean | null
          last_name: string
          specialization: string | null
          teacher_number: string | null
          tenant_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          additional_info?: Json | null
          created_at?: string | null
          first_name: string
          id?: string
          is_active?: boolean | null
          last_name: string
          specialization?: string | null
          teacher_number?: string | null
          tenant_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          additional_info?: Json | null
          created_at?: string | null
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_name?: string
          specialization?: string | null
          teacher_number?: string | null
          tenant_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teachers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teachers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          settings: Json | null
          subdomain: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          settings?: Json | null
          subdomain: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          settings?: Json | null
          subdomain?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          role: string
          settings: Json | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          role?: string
          settings?: Json | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          role?: string
          settings?: Json | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_folder_size: {
        Args: { p_tenant_id: string; p_folder_path: string }
        Returns: number
      }
      current_teacher_has_class_access: {
        Args: { class_id: string }
        Returns: boolean
      }
      current_teacher_has_student_access: {
        Args: { student_id: string }
        Returns: boolean
      }
      get_current_tenant_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_tenant_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_tenant_admin: {
        Args: { tenant_id: string }
        Returns: boolean
      }
      teacher_has_class: {
        Args: { teacher_id: string; class_id: string; schema_name?: string }
        Returns: boolean
      }
      teacher_has_student: {
        Args: { teacher_id: string; student_id: string; schema_name?: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

