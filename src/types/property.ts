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
  description: string | null;
  location: string | null;
  price: number | null;
  currency: Currency | null;
  status: PropertyStatus;
  images: string[] | null;
  is_featured: boolean;
  display_order: number | null;
  maps_url: string | null;
  created_at: string;
  updated_at: string;
  property_real_estate?: PropertyRealEstate[] | PropertyRealEstate | null;
  property_vehicles?: PropertyVehicle[] | PropertyVehicle | null;
}

export interface PropertyRealEstate {
  property_id: string;
  bedrooms: number | null;
  bathrooms: number | null;
  parking_spots: number | null;
  area_m2: number | null;
  hectares: number | null;
  has_kitchen: boolean | null;
  has_living_room: boolean | null;
  address_detail: string | null;
  vereda: string | null;
  zoning: string | null;
  cochera: boolean | null;
  has_water: boolean | null;
  has_electricity: boolean | null;
  provincia: string | null;
  canton: string | null;
  distrito: string | null;
  construction_type: string | null;
  has_construction: boolean | null;
}

export interface PropertyVehicle {
  property_id: string;
  make: string | null;
  model: string | null;
  year: number | null;
  mileage: number | null;
  engine_cc: number | null;
  transmission: string | null;
  fuel_type: string | null;
  color: string | null;
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
