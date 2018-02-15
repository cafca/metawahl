export const ErrorState = "loading" | "success" | "error";

export type PositionType = {
  value: -1 | 0 | 1 | "missing",
  party: string,
  text?: string,
  pct?: number,
  missing?: boolean
};

export type TagType = {
  title: string,
  slug: string,
  description?: string,
  url: ?string,
  wikidata_id: string,
  wikipedia_title?: string,
  labels?: Array<string>,
  aliases?: Array<string>,
  related_tags?: { count: number, tag: TagType }
};

export type ObjectionVoteType = {
  uuid: string,
  value: boolean,
  objection_id: string,
  date?: string
};

export type ObjectionType = {
  id: string,
  url: string,
  uuid: string,
  thesis_id: string,
  votes: Array<ObjectionVoteType>,
  vote_count: number,
  date?: string
};

export type ThesisType = {
  id: string,
  text: string,
  title: ?string,
  categories: Array<string>,
  tags: Array<TagType>,
  occasion_id: number,
  positions: Array<PositionType>,
  objections: Array<ObjectionType>
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

export type MergedPartyDataType =
  PositionType & ResultsType & { party: string } ;

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
  theses?: Array<ThesisType> | Array<string>,
  thesis_count?: number
};

export type RouteProps = {
  isLoading: boolean,
  occasions: OccasionListType,
  categories: Array<CategoryType>,
  tags: Array<TagType>
};

export type ErrorType = Error | {
  error?: string
};
