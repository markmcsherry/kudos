import React from "react";
import { render } from "@testing-library/react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../src/auth/AuthContext";
import getTheme from "../src/theme";

export function renderWithProviders(ui, { route = "/", mode = "light", withRouter = true, user = null } = {}) {
  const theme = getTheme(mode);
  const content = withRouter ? <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter> : ui;
  return render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider initialUser={user}>{content}</AuthProvider>
    </ThemeProvider>
  );
}
