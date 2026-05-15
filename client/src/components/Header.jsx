import React from "react";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function Header() {
  const { user, isAuthenticated } = useAuth();
  const initial = user?.firstName ? user.firstName.charAt(0).toUpperCase() : "U";

  return (
    <AppBar component="header" position="static" elevation={0} color="transparent">
      <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
        <Typography variant="h6" component="span" fontWeight={700}>
          Kudos
        </Typography>
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
            <Button variant="outlined" aria-label="Register" component={Link} to="/register">
              Register
            </Button>
            <Button variant="contained" aria-label="Login" component={Link} to="/login">
              Login
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Header;
