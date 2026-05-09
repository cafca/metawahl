import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { TagDetailResponse } from "@/types/api";

export default function useTag(slug: string, page = 0) {
  return useQuery<TagDetailResponse>({
    queryKey: ["tag", slug, page],
    queryFn: () => {
      const query = page > 0 ? `?page=${page}` : "";
      return apiFetch<TagDetailResponse>(`/tags/${slug}${query}`);
    },
    enabled: slug.length > 0,
    placeholderData: keepPreviousData,
  });
}
