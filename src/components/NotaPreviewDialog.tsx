import { useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PedidoComItens } from "@/lib/pedidos";
import {
  gerarNotaHTML,
  gerarCupom80mmHTML,
  abrirCupom80mm,
  montarResumoWhatsApp,
  montarMensagemWhatsApp,
  telefoneWhatsApp,
} from "@/lib/nota";
import {
  gerarNotaPdfBlob,
  baixarEAbrirPdf,
  compartilharPdf,
  imprimirNota,
  nomeArquivoNota,
} from "@/lib/notaPdf";
import { Printer, Download, Receipt, X, MessageCircle } from "lucide-react";
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
  const [ocupado, setOcupado] = useState(false);

  const html = useMemo(() => {
    if (!pedido) return "";
    return formato === "cupom" ? gerarCupom80mmHTML(pedido) : gerarNotaHTML(pedido);
  }, [pedido, formato]);

  const numero = pedido ? String(pedido.numero).padStart(6, "0") : "";

  const imprimir = () => {
    if (!pedido) return;
    const ok = imprimirNota(pedido, formato);
    if (!ok) {
      // pop-up bloqueado: imprime pelo próprio iframe
      const w = iframeRef.current?.contentWindow;
      if (!w) {
        toast.error("Permita janelas pop-up para imprimir");
        return;
      }
      w.focus();
      w.print();
    } else {
      toast.info("Escolha a impressora na janela do sistema (Bluetooth, Wi-Fi ou AirPrint)");
    }
  };

  const gerarBlob = async () => {
    if (!pedido) return null;
    return gerarNotaPdfBlob(pedido, formato, iframeRef.current?.contentDocument);
  };

  const baixarPDF = async () => {
    if (!pedido || ocupado) return;
    setOcupado(true);
    try {
      toast.loading("Gerando PDF...", { id: "pdf" });
      const blob = await gerarBlob();
      if (!blob) return;
      const nome = nomeArquivoNota(pedido, formato);
      const { url, abriu } = baixarEAbrirPdf(blob, nome);
      if (abriu) {
        toast.success("PDF baixado e aberto", { id: "pdf" });
      } else {
        toast.success("PDF baixado", {
          id: "pdf",
          action: { label: "Abrir nota", onClick: () => window.open(url, "_blank") },
        });
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao gerar PDF", { id: "pdf" });
    } finally {
      setOcupado(false);
    }
  };

  const enviarWhatsApp = async () => {
    if (!pedido || ocupado) return;
    setOcupado(true);
    try {
      toast.loading("Preparando a nota...", { id: "wpp" });
      const blob = await gerarBlob();
      if (!blob) return;
      const nome = nomeArquivoNota(pedido, formato);
      const resumo = montarResumoWhatsApp(pedido);
      const compartilhou = await compartilharPdf(blob, nome, resumo);
      if (compartilhou) {
        toast.success("Escolha o WhatsApp e o contato", { id: "wpp" });
        return;
      }
      // desktop: baixa/abre o PDF e abre o WhatsApp Web com a mensagem
      baixarEAbrirPdf(blob, nome);
      const phone = telefoneWhatsApp(pedido.cliente?.telefone);
      const texto = encodeURIComponent(montarMensagemWhatsApp(pedido));
      window.open(phone ? `https://wa.me/${phone}?text=${texto}` : `https://wa.me/?text=${texto}`, "_blank");
      toast.info("PDF baixado — arraste o arquivo para a conversa do WhatsApp", { id: "wpp" });
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao enviar", { id: "wpp" });
    } finally {
      setOcupado(false);
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
