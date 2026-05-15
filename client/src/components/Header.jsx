import React from "react";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import logo from "../assets/logo/kudos-logo.svg";

function Header() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const initial = user?.firstName ? user.firstName.charAt(0).toUpperCase() : "U";
  const [logoVisible, setLogoVisible] = React.useState(true);
  const onLoginPage = location.pathname === "/login";
  const onRegisterPage = location.pathname === "/register";

  return (
    <AppBar component="header" position="static" elevation={0} color="transparent">
      <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
        <Box
          component={Link}
          to="/"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            textDecoration: "none",
            minHeight: 40
          }}
          aria-label="Kudos home"
        >
          {logoVisible ? (
            <Box
              component="img"
              src={logo}
              alt="Kudos logo"
              onError={() => setLogoVisible(false)}
              sx={{
                height: { xs: 24, md: 30 },
                width: "auto",
                display: "block"
              }}
            />
          ) : null}
          <Typography variant="h6" component="span" fontWeight={700} color="text.primary">
            Kudos
          </Typography>
        </Box>
        {isAuthenticated ? (
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
            <Button variant="outlined" component={Link} to="/dashboard">
              Dashboard
            </Button>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }} aria-label="Profile">
              <Avatar sx={{ width: 30, height: 30 }}>{initial}</Avatar>
              <Typography variant="body2" color="text.secondary">
                {user?.firstName || "Profile"}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: "flex", gap: 1 }}>
            {!onRegisterPage ? (
              <Button variant="outlined" aria-label="Register" component={Link} to="/register">
                Register
              </Button>
            ) : null}
            {!onLoginPage ? (
              <Button variant="contained" aria-label="Login" component={Link} to="/login">
                Login
              </Button>
            ) : null}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Header;
