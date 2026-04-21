import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight, ArrowRight } from "lucide-react";

import { Legend } from "@/components/Legend";
import { Thesis as ThesisCard } from "@/components/Thesis";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TERRITORY_NAMES, type TerritorySlug } from "@/config";
import useElection from "@/hooks/useElection";
import useQuiz from "@/hooks/useQuiz";
import useSubmitQuizAnswer from "@/hooks/useSubmitQuizAnswer";
import { extractThesisId } from "@/lib/thesis";
import type {
  Election,
  Position,
  QuizAnswer,
  Thesis,
} from "@/types/api";

function isKnownTerritory(slug: string | undefined): slug is TerritorySlug {
  return slug != null && slug in TERRITORY_NAMES;
}

/** Persisted progress for one election's quiz. */
type StoredState = {
  answers: Array<boolean>;
  answeredAt: number;
};

function storageKey(electionId: number): string {
  return `quiz-${electionId}`;
}

function loadStored(electionId: number): StoredState | null {
  try {
    const raw = localStorage.getItem(storageKey(electionId));
    if (raw == null) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed === "object" &&
      parsed != null &&
      Array.isArray((parsed as StoredState).answers)
    ) {
      return parsed as StoredState;
    }
  } catch {
    /* ignore malformed cache */
  }
  return null;
}

function saveStored(electionId: number, state: StoredState): void {
  try {
    localStorage.setItem(storageKey(electionId), JSON.stringify(state));
  } catch {
    /* ignore quota errors */
  }
}

function ensureUuid(): string {
  const key = "metawahl-uuid";
  const existing = localStorage.getItem(key);
  if (existing != null && existing.length > 0) return existing;
  const fresh = crypto.randomUUID();
  try {
    localStorage.setItem(key, fresh);
  } catch {
    /* ignore */
  }
  return fresh;
}

/**
 * Select a subset of theses suitable for a quiz: clear majority opinions,
 * sorted by thesis id. Mirrors the legacy filter (proRatio > 15,
 * conRatio > 15, one side >= 50%).
 */
function selectQuizTheses(theses: Thesis[], election: Election): Thesis[] {
  const results = election.results;
  const ratio = (thesis: Thesis, reverse: boolean): number =>
    thesis.positions
      .filter((p) => (reverse ? p.value === -1 : p.value === 1))
      .reduce((acc, pos) => {
        const row = results[pos.party];
        if (row == null) {
          let sum = 0;
          for (const key of Object.keys(results)) {
            if (results[key]?.linked_position === pos.party) {
              sum += results[key]?.pct ?? 0;
            }
          }
          return acc + sum;
        }
        return acc + (row.pct ?? 0);
      }, 0);

  return [...theses]
    .sort((a, b) => (a.id > b.id ? 1 : -1))
    .filter((thesis) => {
      const ratioPro = ratio(thesis, false);
      const ratioCon = ratio(thesis, true);
      return ratioPro > 15 && ratioCon > 15 && (ratioPro > 50 || ratioCon >= 50);
    })
    .slice(0, 20);
}

const OPINION_LABEL: Record<string, string> = {
  "-1": "dagegen",
  "0": "neutral",
  "1": "dafür",
};

