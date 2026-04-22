import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Search } from "./Search";
import type { BaseResponse } from "@/types/api";

function makeClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
}

function mockBase(): BaseResponse {
  return {
    data: {
      elections: {
        deutschland: [
          {
            id: 1,
            date: "2021-09-26 00:00:00 Z",
            territory: "deutschland",
            title: "Bundestagswahl 2021",
            source: "https://wahl-o-mat/",
            wikidata_id: null,
            wikipedia_title: null,
            results: {},
          },
        ],
      } as BaseResponse["data"]["elections"],
      tags: [
        {
          slug: "klimaschutz",
          title: "Klimaschutz",
          description: "Thema Klimaschutz",
          thesis_count: 42,
        },
      ],
    },
    meta: { api: "v3", license: "", render_time: "0.01s" },
  };
}

function renderSearch() {
  const client = makeClient();
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <Search variant="inline" />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("Search", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(JSON.stringify(mockBase()), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }),
    );
  });

  it("renders the search input with the expected placeholder", async () => {
    renderSearch();
    expect(
      screen.getByPlaceholderText(/Suche nach Wahlen und Themen/),
    ).toBeInTheDocument();
  });

  it("shows matching results when the user types a query", async () => {
    renderSearch();
    const user = userEvent.setup();

    const input = screen.getByPlaceholderText(/Suche nach Wahlen und Themen/);
    await user.type(input, "Klima");

    await waitFor(() =>
      expect(screen.getByText(/Klimaschutz/)).toBeInTheDocument(),
    );
  });
});
