import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { formatThesisId } from "@/types/api";
import type { ThesisResponse } from "@/types/api";

export default function useThesis(electionId: number, thesisNum: number) {
  const id = formatThesisId(electionId, thesisNum);
  return useQuery<ThesisResponse>({
    queryKey: ["thesis", electionId, thesisNum],
    queryFn: () => apiFetch<ThesisResponse>(`/thesis/${id}`),
    enabled:
      Number.isFinite(electionId) && electionId >= 0 && Number.isFinite(thesisNum) && thesisNum >= 0,
  });
}
