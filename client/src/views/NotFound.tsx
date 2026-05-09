import { Link } from "react-router-dom";

import SEO from "@/components/SEO";
import Search from "@/components/Search";

export default function NotFound() {
  return (
    <main className="ui container app-main">
      <SEO title="Metawahl: 404 Seite nicht gefunden" />
      <h1 className="ui header">Upsi! 🙄</h1>
      <p>
        Da ist wohl was schiefgegangen. Diese Seite gibt es nämlich gar
        nicht.
      </p>
      <p>
        Was nun? Vielleicht möchtest du auf die <Link to="/">Startseite</Link>,
        oder du suchst einfach nach dem, was du hier erwartet hast:
      </p>
      <div className="ui container center aligned">
        <Search />
      </div>
    </main>
  );
}
