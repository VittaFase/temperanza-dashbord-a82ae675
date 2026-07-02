import { PedidoComItens } from "./pedidos";

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const gerarNotaHTML = (p: PedidoComItens): string => {
  const data = new Date(p.data_pedido).toLocaleString("pt-BR");
  const canal = p.canal === "atacado" ? "Atacado" : "Cliente Final";
  const numero = String(p.numero).padStart(6, "0");

  const cliente = p.cliente
    ? `
      <div class="block">
        <strong>${p.cliente.nome}</strong><br/>
        ${p.cliente.documento ? `Doc.: ${p.cliente.documento}<br/>` : ""}
        ${p.cliente.telefone ? `Tel.: ${p.cliente.telefone}<br/>` : ""}
        ${p.cliente.email ? `${p.cliente.email}<br/>` : ""}
        ${p.cliente.endereco ? `${p.cliente.endereco}${p.cliente.cidade ? ", " + p.cliente.cidade : ""}${p.cliente.estado ? "/" + p.cliente.estado : ""}` : ""}
      </div>`
    : `<div class="block muted">Consumidor não identificado</div>`;

  const linhas = p.itens
    .map(
      (i) => `
        <tr>
          <td>${i.nome_produto}</td>
          <td class="num">${i.quantidade}</td>
          <td class="num">${brl(i.preco_unitario)}</td>
          <td class="num">${brl(i.subtotal)}</td>
        </tr>`
    )
    .join("");

  return `<!doctype html><html lang="pt-BR"><head>
<meta charset="utf-8"/>
<title>Nota #${numero} — Temperanzza</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Roboto, sans-serif; color: #1a1512; padding: 32px; max-width: 800px; margin: auto; }
  h1 { font-family: Georgia, serif; letter-spacing: .1em; text-transform: uppercase; font-size: 22px; margin: 0; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1a1512; padding-bottom: 16px; margin-bottom: 24px; }
  .muted { color: #666; font-size: 12px; }
  .block { margin: 12px 0; font-size: 14px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 16px 0 24px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th, td { padding: 8px 10px; border-bottom: 1px solid #e5e0d8; font-size: 13px; text-align: left; }
  th { background: #f8f5ef; text-transform: uppercase; font-size: 11px; letter-spacing: .1em; }
  .num { text-align: right; font-variant-numeric: tabular-nums; }
  .total { margin-top: 16px; text-align: right; font-size: 18px; font-weight: 700; }
  .footer { margin-top: 40px; font-size: 11px; color: #888; text-align: center; border-top: 1px solid #e5e0d8; padding-top: 12px; }
  .badge { display: inline-block; padding: 3px 10px; border: 1px solid #1a1512; border-radius: 999px; font-size: 11px; text-transform: uppercase; letter-spacing: .12em; }
  @media print { body { padding: 0; } .no-print { display: none; } }
</style>
</head><body>
  <div class="header">
    <div>
      <h1>Temperanzza Gastronomia</h1>
      <div class="muted">Comprovante não fiscal</div>
    </div>
    <div style="text-align:right">
      <div class="badge">${canal}</div>
      <div class="block"><strong>Nº ${numero}</strong><br/><span class="muted">${data}</span></div>
    </div>
  </div>

  <div class="grid">
    <div>
      <div class="muted">Cliente</div>
      ${cliente}
    </div>
    <div>
      <div class="muted">Pedido</div>
      <div class="block">
        Itens: ${p.itens.length}<br/>
        Volume: ${p.itens.reduce((s, i) => s + i.quantidade, 0)} unidades
      </div>
    </div>
  </div>

  <table>
    <thead><tr><th>Produto</th><th class="num">Qtd</th><th class="num">Preço</th><th class="num">Subtotal</th></tr></thead>
    <tbody>${linhas}</tbody>
  </table>

  <div class="total">Total: ${brl(p.total)}</div>

  ${p.observacoes ? `<div class="block"><strong>Observações:</strong> ${p.observacoes}</div>` : ""}

  <div class="footer">Documento sem valor fiscal · Gerado pelo Temperanzza Dashboard</div>

  <div class="no-print" style="text-align:center; margin-top:24px">
    <button onclick="window.print()" style="padding:10px 22px; background:#1a1512; color:#fff; border:0; border-radius:6px; cursor:pointer; letter-spacing:.1em; text-transform:uppercase; font-size:12px;">Imprimir / Salvar PDF</button>
  </div>
</body></html>`;
};

export const abrirNota = (p: PedidoComItens) => {
  const html = gerarNotaHTML(p);
  const w = window.open("", "_blank", "width=900,height=1000");
  if (!w) return;
  w.document.write(html);
  w.document.close();
};
