import { useParams } from "react-router-dom";

export function Placeholder({ name }: { name: string }) {
  const params = useParams();
  return (
    <div className="ui container" style={{ margin: "4em auto", minHeight: "50vh" }}>
      <h1 className="ui header">{name}</h1>
      <p>Diese Seite wird auf Fomantic UI neu portiert.</p>
      {Object.keys(params).length > 0 && (
        <pre>{JSON.stringify(params, null, 2)}</pre>
      )}
    </div>
  );
}

export function makePlaceholder(name: string) {
  const Component = () => <Placeholder name={name} />;
  Component.displayName = `Placeholder(${name})`;
  return Component;
}

export default Placeholder;
