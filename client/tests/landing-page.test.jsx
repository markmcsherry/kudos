import React from "react";
import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LandingPage from "../src/pages/LandingPage";
import { renderWithProviders } from "./test-utils";

describe("LandingPage", () => {
  it("renders title and blurb", () => {
    renderWithProviders(<LandingPage />);
    expect(screen.getByRole("heading", { name: "Kudos" })).toBeInTheDocument();
    expect(screen.getByText(/lightweight place to recognize/i)).toBeInTheDocument();
  });

  it("renders register/login and footer links", () => {
    renderWithProviders(<LandingPage />);
    expect(screen.getByRole("link", { name: "Register" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
  });

  it("supports keyboard navigation to controls", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LandingPage />);
    await user.tab();
    expect(screen.getByRole("link", { name: "Register" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "Login" })).toHaveFocus();
  });

  it("renders semantic regions", () => {
    renderWithProviders(<LandingPage />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("renders in dark mode", () => {
    renderWithProviders(<LandingPage />, { mode: "dark" });
    expect(screen.getByRole("heading", { name: "Kudos" })).toBeInTheDocument();
  });
});
