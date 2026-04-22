import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Force admin mode before the module under test is imported; the component
// returns `null` when IS_ADMIN is false.
vi.mock("@/config", async () => {
  const actual = await vi.importActual<typeof import("@/config")>("@/config");
  return { ...actual, IS_ADMIN: true };
});

import { WikidataTagger, type WikidataMatch } from "./WikidataTagger";

function mockWikidataResponse() {
  return {
    success: 1,
    search: [
      {
        id: "Q7187",
        label: "Gen",
        description: "Abschnitt der DNA, der Erbinformation enthält",
        concepturi: "https://www.wikidata.org/entity/Q7187",
      },
    ],
  };
}

describe("WikidataTagger", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(JSON.stringify(mockWikidataResponse()), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the search input with a placeholder", () => {
    render(<WikidataTagger onSelection={() => {}} />);
    expect(screen.getByPlaceholderText(/Tag hinzufügen/)).toBeInTheDocument();
  });

  it("emits the selected match when the user picks a hit", async () => {
    const onSelection = vi.fn<(m: WikidataMatch) => void>();
    render(<WikidataTagger onSelection={onSelection} />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/Tag hinzufügen/), "Gen");

    await waitFor(() => expect(screen.getByText("Gen")).toBeInTheDocument(), {
      timeout: 2000,
    });

    await user.click(screen.getByText("Gen"));

    expect(onSelection).toHaveBeenCalledWith(
      expect.objectContaining({ id: "Q7187", label: "Gen" }),
    );
  });
});
