import { lazy, Suspense } from "react";

import SEO from "@/components/SEO";

import "./DataOverview.css";

const SwaggerUI = lazy(() => import("swagger-ui-react"));

export default function DataOverview() {
  return (
    <main className="ui container app-main">
      <SEO title="Metawahl API" />
      <Suspense fallback={<div className="ui active centered inline loader" />}>
        <SwaggerUI url="/swagger.yaml" />
      </Suspense>
    </main>
  );
}
