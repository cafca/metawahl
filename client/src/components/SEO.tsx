import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { SITE_ROOT } from "@/config";

type SEOProps = {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  width?: number;
  height?: number;
  type?: "article" | "website";
  lang?: string;
};

const locales: Record<string, string> = { de: "de_DE" };

declare global {
  interface Window {
    fathom?: (event: string) => void;
  }
}

export function SEO({
  title,
  description = "Welche Politik wird in Deutschland tatsächlich gewählt?",
  canonical,
  image,
  width = 1200,
  height = 630,
  type = "article",
  lang = "de",
}: SEOProps) {
  const location = useLocation();

  useEffect(() => {
    window.fathom?.("trackPageview");
  }, [location.pathname]);

  const fullCanonical = canonical ? `${SITE_ROOT}${canonical}` : undefined;
  const fullImage = image ? `${SITE_ROOT}${image}` : undefined;
  const resolvedTitle = title ?? "Metawahl";

  return (
    <>
      <title>{resolvedTitle}</title>
      <meta name="description" content={description} />
      {fullCanonical && <link rel="canonical" href={fullCanonical} />}
      {fullImage && <link rel="image_src" href={fullImage} />}
      {fullImage && <meta itemProp="image" content={fullImage} />}

      <meta property="og:site_name" content="Metawahl" />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={description} />
      {fullCanonical && <meta property="og:url" content={fullCanonical} />}
      <meta property="og:locale" content={locales[lang] ?? "de_DE"} />
      <meta property="og:type" content={type} />
      {fullImage && <meta property="og:image" content={fullImage} />}
      {fullImage && (
        <meta property="og:image:width" content={String(width)} />
      )}
      {fullImage && (
        <meta property="og:image:height" content={String(height)} />
      )}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={description} />
      {fullImage && <meta name="twitter:image" content={fullImage} />}
      <meta name="twitter:site" content="@ciex" />
      {fullCanonical && (
        <link rel="alternate" href={fullCanonical} hrefLang={lang} />
      )}
    </>
  );
}

export default SEO;
