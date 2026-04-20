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
  Stack
} from '@mui/material';
import { CloseCircleOutlined } from '@ant-design/icons';
import { mutate } from 'swr';

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
      return 'warning';
    case 'CANCELLED':
      return 'error';
    default:
      return 'default';
  }
};

export default function BookingManagement() {
  const { admin } = useAdminAuth();
  const { data: bookings, error, isLoading } = useSWR(
    `${import.meta.env.VITE_APP_API_URL}/bookings`,
    fetcher
  );

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Cancelled by Admin' })
      });
      if (!res.ok) throw new Error('Failed to cancel');
      mutate(`${import.meta.env.VITE_APP_API_URL}/bookings`);
    } catch (err) {
      alert(err.message);
    }
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error">Failed to load bookings</Typography>;

  const filteredBookings = bookings?.filter((b) => {
    if (admin?.role === 'SUPER_ADMIN') return true;
    return b.turfId === admin?.turfId;
  });

  return (
    <MainCard title={admin?.role === 'SUPER_ADMIN' ? "All Bookings" : `Bookings for ${admin?.turfName}`}>
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
              <TableRow key={row.id}>
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
                    label={row.status} 
                    color={getStatusColor(row.status)} 
                    size="small" 
                    variant="outlined" 
                  />
                </TableCell>
                <TableCell align="right">
                    {row.status !== 'CANCELLED' && (
                        <Tooltip title="Cancel Booking">
                            <IconButton color="error" size="small" onClick={() => handleCancel(row.id)}>
                                <CloseCircleOutlined />
                            </IconButton>
                        </Tooltip>
                    )}
                </TableCell>
              </TableRow>
            ))}
            {bookings?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">No bookings found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </MainCard>
  );
}
