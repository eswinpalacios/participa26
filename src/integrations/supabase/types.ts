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
      categorias_oed: {
        Row: {
          codigo: string
          descripcion: string
        }
        Insert: {
          codigo: string
          descripcion: string
        }
        Update: {
          codigo?: string
          descripcion?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          apellidos: string
          correo: string
          created_at: string
          id: string
          nombre: string
          whatsapp: string | null
        }
        Insert: {
          apellidos?: string
          correo: string
          created_at?: string
          id: string
          nombre?: string
          whatsapp?: string | null
        }
        Update: {
          apellidos?: string
          correo?: string
          created_at?: string
          id?: string
          nombre?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      proyecto_archivos: {
        Row: {
          created_at: string
          id: string
          mime: string | null
          proyecto_id: string
          tipo: Database["public"]["Enums"]["archivo_tipo"]
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          mime?: string | null
          proyecto_id: string
          tipo: Database["public"]["Enums"]["archivo_tipo"]
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          mime?: string | null
          proyecto_id?: string
          tipo?: Database["public"]["Enums"]["archivo_tipo"]
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "proyecto_archivos_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
        ]
      }
      proyecto_respuestas: {
        Row: {
          created_at: string
          id: string
          modulo: number
          pregunta: string
          proyecto_id: string
          respuesta: Json
        }
        Insert: {
          created_at?: string
          id?: string
          modulo: number
          pregunta: string
          proyecto_id: string
          respuesta: Json
        }
        Update: {
          created_at?: string
          id?: string
          modulo?: number
          pregunta?: string
          proyecto_id?: string
          respuesta?: Json
        }
        Relationships: [
          {
            foreignKeyName: "proyecto_respuestas_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
        ]
      }
      proyectos: {
        Row: {
          created_at: string
          destacado: boolean
          estado: number
          id: string
          oed_codigo: string | null
          oed_justificacion: string | null
          titulo: string
          updated_at: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          destacado?: boolean
          estado?: number
          id?: string
          oed_codigo?: string | null
          oed_justificacion?: string | null
          titulo?: string
          updated_at?: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          destacado?: boolean
          estado?: number
          id?: string
          oed_codigo?: string | null
          oed_justificacion?: string | null
          titulo?: string
          updated_at?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proyectos_oed_codigo_fkey"
            columns: ["oed_codigo"]
            isOneToOne: false
            referencedRelation: "categorias_oed"
            referencedColumns: ["codigo"]
          },
        ]
      }
      proyectos_historicos: {
        Row: {
          anio: number
          created_at: string
          id: string
          monto: number
          titulo: string
        }
        Insert: {
          anio: number
          created_at?: string
          id?: string
          monto?: number
          titulo: string
        }
        Update: {
          anio?: number
          created_at?: string
          id?: string
          monto?: number
          titulo?: string
        }
        Relationships: []
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
      videos_youtube: {
        Row: {
          created_at: string
          id: string
          orden: number
          titulo: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          orden?: number
          titulo: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          orden?: number
          titulo?: string
          url?: string
        }
        Relationships: []
      }
      votos: {
        Row: {
          created_at: string
          id: string
          proyecto_id: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          proyecto_id: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          id?: string
          proyecto_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "votos_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "agente" | "consulta"
      archivo_tipo: "problema" | "referencia"
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
      app_role: ["admin", "agente", "consulta"],
      archivo_tipo: ["problema", "referencia"],
    },
  },
} as const
