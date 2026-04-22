import { NavLink, Link } from "react-router-dom";
import { Search } from "@/components/Search";

const linkBase =
  "flex items-center px-4 py-[13px] font-bold text-ink border-l border-[rgba(34,36,38,0.1)] hover:bg-black/[0.03]";
const linkActive = "bg-black/[0.05] text-ink-strong";

export function Header() {
  return (
    <header className="bg-white shadow-[rgba(34,36,38,0.15)_0_1px_2px_0] border-b border-[rgba(34,36,38,0.15)]">
      <nav className="mx-auto flex max-w-[var(--container-semantic-lg)] items-stretch">
        <Link
          to="/"
          className="flex items-center border-r border-[rgba(34,36,38,0.1)] px-4 py-[13px] font-bold text-ink"
        >
          Metawahl
        </Link>
        <NavLink
          to="/wahlen/"
          className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ""}`}
        >
          Wahlen
        </NavLink>
        <NavLink
          to="/themen/"
          className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ""}`}
        >
          Themen
        </NavLink>
        <NavLink
          to="/daten/"
          className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ""}`}
        >
          Daten
        </NavLink>
        <div className="ml-auto flex items-center border-l border-[rgba(34,36,38,0.1)] px-3 py-2">
          <Search />
        </div>
      </nav>
    </header>
  );
}
