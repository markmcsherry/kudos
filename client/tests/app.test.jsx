import React from "react";
import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import App from "../src/App";
import { renderWithProviders } from "./test-utils";

describe("App routing", () => {
  it("renders landing composition on root route", () => {
    renderWithProviders(<App />, { withRouter: false });
    expect(screen.getByRole("link", { name: "Register" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
  });
});
