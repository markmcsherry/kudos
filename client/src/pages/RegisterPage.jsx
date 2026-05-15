import React, { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const response = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form)
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error || "Unable to register.");
        return;
      }
      setSuccess("Account created. You can now log in.");
      setTimeout(() => navigate("/login"), 500);
    } catch {
      setError("Unable to register right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="lg" sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <Box component="main" sx={{ flex: 1, display: "grid", placeItems: "center", py: 6 }}>
        <Container maxWidth="sm">
          <Paper sx={{ p: 4, borderRadius: 3 }}>
            <Stack spacing={3} component="form" onSubmit={onSubmit}>
              <Typography variant="h4" component="h1">
                Register
              </Typography>
              {error && <Alert severity="error">{error}</Alert>}
              {success && <Alert severity="success">{success}</Alert>}
              <TextField
                label="First Name"
                value={form.firstName}
                onChange={(event) => setForm({ ...form, firstName: event.target.value })}
                required
              />
              <TextField
                label="Second Name"
                value={form.lastName}
                onChange={(event) => setForm({ ...form, lastName: event.target.value })}
                required
              />
              <TextField
                label="Email"
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
              />
              <TextField
                label="Password"
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                required
                helperText="Minimum 8 characters"
              />
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
              <Typography variant="body2">
                Already have an account? <Link to="/login">Login</Link>
              </Typography>
            </Stack>
          </Paper>
        </Container>
      </Box>
      <Footer />
    </Container>
  );
}

export default RegisterPage;
