import { createBrowserRouter, Navigate } from "react-router-dom";
import { RootLayout } from "@/components/layout/RootLayout";

const lazyView = (loader: () => Promise<{ default: React.ComponentType }>) => async () => {
  const mod = await loader();
  return { Component: mod.default };
};

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", lazy: lazyView(() => import("@/views/Landing")) },
      { path: "/wahlen/", lazy: lazyView(() => import("@/views/ElectionList")) },
      { path: "/wahlen/:territory/", lazy: lazyView(() => import("@/views/Territory")) },
      {
        path: "/wahlen/:territory/:electionNum/",
        lazy: lazyView(() => import("@/views/Election")),
      },
      {
        path: "/wahlen/:territory/:electionNum/:thesisNum/",
        lazy: lazyView(() => import("@/views/Thesis")),
      },
      {
        path: "/quiz/:territory/:electionNum/",
        lazy: lazyView(() => import("@/views/Quiz")),
      },
      { path: "/themen/", lazy: lazyView(() => import("@/views/TagOverview")) },
      { path: "/themenliste/", lazy: lazyView(() => import("@/views/TagList")) },
      { path: "/themen/:tag/", lazy: lazyView(() => import("@/views/TagView")) },
      { path: "/themen/:tag/:page/", lazy: lazyView(() => import("@/views/TagView")) },
      { path: "/daten/", lazy: lazyView(() => import("@/views/DataOverview")) },
      { path: "/legal/", lazy: lazyView(() => import("@/views/Legal")) },
      { path: "/404", lazy: lazyView(() => import("@/views/NotFound")) },
      ...(import.meta.env.DEV
        ? [{ path: "/__lab", lazy: lazyView(() => import("@/views/Lab")) }]
        : []),
      { path: "*", element: <Navigate to="/404" replace /> },
    ],
  },
]);
