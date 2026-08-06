import { Mic, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { cn } from "@/lib/utils";

type Props = {
  onResult: (text: string) => void;
  className?: string;
  title?: string;
};

export const VoiceButton = ({ onResult, className, title = "Ditar por voz" }: Props) => {
  const { state, error, setError, start, stop } = useVoiceInput(onResult);

  useEffect(() => {
    if (error) {
      toast.error(error);
      setError(null);
    }
  }, [error, setError]);

  const recording = state === "recording";
  const busy = state === "transcribing";

  return (
    <button
      type="button"
      aria-label={title}
      title={recording ? "Solte para transcrever" : title}
      disabled={busy}
      onPointerDown={(e) => {
        e.preventDefault();
        start();
      }}
      onPointerUp={() => stop()}
      onPointerLeave={() => recording && stop()}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          if (!recording) start();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          stop();
        }
      }}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-md border transition-colors",
        recording
          ? "border-destructive bg-destructive/10 text-destructive animate-pulse"
          : "border-border text-muted-foreground hover:text-foreground hover:bg-muted",
        busy && "opacity-60",
        className,
      )}
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mic className="h-3.5 w-3.5" />}
    </button>
  );
};
