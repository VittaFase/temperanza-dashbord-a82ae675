import { PedidoComItens } from "./pedidos";
import sealAsset from "@/assets/temperanzza-seal.png.asset.json";

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const LOGO_URL = `${window.location.origin}${sealAsset.url}`;

// ============ NOTA A4 ============
export const gerarNotaHTML = (p: PedidoComItens): string => {
  const data = new Date(p.data_pedido).toLocaleString("pt-BR");
  const canal = p.canal === "atacado" ? "Atacado" : p.canal === "distribuidor" ? "Distribuidor" : "Cliente Final";
  const numero = String(p.numero).padStart(6, "0");
  const subtotal = p.subtotal || p.itens.reduce((s, i) => s + i.subtotal, 0);

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
          <td>${i.nome_produto}${i.desconto ? `<div class="muted" style="font-size:10px">Desc.: -${brl(i.desconto)}</div>` : ""}</td>
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
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  *, *::before, *::after { color: #1a1512 !important; -webkit-text-fill-color: #1a1512 !important; text-shadow: none !important; opacity: 1 !important; background-image: none !important; }
  .muted, .muted * { color: #555555 !important; -webkit-text-fill-color: #555555 !important; }
  .no-print button, .no-print button * { color: #ffffff !important; -webkit-text-fill-color: #ffffff !important; }
  html { background: #ffffff !important; }
  body { font-family: -apple-system, "Segoe UI", Roboto, sans-serif; color: #1a1512 !important; background: #ffffff !important; padding: 32px; max-width: 800px; margin: auto; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  h1 { font-family: Georgia, serif; letter-spacing: .1em; text-transform: uppercase; font-size: 22px; margin: 0; color: #1a1512; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1a1512; padding-bottom: 16px; margin-bottom: 24px; }
  .muted { color: #666; font-size: 12px; }
  .block { margin: 12px 0; font-size: 14px; color: #1a1512; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 16px 0 24px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; background: #ffffff; }
  th, td { padding: 8px 10px; border-bottom: 1px solid #e5e0d8; font-size: 13px; text-align: left; color: #1a1512; background: #ffffff; }
  th { background: #f8f5ef; text-transform: uppercase; font-size: 11px; letter-spacing: .1em; }
  .num { text-align: right; font-variant-numeric: tabular-nums; }
  .totais { margin-top: 16px; margin-left: auto; width: 260px; font-size: 13px; color: #1a1512; }
  .totais .row { display:flex; justify-content:space-between; padding: 4px 0; }
  .totais .grand { border-top: 2px solid #1a1512; margin-top: 6px; padding-top: 8px; font-size: 18px; font-weight: 700; }
  .footer { margin-top: 40px; font-size: 11px; color: #888; text-align: center; border-top: 1px solid #e5e0d8; padding-top: 12px; }
  .badge { display: inline-block; padding: 3px 10px; border: 1px solid #1a1512; border-radius: 999px; font-size: 11px; text-transform: uppercase; letter-spacing: .12em; color: #1a1512; }
  @media print { html, body { background: #ffffff !important; color: #1a1512 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; } *, *::before, *::after { color: #1a1512 !important; -webkit-text-fill-color: #1a1512 !important; opacity: 1 !important; } .muted, .muted * { color: #555555 !important; -webkit-text-fill-color: #555555 !important; } body { padding: 0; } .no-print { display: none; } }
</style>
</head><body>
  <div class="header">
    <div style="display:flex; align-items:center; gap:14px">
      <img src="${LOGO_URL}" alt="Temperanzza" style="width:64px; height:64px; object-fit:contain; border-radius:50%; background:#f8f5ef; padding:4px" crossorigin="anonymous"/>
      <div>
        <h1>Temperanzza Condimentos</h1>
        <div class="muted">Comprovante não fiscal</div>
      </div>
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

  <div class="totais">
    <div class="row"><span class="muted">Subtotal</span><span class="num">${brl(subtotal)}</span></div>
    ${p.desconto ? `<div class="row"><span class="muted">Desconto</span><span class="num">-${brl(p.desconto)}</span></div>` : ""}
    <div class="row grand"><span>Total</span><span class="num">${brl(p.total)}</span></div>
  </div>

  ${p.observacoes ? `<div class="block"><strong>Observações:</strong> ${p.observacoes}</div>` : ""}

  <div class="footer">Documento sem valor fiscal · Gerado pelo Temperanzza Dashboard</div>

  <div class="no-print" style="text-align:center; margin-top:24px">
    <button onclick="window.print()" style="padding:10px 22px; background:#1a1512; color:#fff; border:0; border-radius:6px; cursor:pointer; letter-spacing:.1em; text-transform:uppercase; font-size:12px;">Imprimir / Salvar PDF</button>
  </div>
</body></html>`;
};

// ============ CUPOM 80mm ============
export const gerarCupom80mmHTML = (p: PedidoComItens): string => {
  const data = new Date(p.data_pedido).toLocaleString("pt-BR");
  const numero = String(p.numero).padStart(6, "0");
  const canal = p.canal === "atacado" ? "ATACADO" : p.canal === "distribuidor" ? "DISTRIBUIDOR" : "CLIENTE FINAL";
  const subtotal = p.subtotal || p.itens.reduce((s, i) => s + i.subtotal, 0);

  const linhas = p.itens.map((i) => `
    <div class="item">
      <div>${i.nome_produto}</div>
      <div class="row">
        <span>${i.quantidade} x ${brl(i.preco_unitario)}</span>
        <span>${brl(i.subtotal)}</span>
      </div>
      ${i.desconto ? `<div class="row muted"><span>Desc.</span><span>-${brl(i.desconto)}</span></div>` : ""}
    </div>
  `).join("");

  return `<!doctype html><html lang="pt-BR"><head>
<meta charset="utf-8"/>
<title>Cupom #${numero}</title>
<style>
  @page { size: 80mm auto; margin: 3mm; }
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  *, *::before, *::after { color: #000000 !important; -webkit-text-fill-color: #000000 !important; text-shadow: none !important; opacity: 1 !important; background-image: none !important; }
  .muted, .muted * { color: #444444 !important; -webkit-text-fill-color: #444444 !important; }
  .no-print button, .no-print button * { color: #ffffff !important; -webkit-text-fill-color: #ffffff !important; }
  html { background: #ffffff !important; }
  body { font-family: "Menlo", "Courier New", monospace; font-size: 11px; color: #000 !important; background: #ffffff !important; width: 74mm; margin: 0; padding: 4mm 2mm; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  h1 { font-size: 13px; text-align: center; margin: 0 0 2mm; letter-spacing: .05em; color: #000; }
  .muted { color: #444; }
  .center { text-align: center; }
  .dashed { border-top: 1px dashed #000; margin: 3mm 0; }
  .row { display: flex; justify-content: space-between; color: #000; }
  .item { margin: 2mm 0; color: #000; }
  .total { font-size: 14px; font-weight: 700; }
  .no-print { margin-top: 4mm; }
  @media print { html, body { background: #ffffff !important; color: #000 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; } *, *::before, *::after { color: #000000 !important; -webkit-text-fill-color: #000000 !important; opacity: 1 !important; } .muted, .muted * { color: #444444 !important; -webkit-text-fill-color: #444444 !important; } .no-print { display: none; } body { padding: 0; } }
</style>
</head><body>
  <div class="center"><img src="${LOGO_URL}" alt="Temperanzza" style="width:20mm; height:20mm; object-fit:contain" crossorigin="anonymous"/></div>
  <h1>TEMPERANZZA CONDIMENTOS</h1>
  <div class="center muted">Comprovante não fiscal</div>
  <div class="center">${canal}</div>
  <div class="dashed"></div>
  <div class="row"><span>Pedido</span><span>#${numero}</span></div>
  <div class="row"><span>Data</span><span>${data}</span></div>
  <div class="row"><span>Cliente</span><span>${p.cliente?.nome ?? "—"}</span></div>
  ${p.cliente?.documento ? `<div class="row muted"><span>Doc</span><span>${p.cliente.documento}</span></div>` : ""}
  <div class="dashed"></div>
  ${linhas}
  <div class="dashed"></div>
  <div class="row"><span>Subtotal</span><span>${brl(subtotal)}</span></div>
  ${p.desconto ? `<div class="row"><span>Desconto</span><span>-${brl(p.desconto)}</span></div>` : ""}
  <div class="row total"><span>TOTAL</span><span>${brl(p.total)}</span></div>
  <div class="dashed"></div>
  ${p.observacoes ? `<div class="muted">Obs: ${p.observacoes}</div>` : ""}
  <div class="center muted" style="margin-top:3mm">Obrigado pela preferência!</div>
  <div class="no-print center">
    <button onclick="window.print()" style="padding:8px 16px; background:#000; color:#fff; border:0; border-radius:4px; cursor:pointer; font-family:sans-serif; font-size:11px;">Imprimir</button>
  </div>
</body></html>`;
};

const abrir = (html: string) => {
  const w = window.open("", "_blank", "width=900,height=1000");
  if (!w) return;
  w.document.write(html);
  w.document.close();
};

export const abrirNota = (p: PedidoComItens) => abrir(gerarNotaHTML(p));
export const abrirCupom80mm = (p: PedidoComItens) => abrir(gerarCupom80mmHTML(p));

// ============ WHATSAPP ============
export const montarMensagemWhatsApp = (p: PedidoComItens): string => {
  const numero = String(p.numero).padStart(6, "0");
  const dataFmt = new Date(p.data_pedido).toLocaleDateString("pt-BR");
  const nomeCliente = p.cliente?.nome ?? "Consumidor não identificado";
  const subtotal = p.subtotal || p.itens.reduce((s, i) => s + i.subtotal, 0);
  const linhas = p.itens.map(
    (i) => `• ${i.nome_produto}  ${i.quantidade}× ${brl(i.preco_unitario)} = ${brl(i.subtotal)}`
  );
  return [
    `*Temperanzza Condimentos*`,
    `Nota #${numero} — ${dataFmt}`,
    ``,
    `Cliente: ${nomeCliente}`,
    `—`,
    ...linhas,
    `—`,
    `Subtotal: ${brl(subtotal)}`,
    p.desconto ? `Desconto: -${brl(p.desconto)}` : ``,
    `*Total: ${brl(p.total)}*`,
    p.observacoes ? `\nObs.: ${p.observacoes}` : ``,
    ``,
    `"Bem vindo a Família Temperanzza" 🌿`,
  ]
    .filter(Boolean)
    .join("\n");
};

export const telefoneWhatsApp = (telefone?: string | null): string | null => {
  const raw = (telefone ?? "").replace(/\D/g, "");
  if (raw.length < 10) return null;
  return raw.length <= 11 ? `55${raw}` : raw;
};

/** Abre o WhatsApp com a nota do pedido. Retorna false se não houver telefone válido. */
export const enviarNotaWhatsApp = (p: PedidoComItens): boolean => {
  const phone = telefoneWhatsApp(p.cliente?.telefone);
  const texto = encodeURIComponent(montarMensagemWhatsApp(p));
  const url = phone
    ? `https://wa.me/${phone}?text=${texto}`
    : `https://wa.me/?text=${texto}`;
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  a.remove();
  return !!phone;
};
