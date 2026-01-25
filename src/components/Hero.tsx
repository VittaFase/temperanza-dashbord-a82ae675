import logoChef from "@/assets/logo-chef.png";

const Hero = () => {
  return (
    <section className="bg-hero-gradient relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gold rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="flex flex-col items-center text-center">
          {/* Logo */}
          <div className="mb-8 animate-fade-in">
            <img
              src={logoChef}
              alt="Temperanza Gastronomia - Chef"
              className="w-40 h-40 md:w-52 md:h-52 object-contain drop-shadow-2xl"
            />
          </div>

          {/* Brand Name */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-cream mb-4 animate-slide-up">
            Temperanza
            <span className="block text-gold text-3xl md:text-4xl lg:text-5xl font-medium mt-2">
              Gastronomia
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-cream/80 text-lg md:text-xl max-w-2xl mt-6 font-light animate-slide-up" style={{ animationDelay: "0.1s" }}>
            A arte de temperar com paixão e tradição. Descubra nossa linha premium de temperos artesanais.
          </p>

          {/* Decorative Line */}
          <div className="flex items-center gap-4 mt-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-gold" />
            <div className="w-3 h-3 border-2 border-gold rotate-45" />
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-gold" />
          </div>

          {/* Subtitle */}
          <p className="text-gold/90 text-sm md:text-base uppercase tracking-[0.3em] mt-6 font-medium animate-fade-in" style={{ animationDelay: "0.3s" }}>
            Posts para Redes Sociais
          </p>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path
            d="M0 50C360 0 720 100 1080 50C1260 25 1380 75 1440 50V100H0V50Z"
            fill="hsl(30 25% 95%)"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
