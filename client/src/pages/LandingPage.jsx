import React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Header from "../components/Header";
import Footer from "../components/Footer";

function LandingPage() {
  return (
    <Container maxWidth="lg" sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <Box component="main" sx={{ flex: 1, display: "grid", placeItems: "center", py: { xs: 6, md: 10 } }}>
        <Paper
          elevation={2}
          sx={{
            width: "100%",
            maxWidth: 760,
            p: { xs: 3, sm: 5 },
            borderRadius: 3,
            backgroundImage:
              "linear-gradient(125deg, rgba(31,111,139,0.15), rgba(242,166,90,0.2))"
          }}
        >
          <Stack spacing={2}>
            <Typography component="h1" variant="h3" sx={{ fontSize: { xs: "2rem", md: "3rem" } }}>
              Kudos
            </Typography>
            <Typography variant="h6" color="text.secondary">
              A lightweight place to recognize impactful contributions and celebrate progress across your team.
            </Typography>
          </Stack>
        </Paper>
      </Box>
      <Footer />
    </Container>
  );
}

export default LandingPage;
