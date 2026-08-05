import type { Lang } from "./config";
import type { PropertyStatus, PropertyType } from "../types/property";

const propertyTypeLabels: Record<PropertyType, Record<Lang, string>> = {
  casa: { es: "Casa", en: "House" },
  finca: { es: "Finca", en: "Farm" },
  lote: { es: "Lote", en: "Lot" },
  carro: { es: "Carro", en: "Car" },
  construccion_en_lote: { es: "Construcción", en: "New Construction" },
};

const propertyStatusLabels: Record<PropertyStatus, Record<Lang, string>> = {
  activo: { es: "Activa", en: "Active" },
  vendido: { es: "Vendida", en: "Sold" },
  pendiente_revision: { es: "Pendiente", en: "Pending" },
  inactivo: { es: "Inactiva", en: "Inactive" },
};

// Etiquetas cortas para las tarjetas de propiedades (card view)
export const detailSpecLabels: Record<string, Record<Lang, string>> = {
  bedrooms: { es: "Habitaciones", en: "Bedrooms" },
  bathrooms: { es: "Baños", en: "Bathrooms" },
  area: { es: "Área", en: "Area" },
  hectares: { es: "Hectáreas", en: "Hectares" },
  zoning: { es: "Zonificación", en: "Zoning" },
  district: { es: "Distrito", en: "District" },
  year: { es: "Año", en: "Year" },
  transmission: { es: "Transmisión", en: "Transmission" },
  mileage: { es: "Kilometraje", en: "Mileage" },
};

// Etiquetas para la ficha de propiedad (página de detalle)
export const propertyFieldLabels = {
  description: { es: "Descripción", en: "Description" },
  characteristics: { es: "Características", en: "Features" },
  amenities: { es: "Amenidades y Servicios", en: "Amenities & Services" },
  vehicleSpecs: { es: "Especificaciones del Vehículo", en: "Vehicle Specifications" },
  bedrooms: { es: "Habitaciones", en: "Bedrooms" },
  bathrooms: { es: "Baños", en: "Bathrooms" },
  areaM2: { es: "m² área", en: "m² area" },
  parking: { es: "Parqueos", en: "Parking Spots" },
  hectares: { es: "Hectáreas", en: "Hectares" },
  zoning: { es: "Zonificación", en: "Zoning" },
  location: { es: "Ubicación", en: "Location" },
  vereda: { es: "Vereda", en: "Path/Trail" },
  kitchen: { es: "Cocina", en: "Kitchen" },
  livingRoom: { es: "Sala", en: "Living Room" },
  garage: { es: "Cochera", en: "Garage" },
  water: { es: "Agua disponible", en: "Water Available" },
  electricity: { es: "Electricidad", en: "Electricity" },
  constructionIn: { es: "Construcción en", en: "Construction in" },
  veredaPrefix: { es: "Vereda:", en: "Path/Trail:" },
  zoningPrefix: { es: "Zonificación:", en: "Zoning:" },
  brand: { es: "Marca", en: "Brand" },
  model: { es: "Modelo", en: "Model" },
  year: { es: "Año", en: "Year" },
  mileage: { es: "Kilometraje", en: "Mileage" },
  transmission: { es: "Transmisión", en: "Transmission" },
  fuel: { es: "Combustible", en: "Fuel" },
  engineCc: { es: "Cilindraje", en: "Engine Displacement" },
  color: { es: "Color", en: "Color" },
  price: { es: "Precio", en: "Price" },
  onRequest: { es: "Consultar", en: "Contact for price" },
  backLink: { es: "Volver Atrás", en: "Back" },
  share: { es: "Compartir", en: "Share" },
  shareAria: { es: "Compartir propiedad", en: "Share property" },
  linkCopied: { es: "Enlace copiado al portapapeles", en: "Link copied to clipboard" },
  breadcrumbHome: { es: "Inicio", en: "Home" },
  breadcrumbProperties: { es: "Propiedades", en: "Properties" },
} satisfies Record<string, Record<Lang, string>>;

export function getTypeLabel(type: PropertyType, lang: Lang): string {
  return propertyTypeLabels[type]?.[lang] ?? type;
}

export function getStatusLabel(status: PropertyStatus, lang: Lang): string {
  return propertyStatusLabels[status]?.[lang] ?? status;
}

export function getStatusClass(status: PropertyStatus | string): string {
  if (status === "vendido") return "bg-[#E3B83A] text-deepest";
  if (status === "pendiente_revision") return "bg-mid/40 text-deepest";
  if (status === "inactivo") return "bg-deepest/70 text-white";
  return "bg-[#2D9E6B] text-white";
}

export function getSpecLabel(key: string, lang: Lang): string {
  return detailSpecLabels[key]?.[lang] ?? key;
}

export function getSpecIcon(key: string): string {
  if (key === "bedrooms") return "bed";
  if (key === "bathrooms") return "bath";
  if (key === "area" || key === "hectares") return "area";
  if (key === "year") return "calendar";
  if (key === "transmission") return "gear";
  if (key === "mileage") return "speedometer";
  if (key === "zoning") return "map";
  if (key === "district") return "location";
  return "default";
}

export function field(key: keyof typeof propertyFieldLabels, lang: Lang): string {
  return propertyFieldLabels[key][lang];
}
