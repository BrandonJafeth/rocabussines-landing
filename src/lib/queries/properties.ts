import { supabase } from "../supabase";
import type {
  HomeFeaturedProperty,
  Property,
  PropertyType,
  PropertyRealEstate,
  PropertyVehicle,
} from "../../types/property";

const FALLBACK_IMAGE =
  "https://res.cloudinary.com/dnziwpiec/image/upload/v1771916220/roca-business/propiedades/pexels-scottwebb-1029599_dywxnv.jpg";

function getFirstRelation<T>(value: T[] | T | null | undefined): T | null {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("es-CR").format(value);
}

function getDetailsByType(property: Property): Array<{ label: string; value: string }> {
  const type = property.type;
  const realEstate = getFirstRelation<PropertyRealEstate>(property.property_real_estate);
  const vehicle = getFirstRelation<PropertyVehicle>(property.property_vehicles);

  if (type === "carro") {
    return [
      {
        label: "Año",
        value: vehicle?.year ? String(vehicle.year) : "—",
      },
      {
        label: "Transmisión",
        value: vehicle?.transmission ?? "—",
      },
      {
        label: "Kilometraje",
        value: vehicle?.mileage ? `${formatCompactNumber(vehicle.mileage)} km` : "—",
      },
    ];
  }

  if (type === "lote" || type === "finca" || type === "construccion_en_lote") {
    const detailsList = [];
    
    // Área en m²
    if (realEstate?.area_m2) {
      detailsList.push({
        label: "Área",
        value: `${formatCompactNumber(realEstate.area_m2)} m²`,
      });
    }
    
    // Hectáreas
    if (realEstate?.hectares) {
      detailsList.push({
        label: "Hectáreas",
        value: `${realEstate.hectares} ha`,
      });
    }
    
    // Zonificación si está disponible
    if (realEstate?.zoning) {
      detailsList.push({
        label: "Zonificación",
        value: realEstate.zoning,
      });
    }
    
    // Si solo hay 1 o 2 datos, agregar distrito como ubicación específica
    if (detailsList.length < 3 && realEstate?.distrito) {
      detailsList.push({
        label: "Distrito",
        value: realEstate.distrito,
      });
    }

    return detailsList;
  }

  return [
    {
      label: "Habitaciones",
      value: realEstate?.bedrooms ? String(realEstate.bedrooms) : "—",
    },
    {
      label: "Baños",
      value: realEstate?.bathrooms ? String(realEstate.bathrooms) : "—",
    },
    {
      label: "Área",
      value: realEstate?.area_m2 ? `${formatCompactNumber(realEstate.area_m2)} m²` : "—",
    },
  ];
}

function formatLocation(property: Property): { full: string; provincia: string; canton: string; distrito: string } {
  const realEstate = getFirstRelation<PropertyRealEstate>(property.property_real_estate);
  
  const provincia = realEstate?.provincia || "";
  const canton = realEstate?.canton || "";
  const distrito = realEstate?.distrito || "";
  
  // Construir ubicación completa
  const parts = [distrito, canton, provincia].filter(Boolean);
  const fullLocation = parts.length > 0 ? parts.join(", ") : (property.location || "Costa Rica");
  
  return {
    full: fullLocation,
    provincia: provincia, // No usar fallback aquí, dejar vacío si no existe
    canton: canton,
    distrito: distrito
  };
}

function mapPropertyToFeatured(property: Property): HomeFeaturedProperty {
  const image = property.images?.[0] ?? FALLBACK_IMAGE;
  const locationInfo = formatLocation(property);
  
  // Debug: ver qué datos de ubicación tiene la propiedad
  const realEstate = getFirstRelation<PropertyRealEstate>(property.property_real_estate);
  console.log(`📍 Propiedad "${property.title}":`, {
    type: property.type,
    hasRealEstate: !!realEstate,
    provincia: realEstate?.provincia,
    canton: realEstate?.canton,
    distrito: realEstate?.distrito,
    mappedProvincia: locationInfo.provincia,
    mappedCanton: locationInfo.canton,
    mappedDistrito: locationInfo.distrito,
  });

  return {
    id: property.id,
    type: property.type,
    title: property.title,
    location: locationInfo.full,
    provincia: locationInfo.provincia,
    canton: locationInfo.canton,
    distrito: locationInfo.distrito,
    price: property.price ? Number(property.price) : 0,
    currency: property.currency ?? "USD",
    status: property.status,
    image,
    details: getDetailsByType(property),
  };
}

export async function getFeaturedProperties(limit = 5): Promise<HomeFeaturedProperty[]> {
  const { data, error } = await supabase
    .from("properties")
    .select(
      "id, type, title, location, price, currency, status, images, is_featured, display_order, property_real_estate(bedrooms, bathrooms, area_m2, hectares, provincia, canton, distrito, zoning), property_vehicles(year, mileage, transmission)"
    )
    .in("status", ["activo", "vendido"])
    .eq("is_featured", true)
    .order("display_order", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Error loading featured properties:", error.message);
    return [];
  }

  return ((data ?? []) as Property[]).map(mapPropertyToFeatured);
}

interface PropertyCatalogFilters {
  location?: string;
  provincia?: string;
  canton?: string;
  distrito?: string;
  type?: PropertyType;
}

export async function getCatalogProperties(filters?: {
  location?: string;
  provincia?: string;
  canton?: string;
  distrito?: string;
  type?: PropertyType;
}): Promise<HomeFeaturedProperty[]> {
  // Determinar si hay filtros de ubicación activos
  const hasLocationFilters = !!(filters?.provincia || filters?.canton || filters?.distrito);
  // Query base con propiedades activas y vendidas
  const { data, error } = await supabase
    .from("properties")
    .select(
      `id, type, title, location, price, currency, status, images, is_featured, display_order, 
       property_real_estate(bedrooms, bathrooms, area_m2, hectares, provincia, canton, distrito, zoning), 
       property_vehicles(year, mileage, transmission)`
    )
    .in("status", ["activo", "vendido"])
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error loading catalog properties:", error.message);
    return [];
  }

  let properties = ((data ?? []) as Property[]).map(mapPropertyToFeatured);

  // Aplicar filtros en JavaScript
  if (filters?.type) {
    properties = properties.filter(p => p.type === filters.type);
    console.log(`  ✓ Filtrado por tipo "${filters.type}": ${properties.length} propiedades`);
  }

  if (filters?.provincia) {
    properties = properties.filter(p => p.provincia && p.provincia === filters.provincia);
  }

  if (filters?.canton) {
    // Filtrar solo propiedades que tengan cantón y coincida con el filtro
    properties = properties.filter(p => p.canton && p.canton === filters.canton);
  }

  if (filters?.distrito) {
    // Filtrar solo propiedades que tengan distrito y coincida con el filtro
    properties = properties.filter(p => p.distrito && p.distrito === filters.distrito);
  }

  if (filters?.location && !hasLocationFilters) {
    const searchTerm = filters.location.toLowerCase();
    properties = properties.filter(p => 
      p.location?.toLowerCase().includes(searchTerm)
    );
  }
  return properties;
}

/**
 * Obtiene una propiedad individual por ID con todos sus detalles
 * incluyendo información completa de real estate o vehículo según tipo
 */
export async function getPropertyById(id: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from("properties")
    .select(
      `
      *,
      property_real_estate(*),
      property_vehicles(*)
      `
    )
    .eq("id", id)
    .in("status", ["activo", "vendido"])
    .single();

  if (error) {
    console.error("Error loading property:", error.message);
    return null;
  }

  return data as Property;
}