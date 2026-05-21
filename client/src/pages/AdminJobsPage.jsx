import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

function AdminJobsPage() {
  return (
    <Stack spacing={2}>
      <Typography variant="h6" component="h2">
        Jobs and Maintenance
      </Typography>
      <Card variant="outlined">
        <CardContent>
          <Typography color="text.secondary">
            TODO: operational jobs, scheduled tasks, and run history management.
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default AdminJobsPage;
