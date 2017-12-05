export type PositionType = {
  value: -1 | 0 | 1,
  party: string,
  text?: string
};

export type ThesisType = {
  id: string,
  title: string,
  text: string,
  positions: ?Array<PositionType>
};

export type OccasionMetaType = {
  title: string,
  occasion_id: string,
  extraData: { texts: Array<string> },
  num: number,
  wikidata: string,
  data: string,
  territory: string,
  type: "Wahl-o-Mat"
};

export type OccasionType = {
  occasion: OccasionMetaType,
  parties: Array<Party>,
  theses: Array<ThesisType>
};

export type PartyType = {
  longname: string,
  name: string
};

export type CategoryType = Array<String>;

export type RouteProps = {
  occasions: ?{ [ womID: number ]: OccasionType },
  categories: ?{ [ category: string ]: CategoryType },
  positions: ?{ [ womID: number ]: PositionType },
  loadPositions: ( string ) => mixed
};
