import { products } from "@/data/products";
import ProductCard from "./ProductCard";

const ProductsGrid = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Nossa Linha de Temperos
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Selecione um produto para ver as opções de posts para suas redes sociais. 
            Copie o texto e use diretamente no Instagram ou Facebook.
          </p>
          
          {/* Decorative Line */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-primary/50" />
            <div className="w-2 h-2 bg-primary rounded-full" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-primary/50" />
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsGrid;
