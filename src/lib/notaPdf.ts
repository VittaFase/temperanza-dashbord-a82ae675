import html2pdf from "html2pdf.js";
import { PedidoComItens } from "./pedidos";
import { gerarNotaHTML, gerarCupom80mmHTML, PAPEL_NOTA } from "./nota";

export type FormatoNota = "a4" | "cupom";

export const nomeArquivoNota = (p: PedidoComItens, formato: FormatoNota) =>
  `${formato === "cupom" ? "Cupom" : "Nota"}-${String(p.numero).padStart(6, "0")}.pdf`;

const htmlDaNota = (p: PedidoComItens, formato: FormatoNota) =>
  formato === "cupom" ? gerarCupom80mmHTML(p) : gerarNotaHTML(p);

/** Renderiza o HTML em um iframe oculto e devolve o documento pronto. */
const montarIframe = (html: string) =>
  new Promise<{ doc: Document; destruir: () => void }>((resolve, reject) => {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.cssText = "position:fixed;left:-10000px;top:0;width:900px;height:1200px;border:0;opacity:0;";
    iframe.srcdoc = html;
    iframe.onload = () => {
      const doc = iframe.contentDocument;
      if (!doc) {
        iframe.remove();
        reject(new Error("Não foi possível preparar a nota"));
        return;
      }
      resolve({ doc, destruir: () => iframe.remove() });
    };
    iframe.onerror = () => {
      iframe.remove();
      reject(new Error("Não foi possível preparar a nota"));
    };
    document.body.appendChild(iframe);
  });

const opcoes = (formato: FormatoNota, alvo: HTMLElement) => {
  const papel = PAPEL_NOTA[formato];
  // Match CSS pixels to physical millimetres, plus a small rounding allowance.
  const alturaCupom = Math.max(80, Math.ceil(alvo.getBoundingClientRect().height * 25.4 / 96) + papel.margem * 2 + 2);
  return {
    margin: [papel.margem, papel.margem, papel.margem, papel.margem] as [number, number, number, number],
    pagebreak: formato === "cupom" ? { mode: [] } : { mode: ["css", "legacy"], avoid: ["tr", ".header", ".customer-grid", ".totais", ".footer"] },
    image: { type: "jpeg" as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: Math.ceil(papel.largura * 96 / 25.4),
      onclone: (clonedDoc: Document) => {
        const style = clonedDoc.createElement("style");
        style.textContent = `
          html, body { background: #ffffff !important; }
          .nota-document, .nota-document *, .nota-document *::before, .nota-document *::after {
            color: hsl(0 0% 0%) !important;
            -webkit-text-fill-color: hsl(0 0% 0%) !important;
            text-shadow: none !important;
            opacity: 1 !important;
            background-image: none !important;
          }
          .nota-document { width: ${papel.util}mm !important; margin: 0 !important; }
          .nota-document .muted, .nota-document .muted * {
            color: hsl(0 0% 28%) !important;
            -webkit-text-fill-color: hsl(0 0% 28%) !important;
          }
          .no-print { display: none !important; }
        `;
        clonedDoc.head?.appendChild(style);
        clonedDoc.body?.style.setProperty("background", "#ffffff", "important");
      },
    },
    jsPDF:
      formato === "cupom"
        ? { unit: "mm", format: [80, alturaCupom] as [number, number], orientation: "portrait" as const }
        : { unit: "mm", format: "a4", orientation: "portrait" as const },
  };
};

/** Gera o PDF da nota em memória (blob), sem baixar. */
export const gerarNotaPdfBlob = async (
  p: PedidoComItens,
  formato: FormatoNota,
  docExistente?: Document | null
): Promise<Blob> => {
  let doc = docExistente ?? null;
  let destruir = () => {};
  if (!doc) {
    const criado = await montarIframe(htmlDaNota(p, formato));
    doc = criado.doc;
    destruir = criado.destruir;
  }
  try {
    await doc.fonts.ready;
    const alvo = doc.querySelector<HTMLElement>(".nota-document");
    if (!alvo) throw new Error("A nota ainda não está pronta. Tente novamente.");
    // The scoped stylesheet lives inside this root, so html2pdf keeps the layout
    // when it clones into the dark-themed application document.
    const worker = html2pdf().set(opcoes(formato, alvo)).from(alvo);
    if (formato === "cupom") {
      await worker.toCanvas();
      const canvas: HTMLCanvasElement = await worker.get("canvas");
      // Use the actual rendered image, not the pre-clone height: text wrapping
      // and raster rounding must never crop the final lines of a thermal receipt.
      const papel = PAPEL_NOTA.cupom;
      const altura = Math.max(80, Math.ceil(canvas.height / canvas.width * papel.util) + papel.margem * 2 + 1);
      await worker.set({ jsPDF: { unit: "mm", format: [papel.largura, altura], orientation: "portrait" } });
    }
    const blob: Blob = await worker.outputPdf("blob");
    return blob;
  } finally {
    destruir();
  }
};

/** Baixa o PDF e abre em nova aba. Retorna false se o navegador bloqueou a aba. */
export const baixarEAbrirPdf = (blob: Blob, filename: string): { url: string; abriu: boolean } => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  const w = window.open(url, "_blank", "noopener,noreferrer");
  // libera depois de um tempo para não invalidar a aba/download
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return { url, abriu: !!w };
};

/** Abre a nota em janela própria e chama a caixa de impressão do sistema. */
export const imprimirNota = (p: PedidoComItens, formato: FormatoNota): boolean => {
  const w = window.open("", "_blank", "width=900,height=1000");
  if (!w) return false;
  w.document.write(htmlDaNota(p, formato));
  w.document.close();
  const disparar = () => {
    try {
      w.focus();
      w.print();
    } catch {
      /* usuário pode imprimir pelo botão da própria janela */
    }
  };
  if (w.document.readyState === "complete") setTimeout(disparar, 350);
  else w.addEventListener("load", () => setTimeout(disparar, 350));
  return true;
};

export const podeCompartilharArquivo = (): boolean => {
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (!nav.share || !nav.canShare || typeof File === "undefined") return false;
  try {
    const teste = new File([new Blob(["a"], { type: "application/pdf" })], "t.pdf", {
      type: "application/pdf",
    });
    return nav.canShare({ files: [teste] });
  } catch {
    return false;
  }
};

/** Compartilha o PDF como arquivo (WhatsApp, e-mail, etc.). Retorna false se não suportado. */
export const compartilharPdf = async (blob: Blob, filename: string, texto: string): Promise<boolean> => {
  if (!podeCompartilharArquivo()) return false;
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  const file = new File([blob], filename, { type: "application/pdf" });
  if (!nav.share) return false;
  try {
    await nav.share({ files: [file], text: texto, title: filename });
    return true;
  } catch (e: any) {
    if (e?.name === "AbortError") return true;
    return false;
  }
};
