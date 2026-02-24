export type Currency = "CRC" | "USD";

export type PropertyType =
  | "casa"
  | "finca"
  | "lote"
  | "carro"
  | "construccion_en_lote";

export type PropertyStatus =
  | "activo"
  | "vendido"
  | "inactivo"
  | "pendiente_revision";

export interface Property {
  id: string;
  type: PropertyType;
  title: string;
  location: string | null;
  price: number | null;
  currency: Currency | null;
  status: PropertyStatus;
  images: string[] | null;
  is_featured: boolean;
  display_order: number | null;
  property_real_estate?: PropertyRealEstate[] | PropertyRealEstate | null;
  property_vehicles?: PropertyVehicle[] | PropertyVehicle | null;
}

export interface PropertyRealEstate {
  bedrooms: number | null;
  bathrooms: number | null;
  area_m2: number | null;
  hectares: number | null;
}

export interface PropertyVehicle {
  year: number | null;
  mileage: number | null;
  transmission: string | null;
}

export interface HomeFeaturedProperty {
  id: string;
  type: PropertyType;
  title: string;
  location: string;
  price: number;
  currency: Currency;
  status: PropertyStatus;
  image: string;
  details: Array<{ label: string; value: string }>;
}
