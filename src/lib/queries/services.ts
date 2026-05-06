import { supabase } from "../supabase";
import type { HomeService, Service } from "../../types/service";

type ServiceIcon = HomeService["icon"];

const iconMap: Record<string, ServiceIcon> = {
  chart: "chart",
  chartline: "chart",
  barchart3: "chart",
  piechart: "chart",
  filetext: "document",
  document: "document",
  clipboardlist: "document",
  dollar: "currency",
  currency: "currency",
  handcoins: "currency",
  building: "building",
  building2: "building",
  home: "building",
  users: "users",
  userround: "users",
  usercog: "users",
  wrench: "building",
};

function normalizeIcon(value: string | null): ServiceIcon {
  if (!value) return "building";
  const key = value.replace(/[^a-z0-9]/gi, "").toLowerCase();
  return iconMap[key] ?? "building";
}

function mapServiceToHomeService(service: Service): HomeService {
  return {
    id: service.id,
    title: service.name,
    description: service.description ?? "Próximamente más información sobre este servicio.",
    icon: normalizeIcon(service.icon),
  };
}

export async function getActiveServicesForHome(limit = 12): Promise<HomeService[]> {
  const { data, error } = await supabase
    .from("services")
    .select("id, name, description, icon, is_active, created_at, updated_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error loading services:", error.message);
    return [];
  }

  return ((data ?? []) as Service[]).map(mapServiceToHomeService);
}

export async function getAllActiveServices(): Promise<HomeService[]> {
  const { data, error } = await supabase
    .from("services")
    .select("id, name, description, icon, is_active, created_at, updated_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading all services:", error.message);
    return [];
  }

  return ((data ?? []) as Service[]).map(mapServiceToHomeService);
}

export async function getAllActiveServicesRaw(): Promise<Service[]> {
  const { data, error } = await supabase
    .from("services")
    .select("id, name, description, icon, is_active, created_at, updated_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading all raw services:", error.message);
    return [];
  }

  return (data ?? []) as Service[];
}
