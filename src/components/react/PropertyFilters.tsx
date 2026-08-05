import { useEffect, useMemo, useState } from "react";
import type { PropertyType } from "../../types/property";
import { es } from "../../i18n/dictionaries/es";
import { en } from "../../i18n/dictionaries/en";
import type { Lang } from "../../i18n/config";

interface PropertyFiltersProps {
  initialProvincia?: string;
  initialCanton?: string;
  initialDistrito?: string;
  initialType?: string;
  lang?: Lang;
}

interface LocationData {
  [key: string]: string;
}

const API_BASE = import.meta.env.PUBLIC_API_BASE_URL_LUGARES;

export default function PropertyFilters({
  initialProvincia = "",
  initialCanton = "",
  initialDistrito = "",
  initialType = "",
  lang = "es",
}: PropertyFiltersProps) {
  const dict = lang === "en" ? en : es;
  const propertyTypeOptions: Array<{ value: PropertyType; label: string }> = [
    { value: "casa", label: dict.propertyFilters.typeOptions.casa },
    { value: "finca", label: dict.propertyFilters.typeOptions.finca },
    { value: "lote", label: dict.propertyFilters.typeOptions.lote },
    { value: "carro", label: dict.propertyFilters.typeOptions.carro },
    { value: "construccion_en_lote", label: dict.propertyFilters.typeOptions.construccion_en_lote },
  ];
  const [type, setType] = useState(initialType);
  
  // Estados para las ubicaciones
  const [provincia, setProvincia] = useState("");
  const [canton, setCanton] = useState("");
  const [distrito, setDistrito] = useState("");
  
  // Estados para los datos del API
  const [provincias, setProvincias] = useState<LocationData>({});
  const [cantones, setCantones] = useState<LocationData>({});
  const [distritos, setDistritos] = useState<LocationData>({});
  
  // Estados de carga
  const [loadingCantones, setLoadingCantones] = useState(false);
  const [loadingDistritos, setLoadingDistritos] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const selectedType = useMemo(
    () => propertyTypeOptions.find((option) => option.value === type)?.value ?? "",
    [type],
  );

  // Cargar provincias al montar el componente
  useEffect(() => {
    fetch(`${API_BASE}/provincias.json`)
      .then((res) => res.json())
      .then((data: LocationData) => {
        setProvincias(data);
        setIsInitializing(false);
      })
      .catch((err) => {
        console.error("Error cargando provincias:", err);
        setIsInitializing(false);
      });
  }, []);

  // Inicializar valores desde los parámetros URL
  useEffect(() => {
    if (isInitializing || Object.keys(provincias).length === 0) return;

    // Buscar el ID de la provincia por su nombre
    if (initialProvincia) {
      const provinciaId = Object.entries(provincias).find(
        ([_, nombre]) => nombre === initialProvincia
      )?.[0];
      
      if (provinciaId) {
        setProvincia(provinciaId);
        
        // Cargar cantones para esta provincia
        if (initialCanton) {
          fetch(`${API_BASE}/provincia/${provinciaId}/cantones.json`)
            .then((res) => res.json())
            .then((data: LocationData) => {
              setCantones(data);
              
              // Buscar el ID del cantón por su nombre
              const cantonId = Object.entries(data).find(
                ([_, nombre]) => nombre === initialCanton
              )?.[0];
              
              if (cantonId) {
                setCanton(cantonId);
                
                // Cargar distritos para este cantón
                if (initialDistrito) {
                  fetch(`${API_BASE}/provincia/${provinciaId}/canton/${cantonId}/distritos.json`)
                    .then((res) => res.json())
                    .then((data: LocationData) => {
                      setDistritos(data);
                      
                      // Buscar el ID del distrito por su nombre
                      const distritoId = Object.entries(data).find(
                        ([_, nombre]) => nombre === initialDistrito
                      )?.[0];
                      
                      if (distritoId) {
                        setDistrito(distritoId);
                      }
                    })
                    .catch((err) => console.error("Error cargando distritos:", err));
                }
              }
            })
            .catch((err) => console.error("Error cargando cantones:", err));
        }
      }
    }
  }, [provincias, isInitializing, initialProvincia, initialCanton, initialDistrito]);

  // Cargar cantones cuando cambia la provincia (solo si no estamos inicializando)
  useEffect(() => {
    if (isInitializing) return;
    
    if (provincia) {
      setLoadingCantones(true);
      setCanton("");
      setDistrito("");
      setCantones({});
      setDistritos({});
      
      fetch(`${API_BASE}/provincia/${provincia}/cantones.json`)
        .then((res) => res.json())
        .then((data: LocationData) => {
          setCantones(data);
          setLoadingCantones(false);
        })
        .catch((err) => {
          console.error("Error cargando cantones:", err);
          setLoadingCantones(false);
        });
    } else {
      setCantones({});
      setCanton("");
      setDistrito("");
      setDistritos({});
    }
  }, [provincia, isInitializing]);

  // Cargar distritos cuando cambia el cantón (solo si no estamos inicializando)
  useEffect(() => {
    if (isInitializing) return;
    
    if (provincia && canton) {
      setLoadingDistritos(true);
      setDistrito("");
      setDistritos({});
      
      fetch(`${API_BASE}/provincia/${provincia}/canton/${canton}/distritos.json`)
        .then((res) => res.json())
        .then((data: LocationData) => {
          setDistritos(data);
          setLoadingDistritos(false);
        })
        .catch((err) => {
          console.error("Error cargando distritos:", err);
          setLoadingDistritos(false);
        });
    } else {
      setDistritos({});
      setDistrito("");
    }
  }, [provincia, canton, isInitializing]);

   const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams();

    // Enviar provincia, cantón y distrito como parámetros separados
   if (provincia && provincias[provincia]) {
      params.set("provincia", provincias[provincia]);
    }
    if (canton && cantones[canton]) {
      params.set("canton", cantones[canton]);
    }
    if (distrito && distritos[distrito]) {
      params.set("distrito", distritos[distrito]);
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
      aria-label={dict.propertyFilters.ariaLabel}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_1fr_1fr_auto] md:items-end">
        {/* Provincia */}
        <label className="block">
          <span className="mb-2 block text-sm font-heading font-bold text-deepest">
            {dict.propertyFilters.provincia}
          </span>
          <div className="relative">
            <select
              value={provincia}
              onChange={(event) => setProvincia(event.target.value)}
              className="h-12 w-full appearance-none rounded-xl border border-mid/30 bg-white px-4 text-sm font-heading text-deepest outline-none transition-colors focus:border-primary"
            >
              <option value="">{dict.propertyFilters.all}</option>
              {Object.entries(provincias).map(([id, nombre]) => (
                <option key={id} value={id}>
                  {nombre}
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

        {/* Cantón */}
        <label className="block">
          <span className="mb-2 block text-sm font-heading font-bold text-deepest">
            {dict.propertyFilters.canton}
          </span>
          <div className="relative">
            <select
              value={canton}
              onChange={(event) => setCanton(event.target.value)}
              disabled={!provincia || loadingCantones}
              className="h-12 w-full appearance-none rounded-xl border border-mid/30 bg-white px-4 text-sm font-heading text-deepest outline-none transition-colors focus:border-primary disabled:bg-mid/5 disabled:cursor-not-allowed disabled:text-mid"
            >
              <option value="">
                {loadingCantones ? dict.propertyFilters.loading : provincia ? dict.propertyFilters.allMasc : dict.propertyFilters.selectProvincia}
              </option>
              {Object.entries(cantones).map(([id, nombre]) => (
                <option key={id} value={id}>
                  {nombre}
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

        {/* Distrito */}
        <label className="block">
          <span className="mb-2 block text-sm font-heading font-bold text-deepest">
            {dict.propertyFilters.distrito}
          </span>
          <div className="relative">
            <select
              value={distrito}
              onChange={(event) => setDistrito(event.target.value)}
              disabled={!canton || loadingDistritos}
              className="h-12 w-full appearance-none rounded-xl border border-mid/30 bg-white px-4 text-sm font-heading text-deepest outline-none transition-colors focus:border-primary disabled:bg-mid/5 disabled:cursor-not-allowed disabled:text-mid"
            >
              <option value="">
                {loadingDistritos ? dict.propertyFilters.loading : canton ? dict.propertyFilters.allMasc : dict.propertyFilters.selectCanton}
              </option>
              {Object.entries(distritos).map(([id, nombre]) => (
                <option key={id} value={id}>
                  {nombre}
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

        {/* Tipo de Propiedad */}
        <label className="block">
          <span className="mb-2 block text-sm font-heading font-bold text-deepest">
            {dict.propertyFilters.tipo}
          </span>
          <div className="relative">
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="h-12 w-full appearance-none rounded-xl border border-mid/30 bg-white px-4 text-sm font-heading text-deepest outline-none transition-colors focus:border-primary"
            >
              <option value="">{dict.propertyFilters.allMasc}</option>
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
          {dict.propertyFilters.search}
        </button>
      </div>
    </form>
  );
}
