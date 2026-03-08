import { useEffect, useState } from "react";
import { animate } from "motion";

export default function FloatingButtons() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Mostrar botón cuando el usuario ha hecho scroll más de 300px
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Verificar posición inicial

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWhatsApp = () => {
    // Número de WhatsApp de Roca Business
    // Formato: código país + número sin signos (+506 XXXX-XXXX → 506XXXXXXXX)
    const phoneNumber = "50688348619"; // Reemplazar con el número real
    const message = encodeURIComponent(
      "Hola, me gustaría obtener más información sobre sus propiedades y servicios."
    );
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* Botón de WhatsApp (siempre visible) */}
      <button
        onClick={handleWhatsApp}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
        aria-label="Contactar por WhatsApp"
      >
        {/* Onda de pulso */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-75"></span>
        
        {/* Ícono de WhatsApp */}
        <svg
          className="relative z-10 h-7 w-7 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>

        {/* Tooltip */}
        <span className="absolute right-full mr-3 whitespace-nowrap rounded-lg bg-deepest px-3 py-2 font-heading text-sm text-light opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100">
          Contactar por WhatsApp
        </span>
      </button>

      {/* Botón de Scroll to Top (visible solo después de scroll) */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-light shadow-lg transition-all duration-300 hover:scale-110 hover:bg-light/80 hover:shadow-xl animate-fade-in"
          aria-label="Volver arriba"
        >
          {/* Ícono de flecha hacia arriba */}
          <svg
            className="h-6 w-6 text-blue transition-transform duration-300 group-hover:-translate-y-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
}
      `}</style>
    </div>
  );
}
