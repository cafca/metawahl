import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[color:var(--border)] px-4 py-6 text-sm text-[color:var(--muted-foreground)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <span>© Metawahl</span>
        <Link to="/legal/">Impressum</Link>
      </div>
    </footer>
  );
}
