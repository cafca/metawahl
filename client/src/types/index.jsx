export const ErrorState = "loading" | "success" | "error";

export type PositionType = {
  value: -1 | 0 | 1 | "missing",
  party: string,
  text?: string,
  pct?: number,
  missing?: boolean
};

export type RelatedTag = {
  // This is a Babel bug apparently
  // // Related issue: https://github.com/babel/babel-eslint/pull/584
  // eslint-disable-next-line no-use-before-define
  [name: string]: { count: number, tag: TagType }
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
  related_tags?: {
    parents: RelatedTag,
    linked: RelatedTag
  }
};

export type ReactionsTallyType = {
  [kind: number]: number
}

export type ReactionType = {
  thesis: string,
  kind: number,
  date?: string,
}

export type ThesisType = {
  id: string,
  text: string,
  title: ?string,
  tags: Array<TagType>,
  election_id: number,
  positions: Array<PositionType>,
  reactions: ReactionsTallyType
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

export type ElectionType = {
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

export type ElectionListType = {
  [ territory: string ]: Array<ElectionType>
};

export type PartyType = {
  longname: string,
  name: string
};

export type RouteProps = {
  isLoading: boolean,
  elections: ElectionListType,
  tags: Array<TagType>
};

export type ErrorType = Error | {
  error?: string
};
