import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

function Skeleton() {
  return <h1>Metawahl — modern skeleton</h1>;
}

describe("skeleton", () => {
  it("renders the placeholder heading", () => {
    render(<Skeleton />);
    expect(screen.getByRole("heading", { name: /metawahl/i })).toBeInTheDocument();
  });
});
