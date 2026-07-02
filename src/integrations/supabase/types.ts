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
      clientes: {
        Row: {
          cep: string | null
          cidade: string | null
          created_at: string
          documento: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          observacoes: string | null
          telefone: string | null
          tipo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cep?: string | null
          cidade?: string | null
          created_at?: string
          documento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          telefone?: string | null
          tipo?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cep?: string | null
          cidade?: string | null
          created_at?: string
          documento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          telefone?: string | null
          tipo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      itens_pedido: {
        Row: {
          created_at: string
          desconto: number
          id: string
          nome_produto: string
          pedido_id: string
          preco_unitario: number
          quantidade: number
          subtotal: number
          tempero_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          desconto?: number
          id?: string
          nome_produto: string
          pedido_id: string
          preco_unitario: number
          quantidade: number
          subtotal: number
          tempero_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          desconto?: number
          id?: string
          nome_produto?: string
          pedido_id?: string
          preco_unitario?: number
          quantidade?: number
          subtotal?: number
          tempero_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "itens_pedido_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_pedido_tempero_id_fkey"
            columns: ["tempero_id"]
            isOneToOne: false
            referencedRelation: "temperos"
            referencedColumns: ["id"]
          },
        ]
      }
      notas_nao_fiscais: {
        Row: {
          conteudo: Json
          created_at: string
          id: string
          numero: string
          pdf_path: string | null
          pedido_id: string
          user_id: string
        }
        Insert: {
          conteudo?: Json
          created_at?: string
          id?: string
          numero: string
          pdf_path?: string | null
          pedido_id: string
          user_id: string
        }
        Update: {
          conteudo?: Json
          created_at?: string
          id?: string
          numero?: string
          pdf_path?: string | null
          pedido_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notas_nao_fiscais_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedido_sequencia: {
        Row: {
          ultimo_numero: number
          user_id: string
        }
        Insert: {
          ultimo_numero?: number
          user_id: string
        }
        Update: {
          ultimo_numero?: number
          user_id?: string
        }
        Relationships: []
      }
      pedidos: {
        Row: {
          canal: string
          cliente_id: string | null
          created_at: string
          data_pedido: string
          desconto: number
          id: string
          numero: number
          observacoes: string | null
          status: string
          subtotal: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          canal?: string
          cliente_id?: string | null
          created_at?: string
          data_pedido?: string
          desconto?: number
          id?: string
          numero?: number
          observacoes?: string | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          canal?: string
          cliente_id?: string | null
          created_at?: string
          data_pedido?: string
          desconto?: number
          id?: string
          numero?: number
          observacoes?: string | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      temperos: {
        Row: {
          created_at: string
          ean: string | null
          estoque_atual: number
          estoque_minimo: number
          foto_path: string | null
          gramas_pote: number
          id: string
          nome: string
          ordem: number
          preco_kg: number
          sku: string | null
          tabela_nutricional: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ean?: string | null
          estoque_atual?: number
          estoque_minimo?: number
          foto_path?: string | null
          gramas_pote?: number
          id?: string
          nome: string
          ordem?: number
          preco_kg?: number
          sku?: string | null
          tabela_nutricional?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ean?: string | null
          estoque_atual?: number
          estoque_minimo?: number
          foto_path?: string | null
          gramas_pote?: number
          id?: string
          nome?: string
          ordem?: number
          preco_kg?: number
          sku?: string | null
          tabela_nutricional?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      variaveis: {
        Row: {
          caixa: number
          comissao: number
          contabilidade_mensal: number
          custo_fabril: number
          lacre: number
          markup_atacado: number
          markup_cliente: number
          markup_industria: number
          pote: number
          producao_estimada: number
          rotulo: number
          simples_nacional: number
          termoencolhivel: number
          transporte: number
          updated_at: string
          user_id: string
        }
        Insert: {
          caixa?: number
          comissao?: number
          contabilidade_mensal?: number
          custo_fabril?: number
          lacre?: number
          markup_atacado?: number
          markup_cliente?: number
          markup_industria?: number
          pote?: number
          producao_estimada?: number
          rotulo?: number
          simples_nacional?: number
          termoencolhivel?: number
          transporte?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          caixa?: number
          comissao?: number
          contabilidade_mensal?: number
          custo_fabril?: number
          lacre?: number
          markup_atacado?: number
          markup_cliente?: number
          markup_industria?: number
          pote?: number
          producao_estimada?: number
          rotulo?: number
          simples_nacional?: number
          termoencolhivel?: number
          transporte?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
    Enums: {},
  },
} as const
