import { useMemo, useState } from "react";
import type { PropertyType } from "../../types/property";

interface PropertyFiltersProps {
  initialLocation?: string;
  initialType?: string;
}

const propertyTypeOptions: Array<{ value: PropertyType; label: string }> = [
  { value: "casa", label: "Casa" },
  { value: "finca", label: "Finca" },
  { value: "lote", label: "Lote" },
  { value: "carro", label: "Carro" },
  { value: "construccion_en_lote", label: "Construcción en Lote" },
];

export default function PropertyFilters({
  initialLocation = "",
  initialType = "",
}: PropertyFiltersProps) {
  const [location, setLocation] = useState(initialLocation);
  const [type, setType] = useState(initialType);

  const selectedType = useMemo(
    () => propertyTypeOptions.find((option) => option.value === type)?.value ?? "",
    [type],
  );

   const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams();

    // Importante: construir desde cero, no desde window.location.search
    if (location.trim()) {
      params.set("ubicacion", location.trim());
    }

    if (selectedType) {
      params.set("tipo", selectedType);
    }

    const queryString = params.toString();
    const targetUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;

    // Esto fuerza la recarga completa para que Astro regenere con los nuevos params
    window.location.href = targetUrl;
  };

  

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white p-5 shadow-[0_16px_38px_rgba(11,37,69,0.12)] md:p-6"
      aria-label="Filtros de propiedades"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr_auto] md:items-end">
        <label className="block">
          <span className="mb-2 block text-sm font-heading font-bold text-deepest">
            Ubicación
          </span>
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mid"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 21s-7-4.35-7-11a7 7 0 1114 0c0 6.65-7 11-7 11z"
              />
              <circle cx="12" cy="10" r="2.5" strokeWidth="2" />
            </svg>
            <input
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Buscar por ciudad, zona o colonia..."
              className="h-12 w-full rounded-xl border border-mid/30 bg-white pl-11 pr-4 text-sm font-heading text-deepest outline-none transition-colors placeholder:text-mid/70 focus:border-primary"
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-heading font-bold text-deepest">
            Tipo de Propiedad
          </span>
          <div className="relative">
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="h-12 w-full appearance-none rounded-xl border border-mid/30 bg-white px-4 text-sm font-heading text-deepest outline-none transition-colors focus:border-primary"
            >
              <option value="">Todos</option>
              {propertyTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mid"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 7l5 5 5-5"
              />
            </svg>
          </div>
        </label>

        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 font-heading font-bold text-white transition-all duration-300 hover:bg-deepest"
        >
          Buscar
        </button>
      </div>
    </form>
  );
}
