import React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

const DEFAULT_PAGE_SIZE = 20;

function formatDate(value) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toISOString();
}

function AdminUsersPage() {
  const [searchText, setSearchText] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [query, setQuery] = React.useState({ page: 1, pageSize: DEFAULT_PAGE_SIZE, search: "", status: "all" });
  const [items, setItems] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      params.set("page", String(query.page));
      params.set("pageSize", String(query.pageSize));
      if (query.search) {
        params.set("search", query.search);
      }
      if (query.status && query.status !== "all") {
        params.set("status", query.status);
      }

      try {
        const response = await fetch(`/api/admin/users?${params.toString()}`, {
          credentials: "include"
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Unable to load users.");
        }

        if (!active) {
          return;
        }

        setItems(Array.isArray(payload.items) ? payload.items : []);
        setTotal(Number(payload.total) || 0);
        setPage(Number(payload.page) || query.page);
      } catch (fetchError) {
        if (!active) {
          return;
        }
        setError(fetchError.message || "Unable to load users.");
        setItems([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [query]);

  function applyFilters() {
    setQuery({
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      search: searchText.trim(),
      status
    });
  }

  const hasPrevious = page > 1;
  const hasNext = page * DEFAULT_PAGE_SIZE < total;

  return (
    <Stack spacing={2}>
      <Typography variant="h6" component="h2">
        User Management
      </Typography>

      <Card variant="outlined">
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="Search name or email"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              fullWidth
            />
            <TextField
              select
              label="Status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              sx={{ minWidth: { xs: "100%", md: 220 } }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Stack>
        </CardContent>
        <CardActions>
          <Button variant="contained" onClick={applyFilters}>
            Apply
          </Button>
        </CardActions>
      </Card>

      {error ? <Alert severity="error">{error}</Alert> : null}
      {loading ? <Alert severity="info">Loading users...</Alert> : null}

      {!loading && !error && items.length === 0 ? <Alert severity="warning">No users match current search/filter.</Alert> : null}

      {!loading && items.length > 0 ? (
        <Card variant="outlined">
          <CardContent>
            <Table size="small" aria-label="Users table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Admin</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Updated</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{`${item.firstName || ""} ${item.lastName || ""}`.trim() || "-"}</TableCell>
                    <TableCell>{item.email || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={item.status === "inactive" ? "Inactive" : "Active"}
                        color={item.status === "inactive" ? "default" : "success"}
                      />
                    </TableCell>
                    <TableCell>{item.isAdmin ? "Admin" : "User"}</TableCell>
                    <TableCell>{formatDate(item.createdAt)}</TableCell>
                    <TableCell>{formatDate(item.updatedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardActions sx={{ justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              Showing page {page} of {Math.max(1, Math.ceil(total / DEFAULT_PAGE_SIZE))}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                disabled={!hasPrevious}
                onClick={() => setQuery((prev) => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </Button>
              <Button
                variant="outlined"
                disabled={!hasNext}
                onClick={() => setQuery((prev) => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </Button>
            </Box>
          </CardActions>
        </Card>
      ) : null}

      <Typography variant="body2" color="text.secondary">
        Admin role changes are managed in Admin Access.
      </Typography>
    </Stack>
  );
}

export default AdminUsersPage;
