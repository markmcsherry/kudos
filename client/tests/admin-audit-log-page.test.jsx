import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminAuditLogPage from "../src/pages/AdminAuditLogPage";
import { renderWithProviders } from "./test-utils";

function createSuccessResponse(body) {
  return {
    ok: true,
    json: async () => body
  };
}

describe("AdminAuditLogPage", () => {
  beforeEach(() => {
    global.fetch = vi.fn(async () => createSuccessResponse({ items: [], total: 0, page: 1 }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("defaults From and To filters to last 24 hours", async () => {
    renderWithProviders(<AdminAuditLogPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const fromInput = screen.getByLabelText("From");
    const toInput = screen.getByLabelText("To");

    expect(fromInput).toHaveValue();
    expect(toInput).toHaveValue();
    expect(screen.getByText("Default date scope on page load is the last 24 hours.")).toBeInTheDocument();
  });

  it("shows dropdown filters and no Actor User ID filter", async () => {
    renderWithProviders(<AdminAuditLogPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    expect(screen.getByLabelText("Event Type")).toBeInTheDocument();
    expect(screen.getByLabelText("Result")).toBeInTheDocument();
    expect(screen.queryByLabelText("Actor User ID")).not.toBeInTheDocument();
  });

  it("clears all filter fields to blank", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminAuditLogPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    await user.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(screen.getByLabelText("From")).toHaveValue("");
    expect(screen.getByLabelText("To")).toHaveValue("");

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    const lastCallUrl = global.fetch.mock.calls.at(-1)[0];
    expect(lastCallUrl).not.toContain("from=");
    expect(lastCallUrl).not.toContain("to=");
    expect(lastCallUrl).not.toContain("eventType=");
    expect(lastCallUrl).not.toContain("result=");
  });
});
