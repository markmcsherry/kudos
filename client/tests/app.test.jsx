import React from "react";
import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import App from "../src/App";
import { renderWithProviders } from "./test-utils";

describe("App routing", () => {
  it("renders landing composition on /kudos route", () => {
    window.history.pushState({}, "", "/kudos");
    renderWithProviders(<App />, { withRouter: false });
    expect(screen.getByRole("link", { name: "Kudos home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Register" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
  });

  it("redirects root route to /kudos", () => {
    window.history.pushState({}, "", "/");
    renderWithProviders(<App />, { withRouter: false });
    expect(window.location.pathname).toBe("/kudos");
  });
});
