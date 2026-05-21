import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link, Outlet, useLocation } from "react-router-dom";
import { ADMIN_ROUTES } from "../admin/routes";
import Footer from "./Footer";
import Header from "./Header";

const navItems = [
  { label: "Console", path: ADMIN_ROUTES.root },
  { label: "Users", path: ADMIN_ROUTES.users },
  { label: "Admin Access", path: ADMIN_ROUTES.adminAccess },
  { label: "Tags", path: ADMIN_ROUTES.tags },
  { label: "Jobs", path: ADMIN_ROUTES.jobs },
  { label: "Feature Toggles", path: ADMIN_ROUTES.featureToggles },
  { label: "Audit Logs", path: ADMIN_ROUTES.auditLog }
];

function AdminShell() {
  const location = useLocation();

  return (
    <Container maxWidth="lg" sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <Box component="main" sx={{ flex: 1, py: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" component="h1">
              Admin Console
            </Typography>
            <Typography color="text.secondary">Administration routes are isolated under /kudos/admin/*.</Typography>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            {navItems.map((item) => {
              const selected = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  variant={selected ? "contained" : "outlined"}
                >
                  {item.label}
                </Button>
              );
            })}
          </Stack>
          <Outlet />
        </Stack>
      </Box>
      <Footer />
    </Container>
  );
}

export default AdminShell;
