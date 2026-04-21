import { useMutation } from "@tanstack/react-query";
import { apiPost } from "@/lib/api";
import type { QuizAnswer } from "@/types/api";

export interface SubmitQuizAnswerVariables {
  electionId: number;
  thesisNum: number;
  answer: QuizAnswer;
  /** Anonymous client id persisted in localStorage (legacy "uuid" cache key). */
  uuid: string | null;
}

interface SubmitQuizAnswerBody {
  answer: QuizAnswer;
  uuid: string | null;
}

// Server response shape isn't consumed by the legacy client — the legacy
// submit is fire-and-forget with error logging. We mirror that: decode
// whatever JSON comes back (if any) and hand it to the caller untouched.
export interface SubmitQuizAnswerResponse {
  error?: string | null;
  [k: string]: unknown;
}

export default function useSubmitQuizAnswer() {
  return useMutation<SubmitQuizAnswerResponse, Error, SubmitQuizAnswerVariables>({
    mutationFn: ({ electionId, thesisNum, answer, uuid }) =>
      apiPost<SubmitQuizAnswerBody, SubmitQuizAnswerResponse>(
        `/quiz/${electionId}/${thesisNum}`,
        { answer, uuid },
      ),
  });
}
