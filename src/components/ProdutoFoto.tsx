import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";
import { getFotoSignedUrl } from "@/lib/api";

type Props = {
  path?: string;
  size?: number;
  className?: string;
  alt?: string;
};

export const ProdutoFoto = ({ path, size = 40, className = "", alt = "" }: Props) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    if (!path) {
      setUrl(null);
      return;
    }
    getFotoSignedUrl(path).then((u) => alive && setUrl(u));
    return () => { alive = false; };
  }, [path]);

  const style = { width: size, height: size };
  const base =
    "shrink-0 rounded-md border border-border bg-secondary/40 overflow-hidden flex items-center justify-center";

  if (!url) {
    return (
      <div className={`${base} ${className}`} style={style}>
        <ImageOff className="h-4 w-4 text-muted-foreground/60" />
      </div>
    );
  }
  return (
    <div className={`${base} ${className}`} style={style}>
      <img src={url} alt={alt} className="h-full w-full object-cover" loading="lazy" />
    </div>
  );
};
