import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="border-b border-[color:var(--border)] px-4 py-3">
      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <Link to="/" className="text-lg font-semibold">
          Metawahl
        </Link>
        <ul className="flex gap-4 text-sm">
          <li>
            <Link to="/wahlen/">Wahlen</Link>
          </li>
          <li>
            <Link to="/themen/">Themen</Link>
          </li>
          <li>
            <Link to="/daten/">Daten</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
