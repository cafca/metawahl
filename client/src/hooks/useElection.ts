import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { ElectionResponse } from "@/types/api";

export default function useElection(id: number) {
  return useQuery<ElectionResponse>({
    queryKey: ["election", id],
    queryFn: () => apiFetch<ElectionResponse>(`/elections/${id}`),
    enabled: Number.isFinite(id) && id >= 0,
  });
}
