export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          subdomain: string
          plan_type: string
          settings: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          subdomain: string
          plan_type?: string
          settings?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          subdomain?: string
          plan_type?: string
          settings?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      tenant_domains: {
        Row: {
          id: string
          tenant_id: string
          domain: string
          is_primary: boolean
          is_verified: boolean
          type: string
          created_at: string
          verified_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          domain: string
          is_primary?: boolean
          is_verified?: boolean
          type?: string
          created_at?: string
          verified_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          domain?: string
          is_primary?: boolean
          is_verified?: boolean
          type?: string
          created_at?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_domains_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      tenant_usage_metrics: {
        Row: {
          id: string
          tenant_id: string
          metric_name: string
          metric_value: number
          recorded_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          metric_name: string
          metric_value?: number
          recorded_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          metric_name?: string
          metric_value?: number
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_usage_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          tenant_id: string
          email: string
          first_name: string
          last_name: string
          avatar_url: string | null
          role: string
          is_active: boolean
          verification_status: string
          preferences: Json
          metadata: Json
          created_at: string
          updated_at: string
          last_login_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id: string
          tenant_id: string
          email: string
          first_name: string
          last_name: string
          avatar_url?: string | null
          role: string
          is_active?: boolean
          verification_status?: string
          preferences?: Json
          metadata?: Json
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          email?: string
          first_name?: string
          last_name?: string
          avatar_url?: string | null
          role?: string
          is_active?: boolean
          verification_status?: string
          preferences?: Json
          metadata?: Json
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          deleted_at?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          bio: string | null
          phone: string | null
          address: string | null
          city: string | null
          country: string | null
          postal_code: string | null
          birth_date: string | null
          gender: string | null
          profile_picture: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bio?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          postal_code?: string | null
          birth_date?: string | null
          gender?: string | null
          profile_picture?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bio?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          postal_code?: string | null
          birth_date?: string | null
          gender?: string | null
          profile_picture?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: Record<string, never>
        Returns: string
      }
      is_super_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      is_tenant_admin: {
        Args: {
          tenant_id: string
        }
        Returns: boolean
      }
      get_user_tenant_id: {
        Args: Record<string, never>
        Returns: string | null
      }
      teacher_has_class: {
        Args: {
          teacher_id: string
          class_id: string
          schema_name?: string
        }
        Returns: boolean
      }
      current_teacher_has_class_access: {
        Args: {
          class_id: string
        }
        Returns: boolean
      }
      teacher_has_student: {
        Args: {
          teacher_id: string
          student_id: string
          schema_name?: string
        }
        Returns: boolean
      }
      current_teacher_has_student_access: {
        Args: {
          student_id: string
        }
        Returns: boolean
      }
      execute_raw_query: {
        Args: {
          query_text: string
          params?: unknown[]
        }
        Returns: unknown
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
  // Her tenant için dinamik şemalar - Burada sadece şema yapısını örnek olarak gösteriyoruz
  // Gerçek tenant şemaları dinamik olarak oluşturulacak
  tenant_schema: {
    Tables: {
      users: {
        Row: {
          id: string
          full_name: string
          email: string
          role: string
          avatar_url: string | null
          phone: string | null
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          email: string
          role: string
          avatar_url?: string | null
          phone?: string | null
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          role?: string
          avatar_url?: string | null
          phone?: string | null
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          id: string
          user_id: string | null
          student_number: string | null
          first_name: string
          last_name: string
          birth_date: string | null
          gender: string | null
          parent_id: string | null
          class_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          student_number?: string | null
          first_name: string
          last_name: string
          birth_date?: string | null
          gender?: string | null
          parent_id?: string | null
          class_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          student_number?: string | null
          first_name?: string
          last_name?: string
          birth_date?: string | null
          gender?: string | null
          parent_id?: string | null
          class_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          }
        ]
      }
      teachers: {
        Row: {
          id: string
          user_id: string | null
          first_name: string
          last_name: string
          specialty: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          first_name: string
          last_name: string
          specialty?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          first_name?: string
          last_name?: string
          specialty?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teachers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      classes: {
        Row: {
          id: string
          name: string
          grade_level: number
          academic_year: string
          main_teacher_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          grade_level: number
          academic_year: string
          main_teacher_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          grade_level?: number
          academic_year?: string
          main_teacher_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_main_teacher_id_fkey"
            columns: ["main_teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          }
        ]
      }
      teacher_class: {
        Row: {
          id: string
          teacher_id: string
          class_id: string
          subject: string
          created_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          class_id: string
          subject: string
          created_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          class_id?: string
          subject?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_class_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_class_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          }
        ]
      }
      grades: {
        Row: {
          id: string
          student_id: string
          teacher_id: string
          class_id: string
          subject: string
          exam_type: string
          score: number
          max_score: number
          exam_date: string
          comments: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          teacher_id: string
          class_id: string
          subject: string
          exam_type: string
          score: number
          max_score?: number
          exam_date: string
          comments?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          teacher_id?: string
          class_id?: string
          subject?: string
          exam_type?: string
          score?: number
          max_score?: number
          exam_date?: string
          comments?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          }
        ]
      }
      attendances: {
        Row: {
          id: string
          student_id: string
          class_id: string
          date: string
          status: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          class_id: string
          date: string
          status: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          class_id?: string
          date?: string
          status?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendances_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendances_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          }
        ]
      }
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          author_id: string
          target_audience: string[]
          is_published: boolean
          publish_date: string
          expiry_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          author_id: string
          target_audience: string[]
          is_published?: boolean
          publish_date?: string
          expiry_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          author_id?: string
          target_audience?: string[]
          is_published?: boolean
          publish_date?: string
          expiry_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string
          subject: string
          content: string
          is_read: boolean
          read_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          recipient_id: string
          subject: string
          content: string
          is_read?: boolean
          read_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          recipient_id?: string
          subject?: string
          content?: string
          is_read?: boolean
          read_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
  }
  management: {
    Functions: {
      get_tenant_schema: {
        Args: {
          tenant_id: string
        }
        Returns: string
      }
    }
  }
} 