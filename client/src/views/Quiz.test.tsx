import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import QuizView from "./Quiz";
import type { ElectionResponse, QuizResponse } from "@/types/api";

function makeClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
    },
  });
}

function mockElectionResponse(): ElectionResponse {
  return {
    data: {
      id: 1,
      date: "2021-09-26 00:00:00 Z",
      territory: "deutschland",
      title: "Bundestagswahl 2021",
      source: "https://wahl-o-mat/",
      wikidata_id: null,
      wikipedia_title: null,
      results: {
        CDU: { pct: 28, votes: null },
        SPD: { pct: 30, votes: null },
        Grüne: { pct: 12, votes: null },
        AfD: { pct: 30, votes: null },
      },
      results_source: { name: "Tagesschau", url: "https://tagesschau/" },
    },
    meta: { api: "v3", license: "", render_time: "0.01s" },
    theses: [
      {
        id: "WOM-001-00",
        election_id: 1,
        title: null,
        text: "Erste Frage: Sollen wir X tun?",
        positions: [
          { party: "CDU", value: 1 },
          { party: "SPD", value: 1 },
          { party: "Grüne", value: -1 },
          { party: "AfD", value: -1 },
        ],
        tags: [],
      },
      {
        id: "WOM-001-01",
        election_id: 1,
        title: null,
        text: "Zweite Frage: Sollen wir Y tun?",
        positions: [
          { party: "CDU", value: -1 },
          { party: "SPD", value: -1 },
          { party: "Grüne", value: 1 },
          { party: "AfD", value: 1 },
        ],
        tags: [],
      },
    ],
  };
}

function mockQuizResponse(): QuizResponse {
  return {
    data: { "0": [1, 0], "1": [0, 1] },
    error: null,
    meta: { api: "v3", license: "", render_time: "0.01s" },
  };
}

function renderQuiz() {
  const client = makeClient();
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/quiz/deutschland/1/"]}>
        <Routes>
          <Route path="/quiz/:territory/:electionNum/" element={<QuizView />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

// Vitest 4's jsdom wiring lazily surfaces `localStorage` as a plain object
// without the Storage prototype; provide a minimal in-memory shim so the
// quiz's progress persistence code runs the same as in a browser.
function installLocalStorageShim() {
  const store = new Map<string, string>();
  const shim: Storage = {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key) {
      return store.get(key) ?? null;
    },
    key(index) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key) {
      store.delete(key);
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
  };
  vi.stubGlobal("localStorage", shim);
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: shim,
  });
}

describe("QuizView", () => {
  beforeEach(() => {
    installLocalStorageShim();
    vi.stubGlobal("scrollTo", vi.fn());
    Object.defineProperty(window, "scrollTo", {
      configurable: true,
      value: vi.fn(),
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.endsWith("/elections/1")) {
          return new Response(JSON.stringify(mockElectionResponse()), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
        if (url.endsWith("/quiz/1")) {
          return new Response(JSON.stringify(mockQuizResponse()), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
        // Submit endpoint: fire-and-forget 200.
        if (url.includes("/quiz/1/")) {
          return new Response("{}", { status: 200 });
        }
        return new Response("{}", { status: 200 });
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the first quiz question", async () => {
    renderQuiz();

    await waitFor(() =>
      expect(screen.getByText(/Erste Frage/)).toBeInTheDocument(),
    );
    // Two answer buttons.
    expect(
      screen.getByRole("button", { name: /Mehrheit stimmt dafür/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Mehrheit stimmt dagegen/ }),
    ).toBeInTheDocument();
    // Progress indicator.
    expect(screen.getByText(/Frage 1 \/ 2/)).toBeInTheDocument();
  });

  it("advances to the next question when the user answers and clicks next", async () => {
    renderQuiz();
    const user = userEvent.setup();

    await waitFor(() =>
      expect(screen.getByText(/Erste Frage/)).toBeInTheDocument(),
    );

    // Thesis 0: CDU+SPD (58%) are pro → correct answer is 1 ("dafür").
    await user.click(
      screen.getByRole("button", { name: /Mehrheit stimmt dafür/ }),
    );

    // Reveal banner appears.
    await waitFor(() =>
      expect(screen.getByText(/Richtig|Leider falsch/)).toBeInTheDocument(),
    );

    // Next question control appears, click it.
    const next = screen.getByRole("button", { name: /Nächste Frage|Ergebnis zeigen/ });
    await user.click(next);

    // Second question shown.
    await waitFor(() =>
      expect(screen.getByText(/Zweite Frage/)).toBeInTheDocument(),
    );
    expect(screen.getByText(/Frage 2 \/ 2/)).toBeInTheDocument();
  });
});
