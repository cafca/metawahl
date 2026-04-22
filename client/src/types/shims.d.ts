// Type shim for `wikidata-sdk` (v8, which ships without bundled types and
// whose `@types/wikidata-sdk` package covers the pre-v7 API only). The v8
// module is the default `wikibase-sdk` instance bound to wikidata.org; we
// only use `searchEntities` and `getEntities` from it.

declare module "wikidata-sdk" {
  interface SearchEntitiesOptions {
    search: string;
    language?: string;
    limit?: number;
    continue?: number;
    format?: "json" | "xml";
    uselang?: string;
    type?: "item" | "property" | "lexeme" | "form" | "sense";
  }

  interface GetEntitiesOptions {
    ids: string | string[];
    languages?: string | string[];
    props?: string | string[];
    format?: "json" | "xml";
    redirects?: "yes" | "no";
  }

  export function searchEntities(options: SearchEntitiesOptions): string;
  export function getEntities(options: GetEntitiesOptions): string;

  const wikidata: {
    searchEntities: typeof searchEntities;
    getEntities: typeof getEntities;
    [key: string]: unknown;
  };

  export default wikidata;
}
