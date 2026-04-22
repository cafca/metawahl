import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search } from "@/components/Search";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-4 pt-16 pb-12">
      <title>Metawahl: 404 Seite nicht gefunden</title>

      <h1 className="mb-6 text-4xl font-bold tracking-tight">Upsi! 🙄</h1>

      <p className="my-4 leading-relaxed">
        Da ist wohl was schiefgegangen. Diese Seite gibt es nämlich gar nicht.
      </p>
      <p className="my-4 leading-relaxed">
        Was nun? Vielleicht möchtest du auf die{" "}
        <Link to="/" className="underline">
          Startseite
        </Link>
        , oder du suchst einfach nach dem, was du hier erwartet hast:
      </p>

      <div className="my-6">
        <Search variant="inline" />
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button variant="outline" asChild>
          <Link to="/wahlen/">Alle Wahlen</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/themen/">Themen durchsuchen</Link>
        </Button>
      </div>
    </section>
  );
}
