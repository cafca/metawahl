// Typed API models derived from the recorded Playwright fixtures at
// `client/e2e/fixtures/api/*.json`. Only fields observed in those responses
// are declared here; when the legacy code consumes a field that's not in the
// fixtures, it's marked optional.

import type { TerritorySlug } from "@/config";

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

export type Position = -1 | 0 | 1;

// Legacy quiz.jsx typed the answer as `-1 | 0 | 1`. The front-end quiz flow
// in Metawahl only ever sends agree/disagree (translated to 1 / -1) and
// skip (0), so re-use the same union.
export type QuizAnswer = -1 | 0 | 1;

export interface ApiMeta {
  api: string;
  license: string;
  render_time: string;
}

// ---------------------------------------------------------------------------
// Thesis + tag pieces
// ---------------------------------------------------------------------------

export interface ThesisPosition {
  party: string;
  value: Position;
  text?: string;
}

export interface RelatedTagRef {
  count: number;
  tag: string;
}

export interface RelatedTagEmbed {
  count: number;
  tag: Tag;
}

export interface TagRelatedTags {
  // In base.json the `linked` map points to slug strings; in tag detail
  // responses `linked` holds the full tag object. Model both.
  linked?: Record<string, RelatedTagRef | RelatedTagEmbed>;
  parents?: Record<string, RelatedTagRef | RelatedTagEmbed>;
}

export interface Tag {
  slug: string;
  title: string;
  url?: string;
  wikidata_id?: string;
  wikipedia_title?: string;
  description?: string;
  aliases?: string[];
  labels?: string[];
  // `thesis_count`, `root` and `related_tags` appear on base + tag-detail
  // payloads but not on the embedded tags attached to theses.
  thesis_count?: number;
  root?: boolean;
  related_tags?: TagRelatedTags;
}

export interface Thesis {
  id: string;
  election_id: number;
  text: string;
  title: string | null;
  positions: ThesisPosition[];
  tags: Tag[];
}

// ---------------------------------------------------------------------------
// Election pieces
// ---------------------------------------------------------------------------

export interface Result {
  pct: number;
  votes: number | null;
  missing?: boolean;
  linked_position?: string;
}

export interface ResultsSource {
  name: string;
  url: string;
}

export interface ElectionSummary {
  id: number;
  date: string;
  territory: TerritorySlug;
  title: string;
  source: string;
  wikidata_id: string | null;
  wikipedia_title: string | null;
  results: Record<string, Result>;
  results_source?: ResultsSource;
}

// Detail responses currently carry the same shape as the summary; theses
// are siblings under the top-level response, not nested. Keep a distinct
// alias so future divergence is easy.
export type Election = ElectionSummary;

// ---------------------------------------------------------------------------
// Top-level responses
// ---------------------------------------------------------------------------

export interface BaseResponse {
  data: {
    elections: Record<TerritorySlug, ElectionSummary[]>;
    tags: Tag[];
  };
  meta: ApiMeta;
}

export interface ElectionResponse {
  data: Election;
  meta: ApiMeta;
  theses: Thesis[];
}

export interface ThesisResponse {
  data: Thesis;
  meta: ApiMeta;
  related: Thesis[];
}

// Quiz: server returns `{ "0": [agree, disagree], "1": [...], ... }` indexed
// by thesis position within the election. The pair is `[pro, con]` counts
// of prior quiz answers.
export type QuizVoteCounts = [number, number];

export interface QuizResponse {
  data: Record<string, QuizVoteCounts>;
  error: string | null;
  meta: ApiMeta;
}

// Tag detail responses include the tag itself plus a map of elections and
// the list of theses tagged with that slug.
export interface TagDetailResponse {
  data: Tag;
  elections: Record<string, ElectionSummary>;
  theses: Thesis[];
  meta: ApiMeta;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export type ThesisId = `WOM-${string}-${string}`;

/**
 * Format a thesis id the way the legacy client computes it:
 * `WOM-<electionId padded to 3>-<thesisNum padded to 2>`.
 */
export function formatThesisId(electionId: number, thesisNum: number): ThesisId {
  const e = String(electionId).padStart(3, "0");
  const t = String(thesisNum).padStart(2, "0");
  return `WOM-${e}-${t}`;
}
