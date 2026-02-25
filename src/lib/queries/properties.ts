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
    ];
  }

  if (type === "lote" || type === "construccion_en_lote") {
    const area = realEstate?.area_m2
      ? `${formatCompactNumber(realEstate.area_m2)} m²`
      : realEstate?.hectares
        ? `${realEstate.hectares} ha`
        : "—";

    return [
      {
        label: "Área",
        value: area,
      },
    ];
  }

  return [
    {
      label: "Hab",
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

function mapPropertyToFeatured(property: Property): HomeFeaturedProperty {
  const image = property.images?.[0] ?? FALLBACK_IMAGE;

  return {
    id: property.id,
    type: property.type,
    title: property.title,
    location: property.location ?? "Costa Rica",
    price: property.price ? Number(property.price) : 0,
    currency: property.currency ?? "USD",
    status: property.status,
    image,
    details: getDetailsByType(property),
  };
}

export async function getFeaturedProperties(limit = 3): Promise<HomeFeaturedProperty[]> {
  const { data, error } = await supabase
    .from("properties")
    .select(
      "id, type, title, location, price, currency, status, images, is_featured, display_order, property_real_estate(bedrooms, bathrooms, area_m2, hectares), property_vehicles(year, mileage, transmission)"
    )
    .eq("status", "activo")
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
  type?: PropertyType;
}

export async function getCatalogProperties(filters?: {
  location?: string;
  type?: PropertyType;
}): Promise<HomeFeaturedProperty[]> {
  let query = supabase
    .from("properties")
    .select(
      "id, type, title, location, price, currency, status, images, is_featured, display_order, property_real_estate(bedrooms, bathrooms, area_m2, hectares), property_vehicles(year, mileage, transmission)"
    )
    .eq("status", "activo")
    .order("display_order", { ascending: true });

  // Filtro por tipo de propiedad
  if (filters?.type) {
    query = query.eq("type", filters.type);
  }

  // Filtro por ubicación (búsqueda parcial, case-insensitive)
  if (filters?.location) {
    query = query.ilike("location", `%${filters.location}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error loading catalog properties:", error.message);
    return [];
  }

  return ((data ?? []) as Property[]).map(mapPropertyToFeatured);
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
    .eq("status", "activo")
    .single();

  if (error) {
    console.error("Error loading property:", error.message);
    return null;
  }

  return data as Property;
}