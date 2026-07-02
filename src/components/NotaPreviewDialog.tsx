import { useMemo, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PedidoComItens } from "@/lib/pedidos";
import { gerarNotaHTML, gerarCupom80mmHTML, abrirCupom80mm } from "@/lib/nota";
import { Printer, Download, Receipt, X } from "lucide-react";
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
    if (!alvo) return;
    try {
      toast.loading("Gerando PDF...", { id: "pdf" });
      // remove botão de impressão do clone
      const clone = alvo.cloneNode(true) as HTMLElement;
      clone.querySelectorAll(".no-print").forEach((n) => n.remove());
      await html2pdf()
        .set({
          margin: 0,
          filename: `Nota-${numero}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
          jsPDF:
            formato === "cupom"
              ? { unit: "mm", format: [80, 297], orientation: "portrait" }
              : { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(clone)
        .save();
      toast.success("PDF baixado", { id: "pdf" });
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao gerar PDF", { id: "pdf" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 flex flex-col gap-0">
        <DialogHeader className="px-5 py-3 border-b flex-row items-center justify-between space-y-0">
          <DialogTitle className="font-display tracking-wide">
            Pré-visualização — Nota Nº {numero}
          </DialogTitle>
          <div className="flex items-center gap-2">
            {pedido && formato === "a4" && (
              <Button size="sm" variant="outline" onClick={() => abrirCupom80mm(pedido)}>
                <Receipt className="h-4 w-4 mr-1" /> Cupom 80mm
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={imprimir}>
              <Printer className="h-4 w-4 mr-1" /> Imprimir
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
