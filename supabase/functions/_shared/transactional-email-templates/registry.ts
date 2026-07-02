import type { ComponentType } from 'npm:react@18.3.1'
import { template as notaPedido } from './nota-pedido.tsx'

export type TemplateEntry = {
  component: ComponentType<any>
  subject: string | ((data: any) => string)
  displayName?: string
  previewData?: Record<string, unknown>
  to?: string
}

export const TEMPLATES: Record<string, TemplateEntry> = {
  'nota-pedido': notaPedido,
}
