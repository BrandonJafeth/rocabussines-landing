export interface Service {
  id: string;
  name: string;
  name_en?: string | null;
  description: string | null;
  description_en?: string | null;
  icon: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface HomeService {
  id: string;
  title: string;
  description: string;
  icon: "chart" | "document" | "currency" | "building" | "users";
}
