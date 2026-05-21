import React from "react";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        borderTop: 1,
        borderColor: "divider",
        py: 3,
        mt: "auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 2,
        flexWrap: "wrap"
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Build recognition. Share gratitude.
      </Typography>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Link component={RouterLink} to="/kudos" underline="hover">
          Home
        </Link>
        <Link component={RouterLink} to="/kudos/about" underline="hover">
          About
        </Link>
      </Box>
    </Box>
  );
}

export default Footer;
