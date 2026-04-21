import { useParams } from "react-router-dom";

export function Placeholder({ name }: { name: string }) {
  const params = useParams();
  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold">{name}</h1>
      <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
        Placeholder view. Port from <code>src.legacy/</code> in Phase 4.
      </p>
      {Object.keys(params).length > 0 && (
        <pre className="mt-4 rounded bg-[color:var(--muted)] p-3 text-xs">
          {JSON.stringify(params, null, 2)}
        </pre>
      )}
    </section>
  );
}

export function makePlaceholder(name: string) {
  const Component = () => <Placeholder name={name} />;
  Component.displayName = `Placeholder(${name})`;
  return Component;
}
