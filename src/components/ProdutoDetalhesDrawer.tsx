import { useRef, useState } from "react";
import { Tempero, TabelaNutricional, Variaveis, CustoFixoKey, CustosFixosOverride } from "@/data/temperos";
import { useAuth } from "@/hooks/useAuth";
import { uploadFotoTempero, removeFotoTempero } from "@/lib/api";
import { ProdutoFoto } from "./ProdutoFoto";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  tempero: Tempero | null;
  variaveis: Variaveis;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSave: (t: Tempero) => void;
};

const CUSTO_FIXO_ITENS: { key: CustoFixoKey; label: string }[] = [
  { key: "pote", label: "Pote + Tampa" },
  { key: "lacre", label: "Lacre" },
  { key: "rotulo", label: "Rótulo" },
  { key: "caixa", label: "Caixa (rateio)" },
  { key: "termoencolhivel", label: "Termoencolhível" },
];

const NUTRI_FIELDS: { key: keyof TabelaNutricional; label: string; unit?: string }[] = [
  { key: "porcao", label: "Porção", unit: "g" },
  { key: "valorEnergetico", label: "Valor energético", unit: "kcal" },
  { key: "carboidratos", label: "Carboidratos", unit: "g" },
  { key: "acucares", label: "Açúcares", unit: "g" },
  { key: "proteinas", label: "Proteínas", unit: "g" },
  { key: "gordurasTotais", label: "Gorduras totais", unit: "g" },
  { key: "gordurasSaturadas", label: "Gorduras saturadas", unit: "g" },
  { key: "gordurasTrans", label: "Gorduras trans", unit: "g" },
  { key: "fibras", label: "Fibras", unit: "g" },
  { key: "sodio", label: "Sódio", unit: "mg" },
];

// Compressão simples via canvas (max 800px, JPEG 0.85)
const comprimir = (file: File): Promise<File> =>
  new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) return resolve(file);
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => { img.src = reader.result as string; };
    reader.onerror = reject;
    img.onload = () => {
      const max = 800;
      let { width, height } = img;
      if (width > max || height > max) {
        const scale = Math.min(max / width, max / height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("falha ao comprimir"));
          resolve(new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }));
        },
        "image/jpeg", 0.85
      );
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });

export const ProdutoDetalhesDrawer = ({ tempero, variaveis, open, onOpenChange, onSave }: Props) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!tempero) return null;

  const nutri = tempero.tabelaNutricional ?? {};

  const setField = (patch: Partial<Tempero>) => onSave({ ...tempero, ...patch });
  const setNutri = (patch: Partial<TabelaNutricional>) =>
    onSave({ ...tempero, tabelaNutricional: { ...nutri, ...patch } });

  const handleFile = async (f: File) => {
    if (!user) return;
    try {
      setUploading(true);
      const otimizado = await comprimir(f);
      const path = await uploadFotoTempero(user.id, tempero.id, otimizado);
      setField({ fotoPath: path });
      toast.success("Foto atualizada");
    } catch (e: any) {
      toast.error("Falha no upload: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!tempero.fotoPath) return;
    try {
      await removeFotoTempero(tempero.fotoPath);
      setField({ fotoPath: undefined });
      toast.success("Foto removida");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl">{tempero.nome}</SheetTitle>
          <SheetDescription>Identidade do produto e ficha nutricional</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Foto */}
          <section className="space-y-3">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Foto do produto</Label>
            <div className="flex items-start gap-4">
              <ProdutoFoto path={tempero.fotoPath} size={120} alt={tempero.nome} />
              <div className="flex-1 space-y-2">
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                    e.target.value = "";
                  }}
                />
                <Button
                  variant="outline" size="sm" className="w-full"
                  disabled={uploading}
                  onClick={() => inputRef.current?.click()}
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {tempero.fotoPath ? "Trocar foto" : "Enviar foto"}
                </Button>
                {tempero.fotoPath && (
                  <Button variant="ghost" size="sm" className="w-full text-destructive" onClick={handleRemove}>
                    <Trash2 className="h-4 w-4" /> Remover
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">
                  Otimizada para 800px, ~80 KB por foto.
                </p>
              </div>
            </div>
          </section>

          <Separator />

          {/* SKU / EAN */}
          <section className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>SKU interno</Label>
              <Input
                value={tempero.sku ?? ""}
                onChange={(e) => setField({ sku: e.target.value })}
                placeholder="TMP-LEMON-050"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Código de barras (EAN-13)</Label>
              <Input
                value={tempero.ean ?? ""}
                onChange={(e) => setField({ ean: e.target.value.replace(/\D/g, "").slice(0, 13) })}
                placeholder="7891234567890"
                inputMode="numeric"
              />
            </div>
          </section>

          <Separator />

          {/* Tabela nutricional */}
          <section className="space-y-3">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Tabela nutricional
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Valores por porção — usados na impressão do rótulo.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {NUTRI_FIELDS.map((f) => (
                <div key={f.key} className="space-y-1">
                  <Label className="text-xs">
                    {f.label} {f.unit && <span className="text-muted-foreground">({f.unit})</span>}
                  </Label>
                  <Input
                    value={nutri[f.key] ?? ""}
                    onChange={(e) => setNutri({ [f.key]: e.target.value } as Partial<TabelaNutricional>)}
                    className="h-9"
                  />
                </div>
              ))}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Observações</Label>
              <Textarea
                value={nutri.observacoes ?? ""}
                onChange={(e) => setNutri({ observacoes: e.target.value })}
                placeholder="Ex: valores diários de referência baseados em dieta de 2.000 kcal."
                rows={3}
              />
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
};
