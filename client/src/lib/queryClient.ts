import { QueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

export const STALE_TIME_MS = 5 * 60 * 1000;
export const GC_TIME_MS = 24 * 60 * 60 * 1000;
export const PERSIST_BUSTER = "metawahl-v1";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME_MS,
      gcTime: GC_TIME_MS,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const persister =
  typeof window !== "undefined"
    ? createSyncStoragePersister({
        storage: window.localStorage,
        key: "metawahl-query-cache",
      })
    : undefined;