export default function QuizView() {
  const params = useParams<{ territory: string; electionNum: string }>();
  const electionNum = Number.parseInt(params.electionNum ?? "", 10);
  const territory = params.territory;
  const paramsValid =
    Number.isFinite(electionNum) && isKnownTerritory(territory);

  const electionQuery = useElection(paramsValid ? electionNum : Number.NaN);
  const quizTallyQuery = useQuiz(paramsValid ? electionNum : Number.NaN);
  const submitMutation = useSubmitQuizAnswer();

  const election: Election | undefined = electionQuery.data?.data;

  const quizSelection = useMemo<Thesis[]>(() => {
    if (election == null) return [];
    return selectQuizTheses(electionQuery.data?.theses ?? [], election);
  }, [election, electionQuery.data]);

  // Lazy init from localStorage so we never write state back inside an
  // effect (which would trigger cascading renders / React 19 lint).
  const [answers, setAnswers] = useState<boolean[]>(() => {
    if (!paramsValid) return [];
    return loadStored(electionNum)?.answers ?? [];
  });
  const [quizIndex, setQuizIndex] = useState<number>(() => {
    if (!paramsValid) return 0;
    return loadStored(electionNum)?.answers.length ?? 0;
  });
  const [reveal, setReveal] = useState<{
    correct: Position;
    correctRatio: number | null;
  } | null>(null);

  // Generate uuid lazily.
  useEffect(() => {
    ensureUuid();
  }, []);

  // Scroll to top on question change for a clean reveal layout.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [quizIndex, answers.length]);

  const handleAnswer = useCallback(
    (answer: QuizAnswer, correctAnswer: Position) => {
      if (!paramsValid || election == null) return;
      const currentThesis = quizSelection[quizIndex];
      if (currentThesis == null) return;

      const wasCorrect = answer === correctAnswer;
      const nextAnswers = [...answers, wasCorrect];
      setAnswers(nextAnswers);
      saveStored(electionNum, {
        answers: nextAnswers,
        answeredAt: Date.now(),
      });

      // Compute the correct-rate from tally data.
      let correctRatio: number | null = null;
      const tally = quizTallyQuery.data?.data;
      const ids = extractThesisId(currentThesis.id);
      if (
        tally != null &&
        ids != null &&
        correctAnswer !== 0 &&
        tally[String(ids.thesisNum)] != null
      ) {
        const pair = tally[String(ids.thesisNum)]!;
        const total = pair[0] + pair[1];
        if (total > 5) {
          const i = correctAnswer === 1 ? 0 : 1;
          correctRatio = pair[i] / total;
        }
      }
      setReveal({ correct: correctAnswer, correctRatio });

      // Fire-and-forget submission (legacy behavior).
      if (ids != null) {
        submitMutation.mutate({
          electionId: electionNum,
          thesisNum: ids.thesisNum,
          answer,
          uuid: ensureUuid(),
        });
      }
    },
    [
      paramsValid,
      election,
      quizSelection,
      quizIndex,
      answers,
      electionNum,
      quizTallyQuery.data,
      submitMutation,
    ],
  );

  const handleNext = useCallback(() => {
    setQuizIndex((i) => i + 1);
    setReveal(null);
  }, []);

  if (!paramsValid) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <title>Metawahl: Quiz</title>
        <Alert variant="destructive">
          <AlertTitle>Ungültige Adresse</AlertTitle>
          <AlertDescription>
            Dieses Quiz konnte nicht geladen werden.{" "}
            <Link to="/wahlen/" className="underline">
              Zur Wahlenübersicht
            </Link>
            .
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const territoryName = TERRITORY_NAMES[territory];
  const isLoading = electionQuery.isLoading;
  const error = electionQuery.error ?? null;

  const year = election != null ? new Date(election.date).getFullYear() : null;
  const legendShowMissing = year != null && year < 2008;

  const pageTitle =
    election != null ? `Metawahl: ${election.title} Quiz` : "Metawahl: Quiz";

  const voterTerritoryName =
    election?.territory === "europa"
      ? "Deutschland"
      : isKnownTerritory(election?.territory)
        ? TERRITORY_NAMES[election.territory]
        : territoryName;

  const currentThesis = quizSelection[quizIndex];
  const isFinished =
    quizSelection.length > 0 && quizIndex >= quizSelection.length;
  const quizResult =
    answers.length > 0
      ? answers.filter((a) => a).length / answers.length
      : 0;
  const answeredCurrent = answers.length > quizIndex;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <title>{pageTitle}</title>

      <nav
        aria-label="Brotkrumen"
        className="mb-4 flex flex-wrap items-center gap-1 text-sm text-muted-foreground"
      >
        <Link to="/wahlen/" className="hover:underline">
          Wahlen
        </Link>
        <ChevronRight className="size-4" aria-hidden="true" />
        <Link to={`/wahlen/${territory}/`} className="hover:underline">
          {territoryName}
        </Link>
        <ChevronRight className="size-4" aria-hidden="true" />
        {election == null ? (
          <span>Lädt…</span>
        ) : (
          <>
            <Link
              to={`/wahlen/${territory}/${electionNum}/`}
              className="hover:underline"
            >
              {year}
            </Link>
            <ChevronRight className="size-4" aria-hidden="true" />
            <span aria-current="page" className="font-medium text-foreground">
              Quiz
            </span>
          </>
        )}
      </nav>

      {answers.length === 0 && (
        <>
          <h1 className="mb-3 text-2xl font-bold md:text-3xl">
            {election == null
              ? " "
              : "Teste dein Wissen: " + election.title}
          </h1>
          {election != null && (
            <h2 className="mb-6 text-lg text-muted-foreground">
              Was hat die Mehrheit in {territoryName} gewählt?
            </h2>
          )}
        </>
      )}

      {error != null && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Das Quiz konnte nicht geladen werden."}
          </AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <p className="py-12 text-center text-muted-foreground">Lädt…</p>
      )}

      {!isLoading && election != null && !isFinished && currentThesis != null && (
        <div className="space-y-6">
          {/* Progress header */}
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>
                Frage {quizIndex + 1} / {quizSelection.length}
              </span>
              {answers.length < quizSelection.length && (
                <span>
                  Noch {quizSelection.length - answers.length} Thesen bis zum
                  Ergebnis
                </span>
              )}
            </div>
            <div
              className="h-2 w-full rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={answers.length}
              aria-valuemin={0}
              aria-valuemax={quizSelection.length}
            >
              <div
                className="h-full rounded-full bg-primary"
                style={{
                  width: `${(answers.length / quizSelection.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Reveal banner — fix for the 768 overlap bug: stacked below
              768px (md breakpoint), inline side-by-side above. */}
          {answeredCurrent && reveal != null && (
            <section
              className={
                answers[quizIndex] === true
                  ? "rounded-lg border border-green-500 bg-green-50 p-4 md:flex md:items-start md:justify-between md:gap-6"
                  : "rounded-lg border border-red-500 bg-red-50 p-4 md:flex md:items-start md:justify-between md:gap-6"
              }
            >
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold">
                  {answers[quizIndex] === true
                    ? "👍 Richtig! "
                    : "👎 Leider falsch. "}
                  {voterTerritoryName} stimmt{" "}
                  {OPINION_LABEL[String(reveal.correct)]}.
                </h2>
                {reveal.correctRatio != null && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Diese Frage wurde von{" "}
                    {Math.round(reveal.correctRatio * 100)}% der Besucher
                    richtig beantwortet.
                  </p>
                )}
              </div>
              <div className="mt-3 md:mt-0 md:flex-shrink-0">
                <Legend
                  showMissing={legendShowMissing}
                  genericVariation
                  className="justify-start md:justify-end"
                />
              </div>
            </section>
          )}

          <ThesisCard
            key={`quiz-thesis-${quizIndex}`}
            thesis={currentThesis}
            election={election}
            quizMode
            answered={answeredCurrent}
            hideTags
            showHints
            onAnswer={handleAnswer}
          />

          {answeredCurrent && (
            <div className="flex justify-end">
              <Button onClick={handleNext} size="lg" className="gap-1">
                {quizIndex + 1 === quizSelection.length
                  ? "Ergebnis zeigen"
                  : "Nächste Frage"}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
          )}
        </div>
      )}

      {!isLoading && election != null && isFinished && (
        <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h1 className="mb-4 text-2xl font-bold md:text-3xl">
            {quizResult >= 0.5
              ? `Du bist ein Gewinner! ${Math.round(quizResult * 100)}% der Fragen richtig.`
              : `Leider verloren. ${Math.round(quizResult * 100)}% der Fragen richtig.`}
          </h1>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                to={`/wahlen/${territory}/${electionNum}/`}
                className="inline-flex items-center gap-1 hover:underline"
              >
                <ArrowRight className="size-4" aria-hidden="true" /> Öffne die
                Übersichtsgrafik zur {election.title}
              </Link>
            </li>
            <li>
              <Link
                to="/wahlen/"
                className="inline-flex items-center gap-1 hover:underline"
              >
                <ArrowRight className="size-4" aria-hidden="true" /> Siehe alle
                Wahlen, zu denen es Quizzes gibt
              </Link>
            </li>
            <li>
              <Link
                to="/"
                className="inline-flex items-center gap-1 hover:underline"
              >
                <ArrowRight className="size-4" aria-hidden="true" /> Finde
                heraus, worum es bei Metawahl geht
              </Link>
            </li>
          </ul>
        </section>
      )}

      {!isLoading && election != null && quizSelection.length === 0 && (
        <Alert>
          <AlertTitle>Quiz nicht verfügbar</AlertTitle>
          <AlertDescription>
            Für diese Wahl steht noch kein Quiz bereit.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

