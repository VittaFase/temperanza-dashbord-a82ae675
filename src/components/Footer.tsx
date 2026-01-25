import { Instagram } from "lucide-react";
import logoChef from "@/assets/logo-chef.png";

const Footer = () => {
  return (
    <footer className="bg-hero-gradient py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center">
          {/* Logo */}
          <img
            src={logoChef}
            alt="Temperanza Gastronomia"
            className="w-20 h-20 object-contain mb-4 opacity-80"
          />

          {/* Brand */}
          <h3 className="font-display text-2xl font-bold text-cream mb-2">
            Temperanza Gastronomia
          </h3>

          {/* Social */}
          <a
            href="https://instagram.com/temperanzacondimentos"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-cream/70 hover:text-gold transition-colors mt-4"
          >
            <Instagram className="w-5 h-5" />
            <span>@temperanzacondimentos</span>
          </a>

          {/* Divider */}
          <div className="w-24 h-px bg-gold/30 my-6" />

          {/* Copyright */}
          <p className="text-cream/50 text-sm">
            © {new Date().getFullYear()} Temperanza Gastronomia. Todos os direitos reservados.
          </p>
          
          <p className="text-cream/40 text-xs mt-2">
            A arte de temperar com paixão e tradição
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
