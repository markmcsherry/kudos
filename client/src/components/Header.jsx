import React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";

function Header() {
  return (
    <AppBar component="header" position="static" elevation={0} color="transparent">
      <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
        <Typography variant="h6" component="span" fontWeight={700}>
          Kudos
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" aria-label="Register" component={Link} to="/register">
            Register
          </Button>
          <Button variant="contained" aria-label="Login" component={Link} to="/login">
            Login
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
