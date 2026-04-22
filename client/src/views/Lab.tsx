import { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";

type Route = { label: string; path: string; note?: string };

const ROUTES: Route[] = [
  { label: "Landing", path: "/" },
  { label: "Legal", path: "/legal/" },
  { label: "404", path: "/404", note: "NotFound view" },
  { label: "Data overview", path: "/daten/" },
  { label: "Election list", path: "/wahlen/" },
  { label: "Territory (DE)", path: "/wahlen/deutschland/" },
  { label: "Territory (EU)", path: "/wahlen/europa/" },
  { label: "Election (DE/1)", path: "/wahlen/deutschland/1/" },
  { label: "Thesis (DE/1/1)", path: "/wahlen/deutschland/1/1/" },
  { label: "Quiz (DE/1)", path: "/quiz/deutschland/1/" },
  { label: "Tag overview", path: "/themen/" },
  { label: "Tag list", path: "/themenliste/" },
  { label: "Tag (schule)", path: "/themen/schule/" },
];

const VIEWPORTS = [
  { name: "360", w: 360 },
  { name: "600", w: 600 },
  { name: "768", w: 768 },
  { name: "1024", w: 1024 },
  { name: "1440", w: 1440 },
  { name: "1920", w: 1920 },
];

const LEGACY_URL =
  (import.meta.env.VITE_LEGACY_URL as string | undefined) ?? "http://127.0.0.1:5000";

export default function Lab() {
  const [params, setParams] = useSearchParams();
  const path = params.get("path") ?? "/";
  const viewport = Number(params.get("v") ?? "1440");
  const modernOrigin = window.location.origin;

  const current = useMemo(
    () => ROUTES.find((r) => r.path === path) ?? ROUTES[0]!,
    [path],
  );

  const setPath = (p: string) => {
    const next = new URLSearchParams(params);
    next.set("path", p);
    setParams(next, { replace: true });
  };
  const setViewport = (v: number) => {
    const next = new URLSearchParams(params);
    next.set("v", String(v));
    setParams(next, { replace: true });
  };

  // Swallow the usual "I'm in dev" warning if route is accessed in a prod bundle.
  useEffect(() => {
    document.title = `Lab — ${current.label}`;
  }, [current]);

  const modernSrc = `${modernOrigin}${path}?__lab=1`;
  const legacySrc = `${LEGACY_URL}${path}`;

  return (
    <div className="min-h-screen bg-neutral-100 text-[13px]">
      <header className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b bg-white px-4 py-2 shadow-sm">
        <strong className="mr-2 text-sm">
          <Link to="/__lab" className="text-semantic-blue">
            /__lab
          </Link>
        </strong>
        <span className="text-ink-muted">side-by-side visual diff</span>
        <span className="ml-auto flex gap-1">
          {VIEWPORTS.map((v) => (
            <button
              key={v.name}
              type="button"
              onClick={() => setViewport(v.w)}
              className={`rounded px-2 py-1 ${
                viewport === v.w
                  ? "bg-semantic-blue text-white"
                  : "bg-neutral-200 text-ink hover:bg-neutral-300"
              }`}
            >
              {v.name}
            </button>
          ))}
        </span>
      </header>

      <nav className="flex flex-wrap gap-1 border-b bg-white px-4 py-2">
        {ROUTES.map((r) => (
          <button
            key={r.path}
            type="button"
            onClick={() => setPath(r.path)}
            className={`rounded px-2 py-1 ${
              r.path === path
                ? "bg-ink text-white"
                : "bg-neutral-200 text-ink hover:bg-neutral-300"
            }`}
          >
            {r.label}
          </button>
        ))}
      </nav>

      <div className="px-4 py-2 text-xs text-ink-muted">
        Path: <code className="bg-white px-1">{path}</code>
        {" · "}Modern: <code className="bg-white px-1">{modernSrc}</code>
        {" · "}Legacy: <code className="bg-white px-1">{legacySrc}</code>
      </div>

      <div className="grid grid-cols-2 gap-4 px-4 pb-10">
        <Pane title="Modern (this build)" src={modernSrc} width={viewport} />
        <Pane title={`Legacy (${LEGACY_URL})`} src={legacySrc} width={viewport} />
      </div>
    </div>
  );
}

function Pane({
  title,
  src,
  width,
}: {
  title: string;
  src: string;
  width: number;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between rounded-t bg-white px-3 py-1 text-xs font-semibold">
        <span>{title}</span>
        <span className="text-ink-muted">{width}px</span>
      </div>
      <div className="overflow-auto rounded-b border bg-white">
        <iframe
          key={`${src}-${width}`}
          src={src}
          title={title}
          style={{
            width,
            height: "80vh",
            border: "0",
            display: "block",
          }}
        />
      </div>
    </div>
  );
}
