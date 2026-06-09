import React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
import { ADMIN_ROUTES } from "../admin/routes";

const DEFAULT_PAGE_SIZE = 20;

function formatDate(value) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}/${month}/${day} ${hours}:${minutes}`;
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
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [editUser, setEditUser] = React.useState(null);
  const [editFirstName, setEditFirstName] = React.useState("");
  const [editLastName, setEditLastName] = React.useState("");
  const [editEmail, setEditEmail] = React.useState("");
  const [editStatus, setEditStatus] = React.useState("active");
  const [editFieldErrors, setEditFieldErrors] = React.useState({});
  const [editSubmitError, setEditSubmitError] = React.useState("");
  const [editSubmitting, setEditSubmitting] = React.useState(false);
  const [statusConfirmOpen, setStatusConfirmOpen] = React.useState(false);
  const [pendingEditPayload, setPendingEditPayload] = React.useState(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createFirstName, setCreateFirstName] = React.useState("");
  const [createLastName, setCreateLastName] = React.useState("");
  const [createEmail, setCreateEmail] = React.useState("");
  const [createPassword, setCreatePassword] = React.useState("");
  const [createStatus, setCreateStatus] = React.useState("active");
  const [createFieldErrors, setCreateFieldErrors] = React.useState({});
  const [createSubmitError, setCreateSubmitError] = React.useState("");
  const [createSubmitting, setCreateSubmitting] = React.useState(false);
  const [actionsAnchorEl, setActionsAnchorEl] = React.useState(null);
  const [actionsUser, setActionsUser] = React.useState(null);

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

  function openCreateModal() {
    setCreateOpen(true);
    setCreateSubmitError("");
    setCreateFieldErrors({});
  }

  function closeCreateModal(force = false) {
    if (createSubmitting && !force) {
      return;
    }
    setCreateOpen(false);
    setCreateFirstName("");
    setCreateLastName("");
    setCreateEmail("");
    setCreatePassword("");
    setCreateStatus("active");
    setCreateSubmitError("");
    setCreateFieldErrors({});
  }

  async function submitCreateUser() {
    setCreateSubmitting(true);
    setCreateSubmitError("");
    setCreateFieldErrors({});

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          firstName: createFirstName,
          lastName: createLastName,
          email: createEmail,
          password: createPassword,
          status: createStatus
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        if (payload.fieldErrors && typeof payload.fieldErrors === "object") {
          setCreateFieldErrors(payload.fieldErrors);
        }
        throw new Error(payload.error || "Unable to create user.");
      }

      closeCreateModal(true);
      setQuery((prev) => ({ ...prev, page: 1 }));
    } catch (submitError) {
      setCreateSubmitError(submitError.message || "Unable to create user.");
    } finally {
      setCreateSubmitting(false);
    }
  }

  function openActionsMenu(event, user) {
    setActionsAnchorEl(event.currentTarget);
    setActionsUser(user);
  }

  function closeActionsMenu() {
    setActionsAnchorEl(null);
    setActionsUser(null);
  }

  function openEditModal(user) {
    setEditUser(user);
    setEditFirstName(user.firstName || "");
    setEditLastName(user.lastName || "");
    setEditEmail(user.email || "");
    setEditStatus(user.status || "active");
    setEditFieldErrors({});
    setEditSubmitError("");
  }

  function closeEditModal(force = false) {
    if (editSubmitting && !force) {
      return;
    }
    setEditUser(null);
    setEditFirstName("");
    setEditLastName("");
    setEditEmail("");
    setEditStatus("active");
    setEditFieldErrors({});
    setEditSubmitError("");
    setStatusConfirmOpen(false);
    setPendingEditPayload(null);
  }

  async function doSubmitEdit(payload) {
    if (!editUser) {
      return;
    }

    setEditSubmitting(true);
    setEditFieldErrors({});
    setEditSubmitError("");

    try {
      const response = await fetch(`/api/admin/users/${editUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        if (result.fieldErrors && typeof result.fieldErrors === "object") {
          setEditFieldErrors(result.fieldErrors);
        }
        throw new Error(result.error || "Unable to update user.");
      }

      closeEditModal(true);
      setQuery((prev) => ({ ...prev }));
    } catch (submitError) {
      setEditSubmitError(submitError.message || "Unable to update user.");
    } finally {
      setEditSubmitting(false);
      setStatusConfirmOpen(false);
      setPendingEditPayload(null);
    }
  }

  function submitEditUser() {
    if (!editUser) {
      return;
    }
    const payload = {
      firstName: editFirstName,
      lastName: editLastName,
      email: editEmail,
      status: editStatus
    };

    const priorStatus = (editUser.status || "active").toLowerCase();
    const nextStatus = String(editStatus || "active").toLowerCase();
    if (priorStatus !== nextStatus) {
      setPendingEditPayload(payload);
      setStatusConfirmOpen(true);
      return;
    }

    doSubmitEdit(payload);
  }

  const hasPrevious = page > 1;
  const hasNext = page * DEFAULT_PAGE_SIZE < total;

  return (
    <Stack spacing={2}>
      <Typography variant="h6" component="h2">
        User Management
      </Typography>

      <Box>
        <Button variant="contained" onClick={openCreateModal}>
          Create User
        </Button>
      </Box>

      <Card variant="outlined">
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="Search name or email"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  applyFilters();
                }
              }}
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
                  <TableCell>Updated</TableCell>
                  <TableCell>Actions</TableCell>
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
                    <TableCell>{formatDate(item.updatedAt)}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(event) => openActionsMenu(event, item)}
                        aria-label={`Row actions for ${item.email}`}
                      >
                        ...
                      </IconButton>
                    </TableCell>
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

      <Dialog open={Boolean(selectedUser)} onClose={() => setSelectedUser(null)} fullWidth maxWidth="sm">
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5}>
            <Typography variant="body2">
              <strong>Name:</strong>{" "}
              {selectedUser ? `${selectedUser.firstName || ""} ${selectedUser.lastName || ""}`.trim() || "-" : "-"}
            </Typography>
            <Typography variant="body2">
              <strong>Email:</strong> {selectedUser?.email || "-"}
            </Typography>
            <Typography variant="body2">
              <strong>Status:</strong> {selectedUser?.status === "inactive" ? "Inactive" : "Active"}
            </Typography>
            <Typography variant="body2">
              <strong>Admin:</strong> {selectedUser?.isAdmin ? "Yes (read-only)" : "No (read-only)"}
            </Typography>
            <Typography variant="body2">
              <strong>Created:</strong> {formatDate(selectedUser?.createdAt)}
            </Typography>
            <Typography variant="body2">
              <strong>Updated:</strong> {formatDate(selectedUser?.updatedAt)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Admin access changes are managed in the Admin Access section.
            </Typography>
            <Button component={Link} to={ADMIN_ROUTES.adminAccess} variant="outlined" onClick={() => setSelectedUser(null)}>
              Go to Admin Access
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedUser(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Menu open={Boolean(actionsAnchorEl)} anchorEl={actionsAnchorEl} onClose={closeActionsMenu}>
        <MenuItem
          onClick={() => {
            if (actionsUser) {
              setSelectedUser(actionsUser);
            }
            closeActionsMenu();
          }}
        >
          View
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (actionsUser) {
              openEditModal(actionsUser);
            }
            closeActionsMenu();
          }}
        >
          Edit
        </MenuItem>
      </Menu>

      <Dialog open={createOpen} onClose={closeCreateModal} fullWidth maxWidth="sm">
        <DialogTitle>Create User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            {createSubmitError ? <Alert severity="error">{createSubmitError}</Alert> : null}
            <TextField
              label="First name"
              value={createFirstName}
              onChange={(event) => setCreateFirstName(event.target.value)}
              error={Boolean(createFieldErrors.firstName)}
              helperText={createFieldErrors.firstName || " "}
              required
              fullWidth
            />
            <TextField
              label="Last name"
              value={createLastName}
              onChange={(event) => setCreateLastName(event.target.value)}
              error={Boolean(createFieldErrors.lastName)}
              helperText={createFieldErrors.lastName || " "}
              required
              fullWidth
            />
            <TextField
              label="Email"
              value={createEmail}
              onChange={(event) => setCreateEmail(event.target.value)}
              error={Boolean(createFieldErrors.email)}
              helperText={createFieldErrors.email || " "}
              required
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={createPassword}
              onChange={(event) => setCreatePassword(event.target.value)}
              error={Boolean(createFieldErrors.password)}
              helperText={createFieldErrors.password || "Use at least 8 characters."}
              required
              fullWidth
            />
            <TextField
              select
              label="Status"
              value={createStatus}
              onChange={(event) => setCreateStatus(event.target.value)}
              error={Boolean(createFieldErrors.status)}
              helperText={createFieldErrors.status || " "}
              fullWidth
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCreateModal} disabled={createSubmitting}>
            Cancel
          </Button>
          <Button variant="contained" onClick={submitCreateUser} disabled={createSubmitting}>
            {createSubmitting ? "Creating..." : "Create User"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(editUser)} onClose={() => closeEditModal()} fullWidth maxWidth="sm">
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            {editSubmitError ? <Alert severity="error">{editSubmitError}</Alert> : null}
            <TextField
              label="First name"
              value={editFirstName}
              onChange={(event) => setEditFirstName(event.target.value)}
              error={Boolean(editFieldErrors.firstName)}
              helperText={editFieldErrors.firstName || " "}
              required
              fullWidth
            />
            <TextField
              label="Last name"
              value={editLastName}
              onChange={(event) => setEditLastName(event.target.value)}
              error={Boolean(editFieldErrors.lastName)}
              helperText={editFieldErrors.lastName || " "}
              required
              fullWidth
            />
            <TextField
              label="Email"
              value={editEmail}
              onChange={(event) => setEditEmail(event.target.value)}
              error={Boolean(editFieldErrors.email)}
              helperText={editFieldErrors.email || " "}
              required
              fullWidth
            />
            <FormControl error={Boolean(editFieldErrors.status)}>
              <FormLabel id="edit-user-status-label">Status</FormLabel>
              <RadioGroup
                row
                aria-labelledby="edit-user-status-label"
                name="edit-user-status"
                value={editStatus}
                onChange={(event) => setEditStatus(event.target.value)}
              >
                <FormControlLabel value="active" control={<Radio />} label="Active" />
                <FormControlLabel value="inactive" control={<Radio />} label="Inactive" />
              </RadioGroup>
              {editFieldErrors.status ? (
                <Typography variant="caption" color="error">
                  {editFieldErrors.status}
                </Typography>
              ) : null}
            </FormControl>
            <Typography variant="body2" color="text.secondary">
              Admin access is read-only here. Use Admin Access to change role permissions.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeEditModal()} disabled={editSubmitting}>
            Cancel
          </Button>
          <Button variant="contained" onClick={submitEditUser} disabled={editSubmitting}>
            {editSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={statusConfirmOpen} onClose={() => setStatusConfirmOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {String(editStatus).toLowerCase() === "inactive"
              ? "Deactivate this user account?"
              : "Activate this user account?"}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusConfirmOpen(false)} disabled={editSubmitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (pendingEditPayload) {
                doSubmitEdit(pendingEditPayload);
              }
            }}
            disabled={editSubmitting}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export default AdminUsersPage;
