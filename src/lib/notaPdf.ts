import html2pdf from "html2pdf.js";
import { PedidoComItens } from "./pedidos";
import { gerarNotaHTML, gerarCupom80mmHTML } from "./nota";

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
  const texto = formato === "cupom" ? "#000000" : "#1a1512";
  const secundario = formato === "cupom" ? "#444444" : "#555555";
  return {
    margin: 0,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: alvo.scrollWidth,
      onclone: (clonedDoc: Document) => {
        const style = clonedDoc.createElement("style");
        style.textContent = `
          html, body { background: #ffffff !important; }
          *, *::before, *::after {
            color: ${texto} !important;
            -webkit-text-fill-color: ${texto} !important;
            text-shadow: none !important;
            opacity: 1 !important;
            background-image: none !important;
          }
          .muted, .muted * {
            color: ${secundario} !important;
            -webkit-text-fill-color: ${secundario} !important;
          }
          .no-print { display: none !important; }
        `;
        clonedDoc.head?.appendChild(style);
        clonedDoc.body?.style.setProperty("background", "#ffffff", "important");
      },
    },
    jsPDF:
      formato === "cupom"
        ? { unit: "mm", format: [80, 297], orientation: "portrait" }
        : { unit: "mm", format: "a4", orientation: "portrait" },
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
  const alvo = doc.body;
  const escondidos: HTMLElement[] = [];
  try {
    doc.querySelectorAll<HTMLElement>(".no-print").forEach((n) => {
      escondidos.push(n);
      n.style.display = "none";
    });
    doc.documentElement.style.background = "#ffffff";
    alvo.style.background = "#ffffff";
    const blob: Blob = await html2pdf().set(opcoes(formato, alvo)).from(alvo).outputPdf("blob");
    return blob;
  } finally {
    escondidos.forEach((n) => (n.style.display = ""));
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
  try {
    await nav.share!({ files: [file], text: texto, title: filename });
    return true;
  } catch (e: any) {
    if (e?.name === "AbortError") return true;
    return false;
  }
};
