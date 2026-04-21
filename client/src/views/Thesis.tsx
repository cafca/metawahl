import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";

import { Legend } from "@/components/Legend";
import { Thesis as ThesisCard } from "@/components/Thesis";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TERRITORY_NAMES, type TerritorySlug } from "@/config";
import useBase from "@/hooks/useBase";
import useElection from "@/hooks/useElection";
import useThesis from "@/hooks/useThesis";
import type { Election } from "@/types/api";

function isKnownTerritory(slug: string | undefined): slug is TerritorySlug {
  return slug != null && slug in TERRITORY_NAMES;
}

export default function ThesisView() {
  const params = useParams<{
    territory: string;
    electionNum: string;
    thesisNum: string;
  }>();

  const electionNum = Number.parseInt(params.electionNum ?? "", 10);
  const thesisNum = Number.parseInt(params.thesisNum ?? "", 10);
  const territory = params.territory;
  const paramsValid =
    Number.isFinite(electionNum) &&
    Number.isFinite(thesisNum) &&
    isKnownTerritory(territory);

  const baseQuery = useBase();
  const base = baseQuery.data?.data;

  const cachedElection = useMemo<Election | undefined>(() => {
    if (!paramsValid || base == null) return undefined;
    const bucket = base.elections[territory];
    if (bucket == null) return undefined;
    return bucket.find((e) => e.id === electionNum);
  }, [base, territory, electionNum, paramsValid]);

  // Only fall back to the dedicated election endpoint when base.json did not
  // carry this election.
  const needsElectionFetch =
    paramsValid && baseQuery.isSuccess && cachedElection == null;
  const electionQuery = useElection(
    needsElectionFetch ? electionNum : Number.NaN,
  );
  const election: Election | undefined =
    cachedElection ?? electionQuery.data?.data;

  const thesisQuery = useThesis(
    paramsValid ? electionNum : Number.NaN,
    paramsValid ? thesisNum : Number.NaN,
  );
  const thesis = thesisQuery.data?.data;
  const related = useMemo(
    () => thesisQuery.data?.related ?? [],
    [thesisQuery.data],
  );

  const relatedWithElection = useMemo(() => {
    type RelatedThesis = (typeof related)[number];
    if (base == null) return [] as Array<{ thesis: RelatedThesis; election: Election }>;
    const out: Array<{ thesis: RelatedThesis; election: Election }> = [];
    for (const t of related) {
      let match: Election | undefined;
      for (const bucket of Object.values(base.elections)) {
        match = bucket?.find((e) => e.id === t.election_id);
        if (match != null) break;
      }
      if (match != null) out.push({ thesis: t, election: match });
    }
    return out;
  }, [related, base]);

  if (!paramsValid) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <title>Metawahl</title>
        <Alert variant="destructive">
          <AlertTitle>Ungültige Adresse</AlertTitle>
          <AlertDescription>
            Diese These konnte nicht geladen werden.{" "}
            <Link to="/wahlen/" className="underline">
              Zur Wahlenübersicht
            </Link>
            .
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isLoading =
    thesisQuery.isLoading ||
    baseQuery.isLoading ||
    (needsElectionFetch && electionQuery.isLoading);
  const error =
    thesisQuery.error ?? electionQuery.error ?? baseQuery.error ?? null;

  const year =
    election != null ? new Date(election.date).getFullYear() : null;
  const legendShowMissing = year != null && year < 2008;

  const pageTitle =
    election != null
      ? `Metawahl: ${election.title} Quiz`
      : "Metawahl: Quiz";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <title>{pageTitle}</title>

      <nav
        aria-label="Brotkrumen"
        className="mb-6 flex flex-wrap items-center gap-1 text-sm text-muted-foreground"
      >
        <Link to="/wahlen/" className="hover:underline">
          Wahlen
        </Link>
        <ChevronRight className="size-4" aria-hidden="true" />
        <Link to={`/wahlen/${territory}/`} className="hover:underline">
          {TERRITORY_NAMES[territory]}
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
              These #{thesisNum + 1}
            </span>
          </>
        )}
      </nav>

      {error != null && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Die These konnte nicht geladen werden."}
          </AlertDescription>
        </Alert>
      )}

      {thesis != null && election != null && (
        <h1 className="mb-6 text-2xl font-bold md:text-3xl">
          These #{thesisNum + 1} aus dem Wahl-o-Mat zur {election.title}
        </h1>
      )}

      {isLoading && (
        <p className="py-12 text-center text-muted-foreground">Lädt…</p>
      )}

      {!isLoading && error == null && thesis != null && election != null && (
        <div className="space-y-8">
          <Legend
            text="Legende:"
            genericVariation
            showMissing={legendShowMissing}
          />

          <ThesisCard thesis={thesis} election={election} linkElection />

          <section>
            <h2 className="mb-4 text-xl font-semibold">
              Ähnliche Thesen aus dem Archiv
            </h2>
            {relatedWithElection.length === 0 ? (
              <p className="text-muted-foreground">
                Leider hat Metawahl in keinem anderen Wahl-o-Mat ähnliche
                Themen gefunden.
              </p>
            ) : (
              <div className="space-y-4">
                {relatedWithElection.map(({ thesis: t, election: e }) => (
                  <ThesisCard
                    key={`related-${t.id}`}
                    thesis={t}
                    election={e}
                    linkElection
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
