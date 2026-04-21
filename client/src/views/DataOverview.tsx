export default function DataOverview() {
  return (
    <section className="mx-auto max-w-3xl px-4 pt-16 pb-12">
      <title>Metawahl: Datenportal</title>

      <h1 className="mb-6 text-4xl font-bold tracking-tight">API</h1>

      <p className="my-4 leading-relaxed">
        Metawahl bietet eine öffentliche HTTP-API an, über die alle Wahlen,
        Thesen und Themen der Plattform maschinenlesbar abgerufen werden können.
        Die vollständige Schnittstellenbeschreibung ist als OpenAPI-/Swagger-
        Dokument verfügbar:{" "}
        <a
          className="underline"
          href="/swagger.yaml"
          target="_blank"
          rel="noopener noreferrer"
        >
          swagger.yaml
        </a>
        .
      </p>
      <p className="my-4 leading-relaxed">
        Die API ist unter{" "}
        <a
          className="underline"
          href="https://api.metawahl.de/v3/"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://api.metawahl.de/v3/
        </a>{" "}
        erreichbar. Eine interaktive Swagger-UI-Ansicht wird in einer späteren
        Version wieder eingebunden.
      </p>
    </section>
  );
}
