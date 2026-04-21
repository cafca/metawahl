import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { BaseResponse } from "@/types/api";

// `/base` is large (all elections + all tags) and rarely changes — keep it
// fresh for an hour by default.
const BASE_STALE_TIME_MS = 60 * 60 * 1000;

export default function useBase() {
  return useQuery<BaseResponse>({
    queryKey: ["base"],
    queryFn: () => apiFetch<BaseResponse>("/base"),
    staleTime: BASE_STALE_TIME_MS,
  });
}
