import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import {
  Grid,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Chip
} from '@mui/material';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

// project imports
import MainCard from 'components/MainCard';
import { useAdminAuth } from 'contexts/AdminAuthContext';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function EmployeeManagement() {
  const { admin } = useAdminAuth();
  const { data: employees, error } = useSWR(
    admin?.turfId ? `${import.meta.env.VITE_APP_API_URL}/admin/employees?turfId=${admin.turfId}` : null,
    fetcher
  );

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [status, setStatus] = useState(null);

  if (admin?.role !== 'TURF_ADMIN' && admin?.role !== 'SUPER_ADMIN') {
    return <Alert severity="error">Access Denied. Only Turf Admins can manage employees.</Alert>;
  }

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setStatus(null);
    setFormData({ name: '', email: '', password: '' });
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/admin/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, turfId: admin.turfId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatus({
        type: 'success',
        message: `Employee created! Default password: ${formData.password || formData.name + '@emp123'}`
      });
      mutate(`${import.meta.env.VITE_APP_API_URL}/admin/employees?turfId=${admin.turfId}`);
      setTimeout(handleClose, 2000);
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/admin/employees/${id}`, {
          method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete');
        mutate(`${import.meta.env.VITE_APP_API_URL}/admin/employees?turfId=${admin.turfId}`);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <Grid >
      <Grid item xs={12}>
        <MainCard
          title="Turf Employees"
          secondary={
            <Button variant="contained" startIcon={<PlusOutlined />} onClick={handleOpen}>
              Add Employee
            </Button>
          }
        >
          <TableContainer component={Paper} elevation={0}>
            <Table >
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees?.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>
                      <Chip label="Employee" color="info" size="small" variant="combined" />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton size="small" color="primary">
                          <EditOutlined />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(emp.id)}>
                          <DeleteOutlined />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {(!employees || employees.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No employees found. Add your first employee now!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </MainCard>
      </Grid>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Add New Employee</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {status && <Alert severity={status.type}>{status.message}</Alert>}
            <TextField
              label="Full Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Email Address"
              fullWidth
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <TextField
              label="Password (Optional)"
              type="password"
              fullWidth
              placeholder="Leave blank for name@emp123"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <Typography variant="caption" color="textSecondary">
              * Employees will have access to manage slots and bookings but cannot see revenue.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!formData.name || !formData.email}>
            Create Employee
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
