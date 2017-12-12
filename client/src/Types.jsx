export const ErrorState = "loading" | "success" | "error";

export type PositionType = {
  value: -1 | 0 | 1,
  party: string,
  text?: string
};

export type TagType = {
  title: string,
  slug: string,
  description?: string,
  url: ?string,
  wikidata_id: ?string
};

export type ThesisType = {
  id: string,
  text: string,
  title: ?string,
  categories: Array<string>,
  tags: Array<TagType>,
  positions: Array<PositionType>
};

export type OccasionType = {
  id: number,
  date: string,
  source: ?string,
  title: string,
  wikidata_id: ?string,
  theses?: Array<ThesisType>
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
  theses?: Array<ThesisType> | Array<string>
};

export type RouteProps = {
  occasions: ?{ [ womID: number ]: OccasionType },
  categories: ?{ [ category: string ]: CategoryType },
  positions: ?{ [ womID: number ]: PositionType },
  loadPositions: ( string ) => mixed
};
