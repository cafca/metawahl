import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { QuizResponse } from "@/types/api";

export default function useQuiz(electionId: number) {
  return useQuery<QuizResponse>({
    queryKey: ["quiz", electionId],
    queryFn: () => apiFetch<QuizResponse>(`/quiz/${electionId}`),
    enabled: Number.isFinite(electionId) && electionId >= 0,
  });
}
