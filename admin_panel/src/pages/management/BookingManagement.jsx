import { useState, useEffect } from 'react';
import useSWR from 'swr';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  Stack,
  Button,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { CloseCircleOutlined, CheckCircleOutlined, FilterOutlined } from '@ant-design/icons';
import { mutate } from 'swr';
import Toast from 'react-hot-toast';

// project imports
import MainCard from 'components/MainCard';
import { useAdminAuth } from 'contexts/AdminAuthContext';

const fetcher = (url) => fetch(url).then((res) => res.json());

const getStatusColor = (status) => {
  switch (status) {
    case 'CONFIRMED':
    case 'SUCCESS':
    case 'PAID':
      return 'success';
    case 'PENDING':
    case 'CANCEL_REQUESTED':
      return 'warning';
    case 'CANCELLED':
      return 'error';
    default:
      return 'default';
  }
};

export default function BookingManagement() {
  const { admin } = useAdminAuth();
  const [filter, setFilter] = useState('ALL'); // ALL, TODAY, REQUESTED
  
  const { data: bookings, error, isLoading } = useSWR(
    `${import.meta.env.VITE_APP_API_URL}/bookings`,
    fetcher,
    { refreshInterval: 5000 } // Poll every 5 seconds for notifications
  );

  // Notification logic for cancellation requests
  useEffect(() => {
    if (bookings) {
      const pendingRequests = bookings.filter(b => b.status === 'CANCEL_REQUESTED');
      if (pendingRequests.length > 0) {
        // Find if there's a new one (simulated by checking recent list)
        // For simplicity, we just remind the user
        const lastRequest = pendingRequests[0];
        // We could use a Ref to track shown notifications if needed
      }
    }
  }, [bookings]);

  const handleCancel = async (bookingId, isFinal = false) => {
    const message = isFinal 
        ? 'Confirm cancellation and process refund to user wallet?' 
        : 'Are you sure you want to cancel this booking?';
    
    if (!window.confirm(message)) return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: isFinal ? 'Cancellation Request Approved' : 'Cancelled by Admin' })
      });
      if (!res.ok) throw new Error('Failed to cancel');
      Toast.success(isFinal ? 'Cancellation Approved & Refunded' : 'Booking Cancelled');
      mutate(`${import.meta.env.VITE_APP_API_URL}/bookings`);
    } catch (err) {
      Toast.error(err.message);
    }
  };

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  if (isLoading && !bookings) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error">Failed to load bookings</Typography>;

  const filteredBookings = bookings?.filter((b) => {
    // Role filter
    if (admin?.role !== 'SUPER_ADMIN' && b.turfId !== admin?.turfId) return false;

    // Status/Date filter
    if (filter === 'REQUESTED') return b.status === 'CANCEL_REQUESTED';
    
    if (filter === 'TODAY') {
        const today = new Date().toLocaleDateString();
        const bookingDate = b.slot ? new Date(b.slot.date).toLocaleDateString() : 'N/A';
        return bookingDate === today;
    }

    return true;
  });

  return (
    <MainCard 
        title={admin?.role === 'SUPER_ADMIN' ? "All Bookings" : `Bookings for ${admin?.turfName}`}
        secondary={
            <ToggleButtonGroup
                value={filter}
                exclusive
                onChange={handleFilterChange}
                size="small"
                color="primary"
            >
                <ToggleButton value="ALL">All</ToggleButton>
                <ToggleButton value="TODAY">Today</ToggleButton>
                <ToggleButton value="REQUESTED">
                    Requests 
                    {bookings?.filter(b => b.status === 'CANCEL_REQUESTED').length > 0 && (
                        <Chip 
                            label={bookings.filter(b => b.status === 'CANCEL_REQUESTED').length} 
                            color="error" 
                            size="small" 
                            sx={{ ml: 1, height: 20 }}
                        />
                    )}
                </ToggleButton>
            </ToggleButtonGroup>
        }
    >
      <TableContainer component={Paper} elevation={0}>
        <Table sx={{ minWidth: 650 }} aria-label="bookings table">
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Turf</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Slot</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBookings?.map((row) => (
              <TableRow key={row.id} sx={row.status === 'CANCEL_REQUESTED' ? { bgcolor: '#fffbe6' } : {}}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.user?.name || 'Unknown'}</Typography>
                  <Typography variant="caption" color="textSecondary">{row.user?.email}</Typography>
                </TableCell>
                <TableCell>{row.turf?.name || 'N/A'}</TableCell>
                <TableCell>{row.slot ? new Date(row.slot.date).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell>{row.slot?.startTime || 'N/A'}</TableCell>
                <TableCell>₹{row.amount}</TableCell>
                <TableCell>
                  <Chip 
                    label={row.status === 'CANCEL_REQUESTED' ? 'REVIEW REQUIRED' : row.status} 
                    color={getStatusColor(row.status)} 
                    size="small" 
                    variant={row.status === 'CANCEL_REQUESTED' ? 'filled' : 'outlined'} 
                  />
                </TableCell>
                <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {row.status === 'CANCEL_REQUESTED' && (
                            <Tooltip title="Approve Cancellation & Refund">
                                <IconButton color="success" size="small" onClick={() => handleCancel(row.id, true)}>
                                    <CheckCircleOutlined />
                                </IconButton>
                            </Tooltip>
                        )}
                        {row.status !== 'CANCELLED' && (
                            <Tooltip title={row.status === 'CANCEL_REQUESTED' ? "Reject & Cancel anyway" : "Cancel Booking"}>
                                <IconButton color="error" size="small" onClick={() => handleCancel(row.id)}>
                                    <CloseCircleOutlined />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Stack>
                </TableCell>
              </TableRow>
            ))}
            {filteredBookings?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography color="textSecondary">No bookings found for the selected filter.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </MainCard>
  );
}
