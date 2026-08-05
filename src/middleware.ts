import { defineMiddleware } from "astro:middleware";
import { DEFAULT_LANG, LANG_COOKIE, isLang } from "./i18n/config";
import { es } from "./i18n/dictionaries/es";
import { en } from "./i18n/dictionaries/en";

export const onRequest = defineMiddleware(async (context, next) => {
  const url = context.url;
  const queryLang = url.searchParams.get("lang");

  if (isLang(queryLang)) {
    context.cookies.set(LANG_COOKIE, queryLang, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    url.searchParams.delete("lang");
    return context.redirect(url.pathname + url.search, 302);
  }

  const cookieLang = context.cookies.get(LANG_COOKIE)?.value;
  const lang = isLang(cookieLang) ? cookieLang : DEFAULT_LANG;

  context.locals.lang = lang;
  context.locals.dict = lang === "en" ? en : es;

  return next();
});
