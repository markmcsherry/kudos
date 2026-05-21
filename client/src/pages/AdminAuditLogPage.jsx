import React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
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
const EVENT_TYPE_OPTIONS = [
  "auth.register.success",
  "auth.register.failure",
  "auth.login.success",
  "auth.login.failure",
  "auth.login.locked",
  "auth.logout.success",
  "auth.me.success",
  "auth.me.failure",
  "auth.session.timeout",
  "security.authz.denied",
  "admin.bootstrap.created",
  "admin.bootstrap.promoted",
  "admin.bootstrap.noop",
  "admin.bootstrap.failed"
];
const RESULT_OPTIONS = ["success", "failure", "denied"];

function toDateTimeLocalValue(date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function createLast24HourDefaults() {
  const to = new Date();
  const from = new Date(to.getTime() - 24 * 60 * 60 * 1000);
  return {
    from: toDateTimeLocalValue(from),
    to: toDateTimeLocalValue(to),
    eventType: "",
    result: ""
  };
}

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

function AdminAuditLogPage() {
  const [filters, setFilters] = React.useState(createLast24HourDefaults);
  const [query, setQuery] = React.useState({ page: 1, pageSize: DEFAULT_PAGE_SIZE, ...filters });
  const [items, setItems] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(DEFAULT_PAGE_SIZE);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [selectedEvent, setSelectedEvent] = React.useState(null);

  React.useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      params.set("page", String(query.page));
      params.set("pageSize", String(query.pageSize));

      for (const [key, value] of Object.entries(query)) {
        if (key === "page" || key === "pageSize") {
          continue;
        }
        if (value) {
          params.set(key, value);
        }
      }

      try {
        const response = await fetch(`/api/admin/audit-events?${params.toString()}`, {
          credentials: "include"
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Unable to load audit events.");
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
        setError(fetchError.message || "Unable to load audit events.");
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
      pageSize,
      ...filters
    });
  }

  function clearFilters() {
    const reset = { from: "", to: "", eventType: "", result: "" };
    setFilters(reset);
    setQuery({ page: 1, pageSize, ...reset });
  }

  const hasPrevious = page > 1;
  const hasNext = page * pageSize < total;

  return (
    <Stack spacing={2}>
      <Typography variant="h6" component="h2">
        Audit Logs
      </Typography>

      <Card variant="outlined">
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="From"
              type="datetime-local"
              value={filters.from}
              onChange={(event) => setFilters((prev) => ({ ...prev, from: event.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="To"
              type="datetime-local"
              value={filters.to}
              onChange={(event) => setFilters((prev) => ({ ...prev, to: event.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Event Type"
              select
              value={filters.eventType}
              onChange={(event) => setFilters((prev) => ({ ...prev, eventType: event.target.value }))}
              fullWidth
            >
              <MenuItem value="">All event types</MenuItem>
              {EVENT_TYPE_OPTIONS.map((eventType) => (
                <MenuItem key={eventType} value={eventType}>
                  {eventType}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Result"
              select
              value={filters.result}
              onChange={(event) => setFilters((prev) => ({ ...prev, result: event.target.value }))}
              fullWidth
            >
              <MenuItem value="">All results</MenuItem>
              {RESULT_OPTIONS.map((resultOption) => (
                <MenuItem key={resultOption} value={resultOption}>
                  {resultOption}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Default date scope on page load is the last 24 hours.
          </Typography>
        </CardContent>
        <CardActions>
          <Button variant="contained" onClick={applyFilters}>
            Apply
          </Button>
          <Button variant="outlined" onClick={clearFilters}>
            Clear filters
          </Button>
        </CardActions>
      </Card>

      {error ? <Alert severity="error">{error}</Alert> : null}
      {loading ? <Alert severity="info">Loading audit events...</Alert> : null}

      {!loading && !error && items.length === 0 ? (
        <Alert severity="warning">No audit events match current filters.</Alert>
      ) : null}

      {!loading && items.length > 0 ? (
        <Card variant="outlined">
          <CardContent>
            <Table size="small" aria-label="Audit events table">
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>Actor</TableCell>
                  <TableCell>Event Type</TableCell>
                  <TableCell>Target</TableCell>
                  <TableCell>Result</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{formatDate(item.occurred_at)}</TableCell>
                    <TableCell>{item.actor_user_id ?? "-"}</TableCell>
                    <TableCell>{item.event_type ?? "-"}</TableCell>
                    <TableCell>{item.target_type ? `${item.target_type}:${item.target_id || "-"}` : "-"}</TableCell>
                    <TableCell>{item.result ?? "-"}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => setSelectedEvent(item)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardActions sx={{ justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              Showing page {page} of {Math.max(1, Math.ceil(total / pageSize))}
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

      <Dialog open={Boolean(selectedEvent)} onClose={() => setSelectedEvent(null)} fullWidth maxWidth="md">
        <DialogTitle>Audit Event Details</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
            {selectedEvent ? JSON.stringify(selectedEvent, null, 2) : ""}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedEvent(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export default AdminAuditLogPage;
