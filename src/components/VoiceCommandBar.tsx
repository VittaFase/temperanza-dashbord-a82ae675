import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { VoiceButton } from "@/components/VoiceButton";
import { interpretarComando } from "@/lib/voiceCommands";

export const VoiceCommandBar = () => {
  const nav = useNavigate();
  const [ultimo, setUltimo] = useState<string | null>(null);

  const handle = useCallback(
    (texto: string) => {
      setUltimo(texto);
      const cmd = interpretarComando(texto);
      if (cmd.tipo === "navegar") {
        nav(cmd.rota);
        toast.success(`Abrindo ${cmd.label}`);
        return;
      }
      if (cmd.tipo === "buscar") {
        nav(`${cmd.rota}?q=${encodeURIComponent(cmd.termo)}`);
        toast.success(cmd.label);
        return;
      }
      toast("Comando não reconhecido", {
        description: `"${texto}"`,
        action: {
          label: "Buscar cliente",
          onClick: () => nav(`/pedidos?q=${encodeURIComponent(texto)}`),
        },
      });
    },
    [nav],
  );

  return (
    <div className="ml-auto flex items-center gap-2">
      {ultimo && (
        <span className="hidden md:inline max-w-[220px] truncate text-[11px] text-muted-foreground">
          “{ultimo}”
        </span>
      )}
      <VoiceButton onResult={handle} title="Comando por voz (segure e fale)" />
    </div>
  );
};
