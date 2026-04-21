// @flow

export function extractThesisID(thesisID: string) {
  const elems = thesisID.split("-");
  return {
    type: elems[0],
    womID: parseInt(elems[1], 10),
    thesisNUM: parseInt(elems[2], 10)
  }
}
