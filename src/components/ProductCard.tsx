import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronUp, Instagram, Facebook } from "lucide-react";
import { Product, PostOption } from "@/data/products";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  index: number;
}

const ProductCard = ({ product, index }: ProductCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (post: PostOption) => {
    const fullText = `${post.caption}\n\n${post.hashtags}`;
    
    try {
      await navigator.clipboard.writeText(fullText);
      setCopiedId(post.id);
      toast.success("Texto copiado!", {
        description: "O post foi copiado para a área de transferência.",
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast.error("Erro ao copiar", {
        description: "Não foi possível copiar o texto.",
      });
    }
  };

  return (
    <article 
      className="bg-card-gradient rounded-2xl shadow-card overflow-hidden transition-all duration-500 hover:shadow-product animate-slide-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-auto object-cover transition-transform duration-700 hover:scale-105"
        />
        
        {/* Overlay with product name */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-wood/90 to-transparent p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-cream">
                {product.name}
              </h3>
              <p className="text-cream/70 text-sm mt-1">{product.emojis}</p>
            </div>
            <div className="flex gap-2">
              <div className="w-10 h-10 rounded-full bg-cream/10 backdrop-blur-sm flex items-center justify-center">
                <Instagram className="w-5 h-5 text-cream" />
              </div>
              <div className="w-10 h-10 rounded-full bg-cream/10 backdrop-blur-sm flex items-center justify-center">
                <Facebook className="w-5 h-5 text-cream" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Options */}
      <div className="p-6">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between group"
        >
          <span className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {isExpanded ? "Ocultar" : "Ver"} opções de posts ({product.posts.length})
          </span>
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        </button>

        {/* Expanded Posts */}
        <div className={`grid gap-4 overflow-hidden transition-all duration-500 ${isExpanded ? "mt-6 max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}>
          {product.posts.map((post, postIndex) => (
            <div
              key={post.id}
              className="bg-secondary/50 rounded-xl p-5 border border-border hover:border-primary/30 transition-all animate-scale-in"
              style={{ animationDelay: `${postIndex * 0.05}s` }}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  Opção {postIndex + 1}
                </span>
                <button
                  onClick={() => copyToClipboard(post)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-sm font-medium shadow-sm hover:shadow-md"
                >
                  {copiedId === post.id ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar
                    </>
                  )}
                </button>
              </div>

              {/* Caption */}
              <div className="bg-card rounded-lg p-4 border border-border">
                <p className="text-foreground whitespace-pre-line text-sm leading-relaxed">
                  {post.caption}
                </p>
              </div>

              {/* Hashtags */}
              <div className="mt-3">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">
                  Hashtags
                </p>
                <p className="text-primary text-sm break-words">
                  {post.hashtags}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
