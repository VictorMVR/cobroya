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
    PostgrestVersion: "13.0.5"
  }
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
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
      categorias: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          nombre: string
          orden: number | null
          tenant_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          nombre: string
          orden?: number | null
          tenant_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          nombre?: string
          orden?: number | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categorias_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          created_at: string | null
          credito_limite: number | null
          credito_usado: number | null
          email: string | null
          id: string
          nombre: string
          telefono: string | null
          tenant_id: string | null
        }
        Insert: {
          created_at?: string | null
          credito_limite?: number | null
          credito_usado?: number | null
          email?: string | null
          id?: string
          nombre: string
          telefono?: string | null
          tenant_id?: string | null
        }
        Update: {
          created_at?: string | null
          credito_limite?: number | null
          credito_usado?: number | null
          email?: string | null
          id?: string
          nombre?: string
          telefono?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      compras: {
        Row: {
          created_at: string | null
          estatus_id: string | null
          id: string
          notas: string | null
          proveedor_id: string | null
          sucursal_id: string | null
          total: number | null
          usuario_id: string | null
        }
        Insert: {
          created_at?: string | null
          estatus_id?: string | null
          id?: string
          notas?: string | null
          proveedor_id?: string | null
          sucursal_id?: string | null
          total?: number | null
          usuario_id?: string | null
        }
        Update: {
          created_at?: string | null
          estatus_id?: string | null
          id?: string
          notas?: string | null
          proveedor_id?: string | null
          sucursal_id?: string | null
          total?: number | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compras_estatus_id_fkey"
            columns: ["estatus_id"]
            isOneToOne: false
            referencedRelation: "estatus_compra"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compras_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compras_sucursal_id_fkey"
            columns: ["sucursal_id"]
            isOneToOne: false
            referencedRelation: "sucursales"
            referencedColumns: ["id"]
          },
        ]
      }
      cuentas: {
        Row: {
          cliente_id: string | null
          cliente_nombre: string | null
          closed_at: string | null
          created_at: string | null
          estatus_id: string | null
          id: string
          sucursal_id: string | null
          total: number | null
          usuario_id: string | null
        }
        Insert: {
          cliente_id?: string | null
          cliente_nombre?: string | null
          closed_at?: string | null
          created_at?: string | null
          estatus_id?: string | null
          id?: string
          sucursal_id?: string | null
          total?: number | null
          usuario_id?: string | null
        }
        Update: {
          cliente_id?: string | null
          cliente_nombre?: string | null
          closed_at?: string | null
          created_at?: string | null
          estatus_id?: string | null
          id?: string
          sucursal_id?: string | null
          total?: number | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cuentas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuentas_estatus_id_fkey"
            columns: ["estatus_id"]
            isOneToOne: false
            referencedRelation: "estatus_cuenta"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuentas_sucursal_id_fkey"
            columns: ["sucursal_id"]
            isOneToOne: false
            referencedRelation: "sucursales"
            referencedColumns: ["id"]
          },
        ]
      }
      estatus_compra: {
        Row: {
          afecta_inventario: boolean | null
          codigo: string
          color: string | null
          created_at: string | null
          id: string
          nombre: string
          orden: number | null
          tenant_id: string | null
        }
        Insert: {
          afecta_inventario?: boolean | null
          codigo: string
          color?: string | null
          created_at?: string | null
          id?: string
          nombre: string
          orden?: number | null
          tenant_id?: string | null
        }
        Update: {
          afecta_inventario?: boolean | null
          codigo?: string
          color?: string | null
          created_at?: string | null
          id?: string
          nombre?: string
          orden?: number | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estatus_compra_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      estatus_cuenta: {
        Row: {
          codigo: string
          color: string | null
          created_at: string | null
          id: string
          nombre: string
          orden: number | null
          permite_edicion: boolean | null
          permite_pago: boolean | null
          tenant_id: string | null
        }
        Insert: {
          codigo: string
          color?: string | null
          created_at?: string | null
          id?: string
          nombre: string
          orden?: number | null
          permite_edicion?: boolean | null
          permite_pago?: boolean | null
          tenant_id?: string | null
        }
        Update: {
          codigo?: string
          color?: string | null
          created_at?: string | null
          id?: string
          nombre?: string
          orden?: number | null
          permite_edicion?: boolean | null
          permite_pago?: boolean | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estatus_cuenta_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      estatus_venta: {
        Row: {
          codigo: string
          color: string | null
          created_at: string | null
          id: string
          nombre: string
          orden: number | null
          tenant_id: string | null
        }
        Insert: {
          codigo: string
          color?: string | null
          created_at?: string | null
          id?: string
          nombre: string
          orden?: number | null
          tenant_id?: string | null
        }
        Update: {
          codigo?: string
          color?: string | null
          created_at?: string | null
          id?: string
          nombre?: string
          orden?: number | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estatus_venta_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventario: {
        Row: {
          id: string
          producto_id: string | null
          stock: number | null
          stock_minimo: number | null
          sucursal_id: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          producto_id?: string | null
          stock?: number | null
          stock_minimo?: number | null
          sucursal_id?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          producto_id?: string | null
          stock?: number | null
          stock_minimo?: number | null
          sucursal_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventario_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventario_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "v_productos_pos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventario_sucursal_id_fkey"
            columns: ["sucursal_id"]
            isOneToOne: false
            referencedRelation: "sucursales"
            referencedColumns: ["id"]
          },
        ]
      }
      items_compra: {
        Row: {
          cantidad: number
          compra_id: string | null
          costo_unit: number
          created_at: string | null
          id: string
          producto_id: string | null
          subtotal: number
        }
        Insert: {
          cantidad: number
          compra_id?: string | null
          costo_unit: number
          created_at?: string | null
          id?: string
          producto_id?: string | null
          subtotal: number
        }
        Update: {
          cantidad?: number
          compra_id?: string | null
          costo_unit?: number
          created_at?: string | null
          id?: string
          producto_id?: string | null
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "items_compra_compra_id_fkey"
            columns: ["compra_id"]
            isOneToOne: false
            referencedRelation: "compras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_compra_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_compra_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "v_productos_pos"
            referencedColumns: ["id"]
          },
        ]
      }
      items_cuenta: {
        Row: {
          cantidad: number | null
          created_at: string | null
          cuenta_id: string | null
          id: string
          precio_unit: number
          producto_id: string | null
          subtotal: number
        }
        Insert: {
          cantidad?: number | null
          created_at?: string | null
          cuenta_id?: string | null
          id?: string
          precio_unit: number
          producto_id?: string | null
          subtotal: number
        }
        Update: {
          cantidad?: number | null
          created_at?: string | null
          cuenta_id?: string | null
          id?: string
          precio_unit?: number
          producto_id?: string | null
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "items_cuenta_cuenta_id_fkey"
            columns: ["cuenta_id"]
            isOneToOne: false
            referencedRelation: "cuentas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_cuenta_cuenta_id_fkey"
            columns: ["cuenta_id"]
            isOneToOne: false
            referencedRelation: "v_cuentas_abiertas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_cuenta_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_cuenta_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "v_productos_pos"
            referencedColumns: ["id"]
          },
        ]
      }
      items_venta: {
        Row: {
          cantidad: number
          created_at: string | null
          id: string
          precio_unit: number
          producto_id: string | null
          subtotal: number
          venta_id: string | null
        }
        Insert: {
          cantidad?: number
          created_at?: string | null
          id?: string
          precio_unit: number
          producto_id?: string | null
          subtotal: number
          venta_id?: string | null
        }
        Update: {
          cantidad?: number
          created_at?: string | null
          id?: string
          precio_unit?: number
          producto_id?: string | null
          subtotal?: number
          venta_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "items_venta_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_venta_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "v_productos_pos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_venta_venta_id_fkey"
            columns: ["venta_id"]
            isOneToOne: false
            referencedRelation: "v_ventas_completas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_venta_venta_id_fkey"
            columns: ["venta_id"]
            isOneToOne: false
            referencedRelation: "ventas"
            referencedColumns: ["id"]
          },
        ]
      }
      metodos_pago: {
        Row: {
          activo: boolean | null
          codigo: string
          created_at: string | null
          icono: string | null
          id: string
          nombre: string
          orden: number | null
          requiere_cambio: boolean | null
          requiere_referencia: boolean | null
          tenant_id: string | null
        }
        Insert: {
          activo?: boolean | null
          codigo: string
          created_at?: string | null
          icono?: string | null
          id?: string
          nombre: string
          orden?: number | null
          requiere_cambio?: boolean | null
          requiere_referencia?: boolean | null
          tenant_id?: string | null
        }
        Update: {
          activo?: boolean | null
          codigo?: string
          created_at?: string | null
          icono?: string | null
          id?: string
          nombre?: string
          orden?: number | null
          requiere_cambio?: boolean | null
          requiere_referencia?: boolean | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "metodos_pago_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pagos_venta: {
        Row: {
          cambio: number | null
          created_at: string | null
          id: string
          metodo_pago_id: string | null
          monto: number
          pago_recibido: number | null
          referencia: string | null
          venta_id: string | null
        }
        Insert: {
          cambio?: number | null
          created_at?: string | null
          id?: string
          metodo_pago_id?: string | null
          monto: number
          pago_recibido?: number | null
          referencia?: string | null
          venta_id?: string | null
        }
        Update: {
          cambio?: number | null
          created_at?: string | null
          id?: string
          metodo_pago_id?: string | null
          monto?: number
          pago_recibido?: number | null
          referencia?: string | null
          venta_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pagos_venta_metodo_pago_id_fkey"
            columns: ["metodo_pago_id"]
            isOneToOne: false
            referencedRelation: "metodos_pago"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_venta_venta_id_fkey"
            columns: ["venta_id"]
            isOneToOne: false
            referencedRelation: "v_ventas_completas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_venta_venta_id_fkey"
            columns: ["venta_id"]
            isOneToOne: false
            referencedRelation: "ventas"
            referencedColumns: ["id"]
          },
        ]
      }
      perfiles: {
        Row: {
          activo: boolean | null
          created_at: string | null
          id: string
          nombre: string
          rol: string
          sucursal_id: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          id: string
          nombre: string
          rol: string
          sucursal_id?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          id?: string
          nombre?: string
          rol?: string
          sucursal_id?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_perfil_sucursal"
            columns: ["sucursal_id"]
            isOneToOne: false
            referencedRelation: "sucursales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      productos: {
        Row: {
          activo: boolean | null
          cantidad_paquete: number | null
          categoria_id: string | null
          codigo_barras: string | null
          codigo_interno: string | null
          created_at: string | null
          descripcion: string | null
          es_paquete: boolean | null
          id: string
          imagen_url: string | null
          nombre: string
          precio_venta: number
          tenant_id: string | null
        }
        Insert: {
          activo?: boolean | null
          cantidad_paquete?: number | null
          categoria_id?: string | null
          codigo_barras?: string | null
          codigo_interno?: string | null
          created_at?: string | null
          descripcion?: string | null
          es_paquete?: boolean | null
          id?: string
          imagen_url?: string | null
          nombre: string
          precio_venta: number
          tenant_id?: string | null
        }
        Update: {
          activo?: boolean | null
          cantidad_paquete?: number | null
          categoria_id?: string | null
          codigo_barras?: string | null
          codigo_interno?: string | null
          created_at?: string | null
          descripcion?: string | null
          es_paquete?: boolean | null
          id?: string
          imagen_url?: string | null
          nombre?: string
          precio_venta?: number
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "productos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      proveedores: {
        Row: {
          contacto: string | null
          created_at: string | null
          email: string | null
          id: string
          nombre: string
          telefono: string | null
          tenant_id: string | null
        }
        Insert: {
          contacto?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nombre: string
          telefono?: string | null
          tenant_id?: string | null
        }
        Update: {
          contacto?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nombre?: string
          telefono?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proveedores_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      proveedores_productos: {
        Row: {
          codigo_proveedor: string | null
          costo_ultima: number | null
          id: string
          producto_id: string | null
          proveedor_id: string | null
          updated_at: string | null
        }
        Insert: {
          codigo_proveedor?: string | null
          costo_ultima?: number | null
          id?: string
          producto_id?: string | null
          proveedor_id?: string | null
          updated_at?: string | null
        }
        Update: {
          codigo_proveedor?: string | null
          costo_ultima?: number | null
          id?: string
          producto_id?: string | null
          proveedor_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proveedores_productos_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proveedores_productos_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "v_productos_pos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proveedores_productos_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
        ]
      }
      sucursales: {
        Row: {
          activa: boolean | null
          created_at: string | null
          direccion: string | null
          id: string
          nombre: string
          tenant_id: string | null
        }
        Insert: {
          activa?: boolean | null
          created_at?: string | null
          direccion?: string | null
          id?: string
          nombre: string
          tenant_id?: string | null
        }
        Update: {
          activa?: boolean | null
          created_at?: string | null
          direccion?: string | null
          id?: string
          nombre?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sucursales_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          activo: boolean | null
          created_at: string | null
          id: string
          nombre: string
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          id?: string
          nombre: string
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      ventas: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          cuenta_id: string | null
          estatus_id: string | null
          id: string
          sucursal_id: string | null
          total: number
          usuario_id: string | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string | null
          cuenta_id?: string | null
          estatus_id?: string | null
          id?: string
          sucursal_id?: string | null
          total: number
          usuario_id?: string | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string | null
          cuenta_id?: string | null
          estatus_id?: string | null
          id?: string
          sucursal_id?: string | null
          total?: number
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ventas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ventas_cuenta_id_fkey"
            columns: ["cuenta_id"]
            isOneToOne: false
            referencedRelation: "cuentas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ventas_cuenta_id_fkey"
            columns: ["cuenta_id"]
            isOneToOne: false
            referencedRelation: "v_cuentas_abiertas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ventas_estatus_id_fkey"
            columns: ["estatus_id"]
            isOneToOne: false
            referencedRelation: "estatus_venta"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ventas_sucursal_id_fkey"
            columns: ["sucursal_id"]
            isOneToOne: false
            referencedRelation: "sucursales"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_cuentas_abiertas: {
        Row: {
          cliente_id: string | null
          cliente_nombre: string | null
          cliente_nombre_reg: string | null
          closed_at: string | null
          created_at: string | null
          estatus_codigo: string | null
          estatus_color: string | null
          estatus_id: string | null
          estatus_nombre: string | null
          id: string | null
          num_items: number | null
          permite_edicion: boolean | null
          permite_pago: boolean | null
          sucursal_id: string | null
          total: number | null
          total_calculado: number | null
          usuario_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cuentas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuentas_estatus_id_fkey"
            columns: ["estatus_id"]
            isOneToOne: false
            referencedRelation: "estatus_cuenta"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuentas_sucursal_id_fkey"
            columns: ["sucursal_id"]
            isOneToOne: false
            referencedRelation: "sucursales"
            referencedColumns: ["id"]
          },
        ]
      }
      v_productos_pos: {
        Row: {
          activo: boolean | null
          cantidad_paquete: number | null
          categoria_color: string | null
          categoria_id: string | null
          categoria_nombre: string | null
          codigo_barras: string | null
          codigo_interno: string | null
          created_at: string | null
          es_paquete: boolean | null
          id: string | null
          imagen_url: string | null
          nombre: string | null
          precio_venta: number | null
          stock_disponible: number | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "productos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      v_ventas_completas: {
        Row: {
          cliente_final: string | null
          cliente_id: string | null
          cliente_nombre: string | null
          cliente_registrado: string | null
          created_at: string | null
          cuenta_id: string | null
          estatus_color: string | null
          estatus_id: string | null
          estatus_nombre: string | null
          id: string | null
          sucursal_id: string | null
          total: number | null
          usuario_email: string | null
          usuario_id: string | null
          usuario_nombre: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ventas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ventas_cuenta_id_fkey"
            columns: ["cuenta_id"]
            isOneToOne: false
            referencedRelation: "cuentas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ventas_cuenta_id_fkey"
            columns: ["cuenta_id"]
            isOneToOne: false
            referencedRelation: "v_cuentas_abiertas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ventas_estatus_id_fkey"
            columns: ["estatus_id"]
            isOneToOne: false
            referencedRelation: "estatus_venta"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ventas_sucursal_id_fkey"
            columns: ["sucursal_id"]
            isOneToOne: false
            referencedRelation: "sucursales"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      inicializar_catalogos_tenant: {
        Args: { p_tenant_id: string }
        Returns: undefined
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
