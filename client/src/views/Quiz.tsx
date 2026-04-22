import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

import Legend from "@/components/Legend";
import SEO from "@/components/SEO";
import SourcesFooter from "@/components/SourcesFooter";
import Thesis from "@/components/Thesis";
import {
  SITE_ROOT,
  TERRITORY_NAMES,
  type TerritorySlug,
} from "@/config";
import useElection from "@/hooks/useElection";
import useQuiz from "@/hooks/useQuiz";
import useSubmitQuizAnswer from "@/hooks/useSubmitQuizAnswer";
import { copyToClipboard } from "@/lib/clipboard";
import { extractThesisId } from "@/lib/thesis";
import { getOrCreateUuid } from "@/lib/uuid";
import { yearOf } from "@/lib/dates";
import type {
  ElectionSummary,
  QuizAnswer,
  Thesis as ThesisData,
  ThesisPosition,
} from "@/types/api";

import "./Quiz.css";

function ratioOf(
  election: ElectionSummary,
  positions: ThesisPosition[],
  reverse = false,
): number {
  const res = election.results;
  return positions
    .filter((p) => (reverse ? p.value === -1 : p.value === 1))
    .reduce((acc, cur) => {
      if (res[cur.party] == null) {
        const multi = Object.keys(res).filter(
          (k) => res[k]!.linked_position === cur.party,
        );
        return acc + multi.reduce((a, k) => a + res[k]!.pct, 0);
      }
      return acc + res[cur.party]!.pct;
    }, 0);
}

const voterOpinionName: Record<string, string> = {
  "-1": "dagegen",
  "0": "neutral",
  "1": "dafür",
};

