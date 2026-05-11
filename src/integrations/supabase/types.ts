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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      attendance_anomalies: {
        Row: {
          anomaly_type: string
          attendance_log_id: string | null
          created_at: string
          details: Json | null
          id: string
          resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          teacher_id: string
        }
        Insert: {
          anomaly_type: string
          attendance_log_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          teacher_id: string
        }
        Update: {
          anomaly_type?: string
          attendance_log_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_anomalies_attendance_log_id_fkey"
            columns: ["attendance_log_id"]
            isOneToOne: false
            referencedRelation: "attendance_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_anomalies_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_anomalies_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_logs: {
        Row: {
          clock_in_at: string | null
          clock_out_at: string | null
          created_at: string
          device_id: string | null
          id: string
          log_date: string
          notes: string | null
          outcome: string
          source_ip: string | null
          teacher_id: string
          updated_at: string
          user_agent: string | null
          validation: string
        }
        Insert: {
          clock_in_at?: string | null
          clock_out_at?: string | null
          created_at?: string
          device_id?: string | null
          id?: string
          log_date?: string
          notes?: string | null
          outcome?: string
          source_ip?: string | null
          teacher_id: string
          updated_at?: string
          user_agent?: string | null
          validation?: string
        }
        Update: {
          clock_in_at?: string | null
          clock_out_at?: string | null
          created_at?: string
          device_id?: string | null
          id?: string
          log_date?: string
          notes?: string | null
          outcome?: string
          source_ip?: string | null
          teacher_id?: string
          updated_at?: string
          user_agent?: string | null
          validation?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_logs_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_policy: {
        Row: {
          absence_trigger: string
          earliest_sign_in: string
          grace_threshold_mins: number
          half_day_boundary: string
          id: number
          punctuality_limit: string
          standard_shift_end: string
          updated_at: string
          window_authorization: string
        }
        Insert: {
          absence_trigger?: string
          earliest_sign_in?: string
          grace_threshold_mins?: number
          half_day_boundary?: string
          id?: number
          punctuality_limit?: string
          standard_shift_end?: string
          updated_at?: string
          window_authorization?: string
        }
        Update: {
          absence_trigger?: string
          earliest_sign_in?: string
          grace_threshold_mins?: number
          half_day_boundary?: string
          id?: number
          punctuality_limit?: string
          standard_shift_end?: string
          updated_at?: string
          window_authorization?: string
        }
        Relationships: []
      }
      class_subjects: {
        Row: {
          class_id: string
          created_at: string
          id: string
          subject_id: string
          teacher_id: string | null
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          subject_id: string
          teacher_id?: string | null
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          subject_id?: string
          teacher_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_subjects_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_subjects_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          academic_year: string
          created_at: string
          grade_level: string
          homeroom_teacher_id: string | null
          id: string
          name: string
          stream: string | null
          updated_at: string
        }
        Insert: {
          academic_year: string
          created_at?: string
          grade_level: string
          homeroom_teacher_id?: string | null
          id?: string
          name: string
          stream?: string | null
          updated_at?: string
        }
        Update: {
          academic_year?: string
          created_at?: string
          grade_level?: string
          homeroom_teacher_id?: string | null
          id?: string
          name?: string
          stream?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_homeroom_teacher_id_fkey"
            columns: ["homeroom_teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          academic_year: string
          class_id: string
          created_at: string
          enrolled_at: string
          id: string
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          academic_year: string
          class_id: string
          created_at?: string
          enrolled_at?: string
          id?: string
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          academic_year?: string
          class_id?: string
          created_at?: string
          enrolled_at?: string
          id?: string
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_student_links: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          parent_profile_id: string
          relationship: string
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          parent_profile_id: string
          relationship?: string
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          parent_profile_id?: string
          relationship?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_student_links_parent_profile_id_fkey"
            columns: ["parent_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_student_links_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      student_attendance: {
        Row: {
          class_id: string
          created_at: string
          id: string
          log_date: string
          notes: string | null
          recorded_by_teacher_id: string | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          log_date?: string
          notes?: string | null
          recorded_by_teacher_id?: string | null
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          log_date?: string
          notes?: string | null
          recorded_by_teacher_id?: string | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_attendance_recorded_by_teacher_id_fkey"
            columns: ["recorded_by_teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          admission_no: string
          created_at: string
          current_class_id: string | null
          date_of_birth: string | null
          enrollment_date: string
          gender: string | null
          guardian_name: string | null
          guardian_phone: string | null
          id: string
          profile_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admission_no: string
          created_at?: string
          current_class_id?: string | null
          date_of_birth?: string | null
          enrollment_date?: string
          gender?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          profile_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admission_no?: string
          created_at?: string
          current_class_id?: string | null
          date_of_birth?: string | null
          enrollment_date?: string
          gender?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          profile_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_current_class_id_fkey"
            columns: ["current_class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      teachers: {
        Row: {
          created_at: string
          department: string | null
          employee_no: string
          hire_date: string | null
          id: string
          profile_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          employee_no: string
          hire_date?: string | null
          id?: string
          profile_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          employee_no?: string
          hire_date?: string | null
          id?: string
          profile_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teachers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      timetable_entries: {
        Row: {
          academic_year: string
          class_id: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          period: number
          room: string | null
          start_time: string
          subject_id: string
          teacher_id: string | null
          updated_at: string
        }
        Insert: {
          academic_year: string
          class_id: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          period: number
          room?: string | null
          start_time: string
          subject_id: string
          teacher_id?: string | null
          updated_at?: string
        }
        Update: {
          academic_year?: string
          class_id?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          period?: number
          room?: string | null
          start_time?: string
          subject_id?: string
          teacher_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "timetable_entries_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      current_student_id: { Args: never; Returns: string }
      current_teacher_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_parent_of_student: { Args: { _student_id: string }; Returns: boolean }
      teacher_teaches_class: { Args: { _class_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "teacher" | "student" | "parent"
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
      app_role: ["admin", "teacher", "student", "parent"],
    },
  },
} as const
