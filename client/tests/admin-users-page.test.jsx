import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminUsersPage from "../src/pages/AdminUsersPage";
import { renderWithProviders } from "./test-utils";

function createResponse(body) {
  return {
    ok: true,
    json: async () => body
  };
}

function createErrorResponse(body) {
  return {
    ok: false,
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

  it("applies search when pressing Enter in search field", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminUsersPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    const searchInput = screen.getByLabelText("Search name or email");
    await user.type(searchInput, "john{enter}");

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    const lastCallUrl = global.fetch.mock.calls.at(-1)[0];
    expect(lastCallUrl).toContain("search=john");
  });

  it("opens read-only user detail view from row action", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminUsersPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    await user.click(screen.getByRole("button", { name: "Row actions for john@example.com" }));
    await user.click(screen.getByRole("menuitem", { name: "View" }));

    const dialog = screen.getByRole("dialog", { name: "User Details" });
    expect(within(dialog).getByText(/john@example.com/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/Yes \(read-only\)|No \(read-only\)/)).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: "Go to Admin Access" })).toBeInTheDocument();
  });

  it("creates a user successfully from modal and refreshes list", async () => {
    const user = userEvent.setup();

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(
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
      )
      .mockResolvedValueOnce(
        createResponse({
          user: {
            id: 2,
            firstName: "Jane",
            lastName: "Doe",
            email: "jane@example.com",
            isAdmin: false,
            status: "inactive"
          }
        })
      )
      .mockResolvedValueOnce(
        createResponse({
          page: 1,
          pageSize: 20,
          total: 2,
          items: [
            {
              id: 2,
              firstName: "Jane",
              lastName: "Doe",
              email: "jane@example.com",
              isAdmin: false,
              status: "inactive",
              createdAt: "2026-05-21T12:00:00.000Z",
              updatedAt: "2026-05-21T12:00:00.000Z"
            },
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

    renderWithProviders(<AdminUsersPage />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole("button", { name: "Create User" }));
    const createDialog = screen.getByRole("dialog", { name: "Create User" });
    await user.type(within(createDialog).getByRole("textbox", { name: /First name/i }), "Jane");
    await user.type(within(createDialog).getByRole("textbox", { name: /Last name/i }), "Doe");
    await user.type(within(createDialog).getByRole("textbox", { name: /Email/i }), "jane@example.com");
    await user.type(within(createDialog).getByLabelText(/Password/i, { selector: "input" }), "password123");
    await user.click(within(createDialog).getByLabelText("Status"));
    await user.click(screen.getByRole("option", { name: "Inactive" }));
    await user.click(within(createDialog).getByRole("button", { name: "Create User" }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(3));
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Create User" })).not.toBeInTheDocument();
    });
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByText("Inactive")).toBeInTheDocument();

    const createRequestBody = JSON.parse(global.fetch.mock.calls[1][1].body);
    expect(createRequestBody.status).toBe("inactive");
  });

  it("shows inline validation feedback from API when create fails", async () => {
    const user = userEvent.setup();

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(
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
      )
      .mockResolvedValueOnce(
        createErrorResponse({
          error: "Invalid user input.",
          fieldErrors: {
            email: "Email format is invalid.",
            password: "Password must be at least 8 characters."
          }
        })
      );

    renderWithProviders(<AdminUsersPage />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole("button", { name: "Create User" }));
    const createDialog = screen.getByRole("dialog", { name: "Create User" });
    await user.type(within(createDialog).getByRole("textbox", { name: /First name/i }), "Bad");
    await user.type(within(createDialog).getByRole("textbox", { name: /Last name/i }), "Input");
    await user.type(within(createDialog).getByRole("textbox", { name: /Email/i }), "not-an-email");
    await user.type(within(createDialog).getByLabelText(/Password/i, { selector: "input" }), "123");
    await user.click(within(createDialog).getByRole("button", { name: "Create User" }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
    expect(screen.getByText("Invalid user input.")).toBeInTheDocument();
    expect(screen.getByText("Email format is invalid.")).toBeInTheDocument();
    expect(screen.getByText("Password must be at least 8 characters.")).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Create User" })).toBeInTheDocument();
  });

  it("edits a user and requires confirmation when status changes", async () => {
    const user = userEvent.setup();
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(
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
      )
      .mockResolvedValueOnce(
        createResponse({
          user: {
            id: 1,
            firstName: "John",
            lastName: "Edited",
            email: "john@example.com",
            isAdmin: false,
            status: "inactive"
          }
        })
      )
      .mockResolvedValueOnce(
        createResponse({
          page: 1,
          pageSize: 20,
          total: 1,
          items: [
            {
              id: 1,
              firstName: "John",
              lastName: "Edited",
              email: "john@example.com",
              isAdmin: false,
              status: "inactive",
              createdAt: "2026-05-21T10:00:00.000Z",
              updatedAt: "2026-05-21T12:00:00.000Z"
            }
          ]
        })
      );

    renderWithProviders(<AdminUsersPage />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole("button", { name: "Row actions for john@example.com" }));
    await user.click(screen.getByRole("menuitem", { name: "Edit" }));
    const editDialog = screen.getByRole("dialog", { name: "Edit User" });
    const lastNameInput = within(editDialog).getByRole("textbox", { name: /Last name/i });
    await user.clear(lastNameInput);
    await user.type(lastNameInput, "Edited");
    await user.click(within(editDialog).getByRole("radio", { name: "Inactive" }));
    await user.click(within(editDialog).getByRole("button", { name: "Save Changes" }));

    const confirmDialog = screen.getByRole("dialog", { name: "Confirm Status Change" });
    expect(within(confirmDialog).getByText(/Deactivate this user account/i)).toBeInTheDocument();
    await user.click(within(confirmDialog).getByRole("button", { name: "Confirm" }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(3));
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Confirm Status Change" })).not.toBeInTheDocument();
    });

    const patchRequestBody = JSON.parse(global.fetch.mock.calls[1][1].body);
    expect(patchRequestBody.status).toBe("inactive");
  });

  it("cancels status confirmation without submitting edit", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminUsersPage />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole("button", { name: "Row actions for john@example.com" }));
    await user.click(screen.getByRole("menuitem", { name: "Edit" }));
    const editDialog = screen.getByRole("dialog", { name: "Edit User" });
    await user.click(within(editDialog).getByRole("radio", { name: "Inactive" }));
    await user.click(within(editDialog).getByRole("button", { name: "Save Changes" }));

    const confirmDialog = screen.getByRole("dialog", { name: "Confirm Status Change" });
    await user.click(within(confirmDialog).getByRole("button", { name: "Cancel" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Confirm Status Change" })).not.toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("formats timestamps and hides Created column in users list", async () => {
    renderWithProviders(<AdminUsersPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    expect(screen.queryByRole("columnheader", { name: "Created" })).not.toBeInTheDocument();
    expect(screen.getByText(/\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}/)).toBeInTheDocument();
  });
});
