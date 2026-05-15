import React from "react";
import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../src/components/ProtectedRoute";
import DashboardPage from "../src/pages/DashboardPage";
import LoginPage from "../src/pages/LoginPage";
import RegisterPage from "../src/pages/RegisterPage";
import { renderWithProviders } from "./test-utils";

describe("Auth pages", () => {
  it("renders login fields", () => {
    renderWithProviders(<LoginPage />, { route: "/login" });
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    const banner = screen.getByRole("banner");
    expect(within(banner).queryByRole("link", { name: "Login" })).not.toBeInTheDocument();
    expect(within(banner).getByRole("link", { name: "Register" })).toBeInTheDocument();
  });

  it("renders register fields", () => {
    renderWithProviders(<RegisterPage />, { route: "/register" });
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Second Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    const banner = screen.getByRole("banner");
    expect(within(banner).queryByRole("link", { name: "Register" })).not.toBeInTheDocument();
    expect(within(banner).getByRole("link", { name: "Login" })).toBeInTheDocument();
  });

  it("renders dashboard tiles and mocked kudos for authenticated user", () => {
    renderWithProviders(<DashboardPage />, { user: { firstName: "Alex" } });
    expect(screen.getByText("Create Kudos")).toBeInTheDocument();
    expect(screen.getByText("My Kudos Received")).toBeInTheDocument();
    expect(screen.getByText(/Recent Kudos \(mocked\)/)).toBeInTheDocument();
    expect(screen.getAllByText(/From:/).length).toBeGreaterThanOrEqual(3);
  });

  it("redirects unauthenticated dashboard access to login", () => {
    renderWithProviders(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Destination</div>} />
        </Routes>
      </MemoryRouter>,
      { withRouter: false }
    );

    expect(screen.getByText("Login Destination")).toBeInTheDocument();
  });
});
