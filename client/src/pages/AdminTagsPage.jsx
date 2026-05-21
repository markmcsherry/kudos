import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

function AdminTagsPage() {
  return (
    <Stack spacing={2}>
      <Typography variant="h6" component="h2">
        Tag Management
      </Typography>
      <Card variant="outlined">
        <CardContent>
          <Typography color="text.secondary">TODO: create, edit, and retire tags.</Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default AdminTagsPage;
