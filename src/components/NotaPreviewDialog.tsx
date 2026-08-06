import { useMemo, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PedidoComItens } from "@/lib/pedidos";
import { gerarNotaHTML, gerarCupom80mmHTML, abrirCupom80mm, enviarNotaWhatsApp } from "@/lib/nota";
import { Printer, Download, Receipt, X, MessageCircle } from "lucide-react";
import html2pdf from "html2pdf.js";
import { toast } from "sonner";

type Formato = "a4" | "cupom";

export function NotaPreviewDialog({
  pedido,
  open,
  onOpenChange,
  formato = "a4",
}: {
  pedido: PedidoComItens | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  formato?: Formato;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const html = useMemo(() => {
    if (!pedido) return "";
    return formato === "cupom" ? gerarCupom80mmHTML(pedido) : gerarNotaHTML(pedido);
  }, [pedido, formato]);

  const numero = pedido ? String(pedido.numero).padStart(6, "0") : "";

  const imprimir = () => {
    const w = iframeRef.current?.contentWindow;
    if (!w) return;
    w.focus();
    w.print();
  };

  const baixarPDF = async () => {
    if (!pedido) return;
    const doc = iframeRef.current?.contentDocument;
    const alvo = doc?.body;
    if (!doc || !alvo) return;
    const texto = formato === "cupom" ? "#000000" : "#1a1512";
    const secundario = formato === "cupom" ? "#444444" : "#555555";
    const escondidos: HTMLElement[] = [];
    try {
      toast.loading("Gerando PDF...", { id: "pdf" });
      // esconde controles no próprio iframe (mantém o isolamento de estilos)
      doc.querySelectorAll<HTMLElement>(".no-print").forEach((n) => {
        escondidos.push(n);
        n.style.display = "none";
      });
      doc.documentElement.style.background = "#ffffff";
      alvo.style.background = "#ffffff";
      await html2pdf()
        .set({
          margin: 0,
          filename: `Nota-${numero}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
            windowWidth: alvo.scrollWidth,
            // o clone é inserido no documento do app (tema escuro):
            // forçamos fundo branco e texto sólido dentro do clone
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
        })
        .from(alvo)
        .save();
      toast.success("PDF baixado", { id: "pdf" });
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao gerar PDF", { id: "pdf" });
    } finally {
      escondidos.forEach((n) => (n.style.display = ""));
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 flex flex-col gap-0">
        <DialogHeader className="px-5 py-3 border-b flex-row items-center justify-between gap-2 space-y-0 flex-wrap">
          <DialogTitle className="font-display tracking-wide">
            Pré-visualização — Nota Nº {numero}
          </DialogTitle>
          <div className="flex items-center gap-2 flex-wrap">
            {pedido && formato === "a4" && (
              <Button size="sm" variant="outline" onClick={() => abrirCupom80mm(pedido)}>
                <Receipt className="h-4 w-4 mr-1" /> Cupom 80mm
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={imprimir}>
              <Printer className="h-4 w-4 mr-1" /> Imprimir
            </Button>
            <Button size="sm" variant="outline" onClick={enviarWhatsApp}>
              <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp
            </Button>
            <Button size="sm" onClick={baixarPDF}>
              <Download className="h-4 w-4 mr-1" /> Baixar PDF
            </Button>
            <Button size="icon" variant="ghost" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 bg-muted/30 overflow-hidden">
          {pedido && (
            <iframe
              ref={iframeRef}
              title="Pré-visualização"
              srcDoc={html}
              className="w-full h-full bg-white"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
