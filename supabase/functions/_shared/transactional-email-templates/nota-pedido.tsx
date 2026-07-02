/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text,
  Row, Column,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Item {
  nome_produto?: string
  quantidade?: number
  preco_unitario?: number
  subtotal?: number
}

interface Props {
  numero?: string | number
  data?: string
  clienteNome?: string
  canal?: string
  itens?: Item[]
  subtotal?: number
  desconto?: number
  total?: number
  observacoes?: string
}

const brl = (n = 0) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const Email = ({
  numero = '000000',
  data = new Date().toLocaleString('pt-BR'),
  clienteNome = 'Cliente',
  canal = 'Cliente Final',
  itens = [],
  subtotal = 0,
  desconto = 0,
  total = 0,
  observacoes,
}: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Nota nº {String(numero).padStart(6, '0')} — Temperanzza</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <img
            src="https://temperanza-dashbord.lovable.app/__l5e/assets-v1/44216df4-51ce-491b-8b04-0db5dc0ddced/temperanzza-seal.jpeg"
            alt="Temperanzza"
            width="72"
            height="72"
            style={{ display: 'block', margin: '0 auto 8px', borderRadius: '50%', objectFit: 'contain', background: '#f8f5ef', padding: '4px' }}
          />
          <Heading style={h1}>Temperanzza Condimentos</Heading>
          <Text style={muted}>Documento não fiscal</Text>
        </Section>

        <Section>
          <Row>
            <Column>
              <Text style={label}>Nota</Text>
              <Text style={value}>#{String(numero).padStart(6, '0')}</Text>
            </Column>
            <Column>
              <Text style={label}>Data</Text>
              <Text style={value}>{data}</Text>
            </Column>
            <Column>
              <Text style={label}>Canal</Text>
              <Text style={value}>{canal}</Text>
            </Column>
          </Row>
        </Section>

        <Hr style={hr} />

        <Section>
          <Text style={label}>Cliente</Text>
          <Text style={value}>{clienteNome}</Text>
        </Section>

        <Hr style={hr} />

        <Section>
          <Text style={label}>Itens</Text>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Produto</th>
                <th style={{ ...th, textAlign: 'right' }}>Qtd</th>
                <th style={{ ...th, textAlign: 'right' }}>Unit.</th>
                <th style={{ ...th, textAlign: 'right' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((i, idx) => (
                <tr key={idx}>
                  <td style={td}>{i.nome_produto}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{i.quantidade}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{brl(i.preco_unitario)}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{brl(i.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Hr style={hr} />

        <Section>
          <Row>
            <Column><Text style={muted}>Subtotal</Text></Column>
            <Column align="right"><Text style={value}>{brl(subtotal)}</Text></Column>
          </Row>
          {desconto > 0 && (
            <Row>
              <Column><Text style={muted}>Desconto</Text></Column>
              <Column align="right"><Text style={value}>- {brl(desconto)}</Text></Column>
            </Row>
          )}
          <Row>
            <Column><Text style={totalLabel}>Total</Text></Column>
            <Column align="right"><Text style={totalValue}>{brl(total)}</Text></Column>
          </Row>
        </Section>

        {observacoes && (
          <>
            <Hr style={hr} />
            <Section>
              <Text style={label}>Observações</Text>
              <Text style={value}>{observacoes}</Text>
            </Section>
          </>
        )}

        <Hr style={hr} />
        <Text style={footer}>
          Obrigado pela sua compra! — Temperanzza Gastronomia
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Props) =>
    `Nota nº ${String(d?.numero ?? '000000').padStart(6, '0')} — Temperanzza`,
  displayName: 'Nota do Pedido',
  previewData: {
    numero: 123,
    data: new Date().toLocaleString('pt-BR'),
    clienteNome: 'João da Silva',
    canal: 'Cliente Final',
    itens: [
      { nome_produto: 'Lemon Pepper 100g', quantidade: 2, preco_unitario: 22, subtotal: 44 },
      { nome_produto: 'Páprica Defumada 100g', quantidade: 1, preco_unitario: 20, subtotal: 20 },
    ],
    subtotal: 64,
    desconto: 4,
    total: 60,
    observacoes: 'Entregar até sexta-feira.',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, serif', color: '#1a1a1a' }
const container = { padding: '24px', maxWidth: '600px', margin: '0 auto' }
const header = { textAlign: 'center' as const, paddingBottom: '16px' }
const h1 = { fontSize: '24px', margin: '0', color: '#1a1a1a', letterSpacing: '0.5px' }
const muted = { color: '#6b6b6b', fontSize: '12px', margin: '4px 0' }
const label = { color: '#6b6b6b', fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.5px', margin: '0 0 4px' }
const value = { color: '#1a1a1a', fontSize: '14px', margin: '0 0 8px' }
const totalLabel = { fontSize: '16px', fontWeight: 700, color: '#1a1a1a', margin: '8px 0 0' }
const totalValue = { fontSize: '18px', fontWeight: 700, color: '#b91c1c', margin: '8px 0 0' }
const hr = { borderColor: '#e5e5e5', margin: '16px 0' }
const table = { width: '100%', borderCollapse: 'collapse' as const, marginTop: '8px' }
const th = { textAlign: 'left' as const, fontSize: '12px', color: '#6b6b6b', padding: '6px 4px', borderBottom: '1px solid #e5e5e5' }
const td = { fontSize: '13px', padding: '6px 4px', borderBottom: '1px solid #f0f0f0' }
const footer = { textAlign: 'center' as const, fontSize: '12px', color: '#6b6b6b', marginTop: '16px' }
