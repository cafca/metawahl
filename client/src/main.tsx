import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { router } from "./routes";
import { queryClient, persister, GC_TIME_MS, PERSIST_BUSTER } from "@/lib/queryClient";
import "fomantic-ui-css/semantic.min.css";
import "./index.css";

/* Eagerly import every view + component stylesheet so all rules load on
   every route. Order matters for cascade: components first (defaults),
   then views (overrides). */
import "@/components/DataLabel.css";
import "@/components/Legend.css";
import "@/components/Map.css";
import "@/components/PositionChart.css";
import "@/components/SourcesFooter.css";
import "@/components/SuggestionsGrid.css";
import "@/components/Thesis.css";
import "@/views/DataOverview.css";
import "@/views/Election.css";
import "@/views/ElectionList.css";
import "@/views/Landing.css";
import "@/views/Quiz.css";
import "@/views/TagOverview.css";
import "@/views/Thesis.css";

if (persister) {
  persistQueryClient({
    queryClient,
    persister,
    maxAge: GC_TIME_MS,
    buster: PERSIST_BUSTER,
  });
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
