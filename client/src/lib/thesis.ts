export type ThesisIdComponents = {
  type: string;
  womId: number;
  thesisNum: number;
};

/**
 * Parse an id of the form `WOM-<electionId>-<thesisNum>` into its parts.
 * Returns `null` when the id has fewer than three segments or the numeric
 * pieces are not valid integers — callers can then fall back gracefully
 * rather than blowing up.
 */
export function extractThesisId(thesisId: string): ThesisIdComponents | null {
  const elems = thesisId.split("-");
  if (elems.length < 3) return null;

  const womId = Number.parseInt(elems[1]!, 10);
  const thesisNum = Number.parseInt(elems[2]!, 10);
  if (Number.isNaN(womId) || Number.isNaN(thesisNum)) return null;

  return {
    type: elems[0]!,
    womId,
    thesisNum,
  };
}
