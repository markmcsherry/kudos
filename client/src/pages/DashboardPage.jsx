import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const mockedKudos = [
  {
    id: 1,
    from: "Alice Johnson",
    to: "Bob Smith",
    description: "Thanks for helping with release checks.",
    date: "2026-05-14",
    type: "teamwork"
  },
  {
    id: 2,
    from: "Bob Smith",
    to: "Alice Johnson",
    description: "Great support during onboarding.",
    date: "2026-05-13",
    type: "support"
  },
  {
    id: 3,
    from: "Alice Johnson",
    to: "Alice Johnson",
    description: "Documented deployment smoke test steps.",
    date: "2026-05-12",
    type: "quality"
  }
];

function DashboardPage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  async function logout() {
    await fetch("/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    navigate("/login");
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Stack spacing={3}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h4" component="h1">
              Welcome {user?.firstName || "User"}
            </Typography>
            <Typography color="text.secondary">Your Kudos workspace overview</Typography>
          </Box>
          <Button variant="outlined" onClick={logout}>
            Logout
          </Button>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6">Create Kudos</Typography>
                <Typography color="text.secondary">Start recognizing a valuable contribution.</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6">My Kudos Received</Typography>
                <Typography color="text.secondary">Review kudos awarded to you.</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Recent Kudos (mocked)
          </Typography>
          <Stack spacing={2}>
            {mockedKudos.map((item) => (
              <Card key={item.id} variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1">{item.description}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    From: {item.from} | To: {item.to}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Date: {item.date} | Type: {item.type}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}

export default DashboardPage;
