import { PedidoComItens } from "./pedidos";

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const escapar = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] ?? c));

// Physical dimensions are shared by screen preview, export and native printing.
export const PAPEL_NOTA = {
  a4: { largura: 210, margem: 14, util: 182 },
  cupom: { largura: 80, margem: 4, util: 72 },
};

const estilos = `
  .nota-document { --paper: 0 0% 100%; --ink: 0 0% 0%; --secondary-ink: 0 0% 28%; --rule: 0 0% 75%; --wash: 0 0% 96%; color-scheme: light; background: hsl(var(--paper)); color: hsl(var(--ink)); font-family: Arial, Helvetica, sans-serif; font-size: 13px; line-height: 1.5; letter-spacing: 0; box-sizing: border-box; }
  .nota-document *, .nota-document *::before, .nota-document *::after { box-sizing: border-box; color: hsl(var(--ink)) !important; -webkit-text-fill-color: hsl(var(--ink)) !important; text-shadow: none !important; background-image: none !important; opacity: 1 !important; letter-spacing: 0; }
  .nota-document .muted, .nota-document .muted * { color: hsl(var(--secondary-ink)) !important; -webkit-text-fill-color: hsl(var(--secondary-ink)) !important; }
  .nota-document h1, .nota-document p { margin: 0; }
  .nota-document { display: flow-root; padding-bottom: 2px; }
  .nota-document .header { display: table; width: 100%; border-bottom: 2px solid hsl(var(--ink)); padding-bottom: 16px; margin-bottom: 18px; }
  .nota-document .brand, .nota-document .reference { display: table-cell; vertical-align: top; }
  .nota-document .brand { width: 63%; }
  .nota-document .brand h1 { font-family: Georgia, "Times New Roman", serif; font-size: 30px; line-height: 1.1; text-transform: uppercase; font-weight: 400; }
  .nota-document .brand p { font-size: 11px; margin-top: 6px; text-transform: uppercase; }
  .nota-document .reference { text-align: right; font-size: 12px; }
  .nota-document .reference strong { display: block; font-size: 20px; margin: 3px 0; }
  .nota-document .customer-grid { display: table; width: 100%; table-layout: fixed; margin-bottom: 18px; }
  .nota-document .customer, .nota-document .order-info { display: table-cell; vertical-align: top; padding: 12px 14px; border: 1px solid hsl(var(--rule)); overflow-wrap: anywhere; }
  .nota-document .customer { width: 65%; }
  .nota-document .order-info { width: 35%; border-left: 0; }
  .nota-document .label { font-size: 10px; text-transform: uppercase; margin-bottom: 6px; }
  .nota-document .customer strong { font-size: 15px; }
  .nota-document table { border-collapse: collapse; width: 100%; table-layout: fixed; background: hsl(var(--paper)); }
  .nota-document th, .nota-document td { text-align: left; vertical-align: top; padding: 8px; border-bottom: 1px solid hsl(var(--rule)); font-size: 12px; overflow-wrap: anywhere; }
  .nota-document th { background: hsl(var(--wash)); font-size: 10px; font-weight: 700; text-transform: uppercase; border-top: 1px solid hsl(var(--ink)); }
  .nota-document tbody tr:nth-child(even) td { background: hsl(var(--wash)); }
  .nota-document .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .nota-document .totais { width: 46%; margin: 20px 0 0 auto; }
  .nota-document .row { display: table; width: 100%; table-layout: fixed; }
  .nota-document .row > span { display: table-cell; vertical-align: top; overflow-wrap: anywhere; }
  .nota-document .row > span:last-child { text-align: right; padding-left: 8px; }
  .nota-document .totais .row { padding: 5px 0; }
  .nota-document .grand { border-top: 3px double hsl(var(--ink)); margin-top: 6px; padding-top: 9px !important; font-size: 18px; font-weight: 700; }
  .nota-document .observacoes { margin-top: 24px; padding-top: 12px; border-top: 1px solid hsl(var(--rule)); white-space: pre-wrap; overflow-wrap: anywhere; }
  .nota-document .footer { margin-top: 24px; border-top: 1px solid hsl(var(--rule)); padding-top: 12px; text-align: center; font-size: 10px; }
  .nota-document tr, .nota-document .header, .nota-document .customer-grid, .nota-document .totais, .nota-document .footer, .nota-document .item { break-inside: avoid; page-break-inside: avoid; }
  .nota-document thead { display: table-header-group; }
  .nota-document.cupom { font-family: "Courier New", monospace; font-size: 11px; line-height: 1.45; }
  .nota-document.cupom h1 { font-family: Georgia, "Times New Roman", serif; font-size: 22px; font-weight: 400; line-height: 1.2; }
  .nota-document.cupom .center { text-align: center; }
  .nota-document.cupom .subtitle { font-family: Arial, sans-serif; font-size: 10px; margin: 3px 0 8px; }
  .nota-document.cupom .dashed { border-top: 1px dashed hsl(var(--ink)); margin: 12px 0; }
  .nota-document.cupom .details { margin: 6px 0; overflow-wrap: anywhere; }
  .nota-document.cupom .details strong { display: inline; }
  .nota-document.cupom .item { margin: 12px 0; }
  .nota-document.cupom .product { font-weight: 700; overflow-wrap: anywhere; margin-bottom: 3px; }
  .nota-document.cupom .item .row > span:first-child { width: 64%; }
  .nota-document.cupom .item .row > span:last-child { width: 36%; white-space: nowrap; }
  .nota-document.cupom .grand { font-size: 14px; padding: 8px 0; margin-top: 8px; }
  .nota-document.cupom .footer { font-size: 10px; margin-top: 16px; padding-top: 10px; }
`;

