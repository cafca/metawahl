export const ErrorState = "loading" | "success" | "error";

export type PositionType = {
  value: -1 | 0 | 1,
  party: string,
  text?: string,
  pct?: number
};

export type TagType = {
  title: string,
  slug: string,
  description?: string,
  url: ?string,
  wikidata_id: ?string,
  wikipedia_title?: string,
  labels?: Array<string>,
  aliases?: Array<string>,
  related_tags?: { count: number, tag: TagType }
};

export type ThesisType = {
  id: string,
  text: string,
  title: ?string,
  categories: Array<string>,
  tags: Array<TagType>,
  occasion_id: number,
  positions: Array<PositionType>
};

export type ResultsType = {
  [party: string]: {
    votes: number,
    pct: number,
    is_seated?: boolean,
    is_mandated?: boolean,
    source?: string
  }
};

export type OccasionType = {
  id: number,
  date: string,
  results: ResultsType,
  source: ?string,
  territory: string,
  theses?: Array<ThesisType>,
  title: string,
  wikidata_id: ?string,
  wikipedia_title: ?string
};

export type OccasionListType = {
  [ territory: string ]: Array<OccasionType>
};

export type PartyType = {
  longname: string,
  name: string
};

export type CategoryType = {
  name: string,
  slug: string,
  related_tags?: { count: number, tag: TagType },
  theses?: Array<ThesisType> | Array<string>
};

export type RouteProps = {
  load: (string) => mixed,
  save: (string, string) => mixed
};