export default function Quiz() {
  const params = useParams();
  const location = useLocation();
  const territory = (params.territory ?? "deutschland") as TerritorySlug;
  const electionNum = Number.parseInt(params.electionNum ?? "0", 10);

  const elQuery = useElection(electionNum);
  const tallyQuery = useQuiz(electionNum);
  const submit = useSubmitQuizAnswer();

  const election = elQuery.data?.data;
  const theses: ThesisData[] = elQuery.data?.theses ?? [];
  const tally = tallyQuery.data?.data;
  const isLoading = elQuery.isLoading;

  const quizSelection = useMemo(() => {
    if (election == null) return [];
    return theses
      .slice()
      .sort((a, b) => (a.id > b.id ? 1 : -1))
      .filter((t) => {
        const pro = ratioOf(election, t.positions);
        const con = ratioOf(election, t.positions, true);
        return pro > 15 && con > 15 && (pro > 50 || con >= 50);
      })
      .slice(0, 20);
  }, [election, theses]);

  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<boolean[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<QuizAnswer | null>(null);
  const [correctRatio, setCorrectRatio] = useState<number | undefined>();
  const [linkCopied, setLinkCopied] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);

  useEffect(() => {
    window.onbeforeunload = () => true;
    return () => {
      window.onbeforeunload = null;
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [quizIndex, quizAnswers.length]);

  function tallyCorrectRatio(correct: QuizAnswer): number | undefined {
    if (tally == null || correct === 0) return undefined;
    const current = quizSelection[quizIndex];
    if (!current) return undefined;
    const ids = extractThesisId(current.id);
    if (!ids) return undefined;
    const counts = tally[String(ids.thesisNum)];
    if (!counts) return undefined;
    const total = counts[0] + counts[1];
    if (total <= 5) return undefined;
    const i = correct === 1 ? 0 : 1;
    return counts[i] / total;
  }

  function handleQuizAnswer(answer: QuizAnswer, correct: QuizAnswer) {
    const ratio = tallyCorrectRatio(correct);
    setCorrectAnswer(correct);
    setCorrectRatio(ratio);
    setQuizAnswers((prev) => [...prev, answer === correct]);

    const current = quizSelection[quizIndex];
    if (election && current) {
      const ids = extractThesisId(current.id);
      if (ids) {
        submit.mutate({
          electionId: election.id,
          thesisNum: ids.thesisNum,
          answer,
          uuid: getOrCreateUuid(),
        });
      }
    }
  }

  function handleNextQuestion() {
    setQuizIndex((i) => i + 1);
    setCorrectAnswer(null);
  }

  const quizResult =
    quizAnswers.length > 0
      ? quizAnswers.filter(Boolean).length / quizAnswers.length
      : 0;

  const currentThesis = quizSelection[quizIndex];
  const voterTerritoryName =
    election?.territory === "europa"
      ? "Deutschland"
      : TERRITORY_NAMES[territory] ?? territory;

  const legendShowMissing = election ? yearOf(election.date) < 2008 : false;
  const answeredCurrent = quizAnswers.length > quizIndex;
  const resultStage =
    !isLoading &&
    quizSelection.length > 0 &&
    quizIndex === quizSelection.length;

  const onCopyLink = async () => {
    const ok = await copyToClipboard(SITE_ROOT + location.pathname);
    if (ok) setLinkCopied(true);
  };
  const onCopyEmbed = async () => {
    if (!election) return;
    const html = `<iframe src="${SITE_ROOT}/iframe/quiz/${election.territory}/${election.id}" frameborder="0" width="100%" height="600px" scrolling="no" style="overflow: hidden; height: 936.5px;"></iframe>`;
    const ok = await copyToClipboard(html);
    if (ok) setEmbedCopied(true);
  };

  return (
    <div className="ui container electionContainer quiz">
      <SEO
        title={
          "Metawahl: " + (election ? `${election.title} Quiz` : "Quiz")
        }
      />

      <div className="ui breadcrumb">
        <a className="section" href="/wahlen/">Wahlen</a>
        <i className="right angle icon divider" />
        <a className="section" href={`/wahlen/${territory}/`}>
          {TERRITORY_NAMES[territory] ?? territory}
        </a>
        <i className="right angle icon divider" />
        {election == null ? (
          <span className="section">Loading...</span>
        ) : (
          <a
            className="section"
            href={`/wahlen/${territory}/${electionNum}/`}
          >
            {yearOf(election.date)}
          </a>
        )}
        <i className="right angle icon divider" />
        <a
          className="active section"
          href={`/quiz/${territory}/${electionNum}/`}
        >
          Quiz
        </a>
      </div>

      {quizAnswers.length === 0 && (
        <h1 className="ui header">
          {election == null
            ? " "
            : `Teste dein Wissen: ${election.title}`}
        </h1>
      )}

      {quizAnswers.length === 0 && (
        <h3>
          {election?.preliminary
            ? `Was wird die Mehrheit in ${TERRITORY_NAMES[territory]} voraussichtlich wählen?`
            : `Was hat die Mehrheit in ${TERRITORY_NAMES[territory]} gewählt?`}
        </h3>
      )}

      {isLoading && <div className="ui active centered inline loader" />}

      {!isLoading && election && (
        <div className="theses">
          {answeredCurrent && (
            <div className="ui two column stackable grid topGrid">
              <div className="column">
                <h2 className="ui header">
                  {quizAnswers[quizIndex]
                    ? `👍 Richtig! ${voterTerritoryName} stimmt ${correctAnswer != null ? voterOpinionName[String(correctAnswer)] : ""}.`
                    : `👎 Leider falsch. ${voterTerritoryName} stimmt ${correctAnswer != null ? voterOpinionName[String(correctAnswer)] : ""}.`}
                </h2>
                {correctRatio != null && (
                  <p>
                    Diese Frage wurde von{" "}
                    {Math.trunc(correctRatio * 100)}% der Besucher richtig
                    beantwortet.
                  </p>
                )}
              </div>
              <div className="column legendCol">
                <Legend
                  showMissing={legendShowMissing}
                  preliminary={election.preliminary ?? false}
                />
              </div>
            </div>
          )}

          {currentThesis && quizIndex < quizSelection.length && (
            <Thesis
              key={`quiz-thesis-${quizIndex}`}
              election={election}
              showHints={true}
              quizMode={true}
              hideTags={true}
              answer={(answer, correct) => handleQuizAnswer(answer, correct)}
              {...currentThesis}
            />
          )}
        </div>
      )}

      {resultStage && election && (
        <div className="ui large raised segment quizResult">
          <h1 className="ui header">
            {quizResult >= 0.5 ? (
              <span>
                Du bist ein Gewinner! {Math.trunc(quizResult * 100)}% der Fragen
                richtig.
              </span>
            ) : (
              <span>
                Leider verloren. {Math.trunc(quizResult * 100)}% der Fragen
                richtig.
              </span>
            )}
          </h1>

          <p>
            <Link to={`/wahlen/${territory}/${electionNum}/`}>
              <i className="caret right icon" /> Öffne die Übersichtsgrafik zur{" "}
              {election.title}
            </Link>
            <br />
            <Link to="/wahlen/">
              <i className="caret right icon" /> Siehe alle Wahlen, zu denen es
              Quizzes gibt
            </Link>
            <br />
            <Link to="/">
              <i className="caret right icon" /> Finde heraus, worum es bei
              Metawahl geht
            </Link>
          </p>

          <div className="ui stackable buttons">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${SITE_ROOT}${location.pathname}`}
              className="ui facebook button"
              rel="nofollow noopener noreferrer"
              target="_blank"
            >
              Quiz auf Facebook teilen
            </a>
            <a
              href={`https://twitter.com/home?status=${SITE_ROOT}${location.pathname}`}
              className="ui twitter button"
              rel="nofollow noopener noreferrer"
              target="_blank"
            >
              Quiz auf Twitter teilen
            </a>
            <button type="button" className="ui button" onClick={onCopyEmbed}>
              <i className={`${embedCopied ? "check" : "file code"} icon`} />{" "}
              {embedCopied ? "iFrame-HTML kopiert" : "Einbetten"}
            </button>
            <button type="button" className="ui button" onClick={onCopyLink}>
              <i className={`${linkCopied ? "check" : "linkify"} icon`} /> Link
              kopieren
            </button>
          </div>
        </div>
      )}

      <div className="ui stackable grid" style={{ marginTop: "1em" }}>
        <div className={`${quizAnswers.length > 0 ? "twelve" : "sixteen"} wide column`}>
          {quizAnswers.length !== quizSelection.length && (
            <span>
              Noch {quizSelection.length - quizAnswers.length} Thesen bis zum
              Ergebnis
            </span>
          )}
          <div className="ui progress">
            <div
              className={`bar${resultStage && quizResult >= 0.5 ? " success" : ""}`}
              style={{
                width: `${quizSelection.length > 0 ? (quizAnswers.length / quizSelection.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
        {quizAnswers.length > 0 && (
          <div className="four wide right aligned column">
            <button
              type="button"
              className="ui large grey right labeled icon button"
              disabled={quizAnswers.length === quizIndex}
              onClick={handleNextQuestion}
            >
              <i className="right arrow icon" />
              {quizIndex + 1 === quizSelection.length
                ? "Ergebnis zeigen"
                : "Nächste Frage"}
            </button>
          </div>
        )}
      </div>

      <SourcesFooter
        election={election}
        iframe={true}
        context="Dieses Quiz"
      />
    </div>
  );
}
