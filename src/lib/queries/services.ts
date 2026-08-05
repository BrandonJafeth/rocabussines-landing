import { supabase } from "../supabase";
import type { HomeService, Service } from "../../types/service";
import type { Lang } from "../../i18n/config";

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

function mapServiceToHomeService(service: Service, lang: Lang = "es"): HomeService {
  const title = lang === "en" && service.name_en?.trim() ? service.name_en : service.name;
  const description =
    lang === "en" && service.description_en?.trim()
      ? service.description_en
      : service.description ??
        (lang === "en"
          ? "More information about this service coming soon."
          : "Próximamente más información sobre este servicio.");

  return {
    id: service.id,
    title,
    description,
    icon: normalizeIcon(service.icon),
  };
}

export async function getActiveServicesForHome(limit = 12, lang: Lang = "es"): Promise<HomeService[]> {
  const { data, error } = await supabase
    .from("services")
    .select("id, name, name_en, description, description_en, icon, is_active, created_at, updated_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error loading services:", error.message);
    return [];
  }

  return ((data ?? []) as Service[]).map((service) => mapServiceToHomeService(service, lang));
}

export async function getAllActiveServices(lang: Lang = "es"): Promise<HomeService[]> {
  const { data, error } = await supabase
    .from("services")
    .select("id, name, name_en, description, description_en, icon, is_active, created_at, updated_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading all services:", error.message);
    return [];
  }

  return ((data ?? []) as Service[]).map((service) => mapServiceToHomeService(service, lang));
}
