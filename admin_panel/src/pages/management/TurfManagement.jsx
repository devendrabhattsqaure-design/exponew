import { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Stack,
  IconButton,
  Tooltip,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

// project imports
import MainCard from 'components/MainCard';
import { useAdminAuth } from 'contexts/AdminAuthContext';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function TurfManagement() {
  const { admin } = useAdminAuth();
  const navigate = useNavigate();
  const { data: turfs, error, isLoading } = useSWR(
    `${import.meta.env.VITE_APP_API_URL}/turfs`,
    fetcher
  );

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    location: '', 
    city: '', 
    state: 'State', 
    pricePerHour: 800,
    description: '',
    category: 'Football'
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/turfs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to create turf');
      mutate(`${import.meta.env.VITE_APP_API_URL}/turfs`);
      handleClose();
    } catch (err) {
      alert(err.message);
    }
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

  return (
    <MainCard
      title="Manage Turfs"
      secondary={
        admin?.role === 'SUPER_ADMIN' && (
          <Button variant="contained" startIcon={<PlusOutlined />} size="small" onClick={handleOpen}>
            Add New Turf
          </Button>
        )
      }
    >
      <TableContainer component={Paper} elevation={0}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Price/hr</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {turfs?.filter(t => admin.role === 'SUPER_ADMIN' || t.id === admin.turfId).map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.location}</TableCell>
                <TableCell>₹{row.pricePerHour}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title="Manage Slots">
                      <IconButton size="small" color="secondary" onClick={() => navigate(`/manage/turfs/${row.id}/slots`)}>
                        <CalendarOutlined />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" color="primary">
                        <EditOutlined />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Add New Turf</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Turf Name" fullWidth value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            <TextField label="Location" fullWidth value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
            <TextField label="City" fullWidth value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
            <TextField label="Price Per Hour" type="number" fullWidth value={formData.pricePerHour} onChange={(e) => setFormData({...formData, pricePerHour: parseInt(e.target.value)})} />
            <TextField label="Description" multiline rows={3} fullWidth value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>Create</Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