const documento = (conteudo: string, formato: "a4" | "cupom", numero: string) => {
  const papel = PAPEL_NOTA[formato];
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${formato === "a4" ? "Nota" : "Cupom"} #${numero} — Temperanzza</title>
  <style>
    :root { color-scheme: light; } html, body { background: hsl(0 0% 100%) !important; margin: 0; }
    body { padding: ${papel.margem}mm; width: ${papel.largura}mm; box-sizing: border-box; }
    .nota-document { width: ${papel.util}mm; margin: 0; }
    .no-print { margin-top: 24px; text-align: center; }
    .no-print button { padding: 10px 22px; border: 1px solid hsl(0 0% 0%); background: hsl(0 0% 100%); color: hsl(0 0% 0%); cursor: pointer; }
    @page { size: ${formato === "a4" ? "A4" : "80mm 200mm"}; margin: ${papel.margem}mm; }
    @media print { body { width: auto; padding: 0; } .no-print { display: none !important; } .nota-document { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style></head><body><main class="nota-document ${formato}"><style>${estilos}</style>${conteudo}</main>
  <div class="no-print"><button onclick="window.print()">Imprimir / Salvar PDF</button></div>
  ${formato === "cupom" ? `<script>window.addEventListener('load', function () { var el = document.querySelector('.nota-document'); if (!el) return; var height = Math.ceil(el.getBoundingClientRect().height * 25.4 / 96 + 10); var style = document.createElement('style'); style.textContent = '@page { size: 80mm ' + Math.max(40, height) + 'mm; margin: 4mm; }'; document.head.appendChild(style); });</script>` : ""}
  </body></html>`;
};

export const gerarNotaHTML = (p: PedidoComItens): string => {
  const numero = String(p.numero).padStart(6, "0");
  const data = new Date(p.data_pedido).toLocaleString("pt-BR");
  const canal = p.canal === "atacado" ? "Atacado" : p.canal === "distribuidor" ? "Distribuidor" : "Cliente Final";
  const subtotal = p.subtotal || p.itens.reduce((s, i) => s + i.subtotal, 0);
  const c = p.cliente;
  const endereco = c ? [c.endereco, [c.cidade, c.estado].filter(Boolean).join("/")].filter(Boolean).join(", ") : "";
  const cliente = c ? `<strong>${escapar(c.nome)}</strong>${[c.documento ? `Doc.: ${c.documento}` : "", c.telefone ? `Tel.: ${c.telefone}` : "", c.email, endereco].filter(Boolean).map(s => `<div>${escapar(s ?? "")}</div>`).join("")}` : "Consumidor não identificado";
  const linhas = p.itens.map(i => `<tr><td>${escapar(i.nome_produto)}${i.desconto ? `<div class="muted">Valor especial: -${brl(i.desconto)}</div>` : ""}</td><td class="num">${i.quantidade}</td><td class="num">${brl(i.preco_unitario)}</td><td class="num">${brl(i.subtotal)}</td></tr>`).join("");
  return documento(`
    <header class="header"><div class="brand"><h1>Temperanzza</h1><p>Condimentos</p><p class="muted">Comprovante não fiscal</p></div><div class="reference"><div>NOTA DO PEDIDO</div><strong>Nº ${numero}</strong><div>${data}</div><div>${canal}</div></div></header>
    <section class="customer-grid"><div class="customer"><div class="label muted">Cliente</div>${cliente}</div><div class="order-info"><div class="label muted">Resumo do pedido</div><div>${p.itens.length} produtos</div><div>${p.itens.reduce((s, i) => s + i.quantidade, 0)} unidades</div><div>${canal}</div></div></section>
    <table><colgroup><col style="width:52%"/><col style="width:10%"/><col style="width:19%"/><col style="width:19%"/></colgroup><thead><tr><th>Produto</th><th class="num">Qtd.</th><th class="num">Valor unit.</th><th class="num">Subtotal</th></tr></thead><tbody>${linhas}</tbody></table>
    <section class="totais"><div class="row"><span>Subtotal</span><span class="num">${brl(subtotal)}</span></div>${p.desconto ? `<div class="row"><span>Desconto</span><span class="num">-${brl(p.desconto)}</span></div>` : ""}<div class="row grand"><span>Total</span><span class="num">${brl(p.total)}</span></div></section>
    ${p.observacoes ? `<div class="observacoes"><strong>Observações</strong><br/>${escapar(p.observacoes)}</div>` : ""}
    <footer class="footer">Obrigado pela preferência!<br/><span class="muted">Temperanzza Condimentos · Documento sem valor fiscal</span></footer>
  `, "a4", numero);
};

export const gerarCupom80mmHTML = (p: PedidoComItens): string => {
  const numero = String(p.numero).padStart(6, "0");
  const data = new Date(p.data_pedido).toLocaleString("pt-BR");
  const canal = p.canal === "atacado" ? "ATACADO" : p.canal === "distribuidor" ? "DISTRIBUIDOR" : "CLIENTE FINAL";
  const subtotal = p.subtotal || p.itens.reduce((s, i) => s + i.subtotal, 0);
  const linhas = p.itens.map(i => `<div class="item"><div class="product">${escapar(i.nome_produto)}</div><div class="row"><span>${i.quantidade} × ${brl(i.preco_unitario)}</span><span>${brl(i.subtotal)}</span></div>${i.desconto ? `<div class="row muted"><span>Valor especial</span><span>-${brl(i.desconto)}</span></div>` : ""}</div>`).join("");
  return documento(`
    <header class="center"><h1>TEMPERANZZA</h1><div class="subtitle">CONDIMENTOS</div><div>Comprovante não fiscal</div><div>${canal}</div></header>
    <div class="dashed"></div><div class="details"><strong>Pedido:</strong> #${numero}</div><div class="details"><strong>Data:</strong> ${data}</div><div class="details"><strong>Cliente:</strong> ${escapar(p.cliente?.nome ?? "Consumidor não identificado")}</div>${p.cliente?.documento ? `<div class="details"><strong>Doc.:</strong> ${escapar(p.cliente.documento)}</div>` : ""}
    <div class="dashed"></div><div class="row muted"><span>Produto / Qtd. × Valor</span><span>Subtotal</span></div>${linhas}<div class="dashed"></div>
    <section class="totais-cupom"><div class="row"><span>Subtotal</span><span>${brl(subtotal)}</span></div>${p.desconto ? `<div class="row"><span>Desconto</span><span>-${brl(p.desconto)}</span></div>` : ""}<div class="row grand"><span>TOTAL</span><span>${brl(p.total)}</span></div></section>
    ${p.observacoes ? `<div class="observacoes"><strong>Obs.:</strong> ${escapar(p.observacoes)}</div>` : ""}
    <footer class="footer">Obrigado pela preferência!<br/>Documento sem valor fiscal</footer>
  `, "cupom", numero);
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

/** Mensagem curta usada quando o PDF da nota vai anexado. */
export const montarResumoWhatsApp = (p: PedidoComItens): string => {
  const numero = String(p.numero).padStart(6, "0");
  const dataFmt = new Date(p.data_pedido).toLocaleDateString("pt-BR");
  const nomeCliente = p.cliente?.nome ?? "Consumidor não identificado";
  return [
    `*Temperanzza Condimentos*`,
    `Nota #${numero} — ${dataFmt}`,
    `Cliente: ${nomeCliente}`,
    `*Total: ${brl(p.total)}*`,
    ``,
    `Segue a nota em PDF em anexo. 🌿`,
  ].join("\n");
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
