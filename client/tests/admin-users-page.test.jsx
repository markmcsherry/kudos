import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminUsersPage from "../src/pages/AdminUsersPage";
import { renderWithProviders } from "./test-utils";

function createResponse(body) {
  return {
    ok: true,
    json: async () => body
  };
}

describe("AdminUsersPage", () => {
  beforeEach(() => {
    global.fetch = vi.fn(async () =>
      createResponse({
        page: 1,
        pageSize: 20,
        total: 1,
        items: [
          {
            id: 1,
            firstName: "John",
            lastName: "Smith",
            email: "john@example.com",
            isAdmin: false,
            status: "active",
            createdAt: "2026-05-21T10:00:00.000Z",
            updatedAt: "2026-05-21T11:00:00.000Z"
          }
        ]
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders users table with status and admin indicator", async () => {
    renderWithProviders(<AdminUsersPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    expect(screen.getByRole("table", { name: "Users table" })).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("User")).toBeInTheDocument();
  });

  it("applies search and status filters", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminUsersPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    await user.type(screen.getByLabelText("Search name or email"), "smi");
    await user.click(screen.getByLabelText("Status"));
    await user.click(screen.getByRole("option", { name: "Inactive" }));
    await user.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    const lastCallUrl = global.fetch.mock.calls.at(-1)[0];
    expect(lastCallUrl).toContain("search=smi");
    expect(lastCallUrl).toContain("status=inactive");
  });
});
