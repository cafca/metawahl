import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { router } from "./routes";
import { queryClient, persister, GC_TIME_MS, PERSIST_BUSTER } from "@/lib/queryClient";
import "fomantic-ui-css/semantic.min.css";
import "./index.css";

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
