/// <reference types="astro/client" />

import type { Lang } from "./i18n/config";
import type { Dictionary } from "./i18n/dictionaries/es";

declare global {
  namespace App {
    interface Locals {
      lang: Lang;
      dict: Dictionary;
    }
  }
}
