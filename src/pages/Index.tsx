import Hero from "@/components/Hero";
import ProductsGrid from "@/components/ProductsGrid";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <ProductsGrid />
      <Footer />
    </div>
  );
};

export default Index;
