import React from "react";
import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { ADMIN_ROUTES } from "../src/admin/routes";
import App from "../src/App";
import { renderWithProviders } from "./test-utils";

describe("Admin route protection", () => {
  it("redirects unauthenticated users to /kudos/login", () => {
    window.history.pushState({}, "", "/kudos/admin");
    renderWithProviders(<App />, { withRouter: false });
    expect(window.location.pathname).toBe("/kudos/login");
  });

  it("redirects authenticated non-admin users to /kudos", () => {
    window.history.pushState({}, "", "/kudos/admin");
    renderWithProviders(<App />, {
      withRouter: false,
      user: { firstName: "Alex", isAdmin: false }
    });
    expect(window.location.pathname).toBe("/kudos");
  });

  it("allows admin users to access /kudos/admin", () => {
    window.history.pushState({}, "", "/kudos/admin");
    renderWithProviders(<App />, {
      withRouter: false,
      user: { firstName: "Admin", isAdmin: true }
    });
    expect(screen.getByRole("heading", { name: "Admin Console" })).toBeInTheDocument();
  });

  it("resolves each admin sub-route for admin users", () => {
    const routesToHeadings = [
      [ADMIN_ROUTES.users, "User and Admin Management"],
      [ADMIN_ROUTES.tags, "Tag Management"],
      [ADMIN_ROUTES.jobs, "Jobs and Maintenance"],
      [ADMIN_ROUTES.featureToggles, "Feature Toggle Management"]
    ];

    for (const [route, heading] of routesToHeadings) {
      window.history.pushState({}, "", route);
      renderWithProviders(<App />, {
        withRouter: false,
        user: { firstName: "Admin", isAdmin: true }
      });
      expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
    }
  });
});
