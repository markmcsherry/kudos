import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
import { ADMIN_ROUTES } from "../admin/routes";

const moduleTiles = [
  {
    title: "Manage Admin Users",
    description: "Admin account and role governance workflows.",
    actionLabel: "Open Users",
    actionTo: ADMIN_ROUTES.users
  },
  {
    title: "Manage Users",
    description: "User lifecycle and status management.",
    actionLabel: "Open Users",
    actionTo: ADMIN_ROUTES.users
  },
  {
    title: "Tag Management",
    description: "Create and maintain recognition tags.",
    actionLabel: "Open Tags",
    actionTo: ADMIN_ROUTES.tags
  },
  {
    title: "Certification Management",
    description: "Certification management module TODO.",
    actionLabel: "TODO",
    actionTo: null
  },
  {
    title: "Kudos Management",
    description: "Kudos lifecycle controls and operations TODO.",
    actionLabel: "TODO",
    actionTo: null
  },
  {
    title: "Feature Toggle",
    description: "Feature toggle governance and controls.",
    actionLabel: "Open Feature Toggles",
    actionTo: ADMIN_ROUTES.featureToggles
  },
  {
    title: "Audit Logs",
    description: "Investigate security and operational events.",
    actionLabel: "Open Audit Logs",
    actionTo: ADMIN_ROUTES.auditLog
  }
];

function AdminLandingPage() {
  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h6" component="h2">
          Admin Landing Modules
        </Typography>
        <Typography color="text.secondary">Use the tiles to navigate active modules or view TODO areas.</Typography>
      </Box>
      <Grid container spacing={2}>
        {moduleTiles.map((tile) => (
          <Grid key={tile.title} size={{ xs: 12, md: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">{tile.title}</Typography>
                <Typography color="text.secondary">{tile.description}</Typography>
              </CardContent>
              <CardActions>
                {tile.actionTo ? (
                  <Button component={Link} to={tile.actionTo} size="small" variant="outlined">
                    {tile.actionLabel}
                  </Button>
                ) : (
                  <Button size="small" variant="outlined" disabled>
                    {tile.actionLabel}
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

export default AdminLandingPage;
