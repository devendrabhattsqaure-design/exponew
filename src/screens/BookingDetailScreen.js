import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  Info,
  XCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import PremiumCard from '../components/PremiumCard';
import Toast from 'react-native-toast-message';

const BACKEND_URL = 'http://192.168.18.23:5000/api';

const BookingDetailScreen = ({ route, navigation }) => {
  const { booking } = route.params;
  const [loading, setLoading] = useState(false);

  const date = new Date(booking.bookingDate || booking.createdAt);
  const formattedDate = date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const getStatusConfig = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return { color: '#10B981', icon: <CheckCircle2 size={24} color="#10B981" />, label: 'Confirmed' };
      case 'CANCEL_REQUESTED':
        return { color: '#F59E0B', icon: <AlertCircle size={24} color="#F59E0B" />, label: 'Cancellation Under Review' };
      case 'CANCELLED':
        return { color: '#EF4444', icon: <XCircle size={24} color="#EF4444" />, label: 'Cancelled' };
      default:
        return { color: Colors.primary, icon: <Info size={24} color={Colors.primary} />, label: status };
    }
  };

  const statusConfig = getStatusConfig(booking.status);

  const handleRequestCancellation = () => {
    Alert.alert(
      'Request Cancellation',
      'Are you sure you want to request cancellation? Our team will review your request. If approved, the refund will be credited to your wallet.',
      [
        { text: 'Back', style: 'cancel' },
        {
          text: 'Request',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await fetch(`${BACKEND_URL}/bookings/${booking.id}/request-cancellation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: 'User requested cancellation via App' })
              });

              if (response.ok) {
                Toast.show({
                  type: 'success',
                  text1: 'Request Submitted',
                  text2: 'Admin will review your request shortly.'
                });
                navigation.goBack();
              } else {
                const data = await response.json();
                throw new Error(data.error || 'Failed to request cancellation');
              }
            } catch (error) {
              Alert.alert('Error', error.message);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.onBackground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Status Section */}
        <View style={styles.statusSection}>
          <View style={[styles.statusIconContainer, { backgroundColor: statusConfig.color + '15' }]}>
            {statusConfig.icon}
          </View>
          <Text style={[styles.statusLabel, { color: statusConfig.color }]}>{statusConfig.label}</Text>
          <Text style={styles.bookingId}>Booking ID: #{booking.id.substring(0, 8).toUpperCase()}</Text>
        </View>

        {/* Turf Info Card */}
        <PremiumCard style={styles.card}>
          <Text style={styles.sectionTitle}>Turf Information</Text>
          <View style={styles.turfRow}>
            <Image 
              source={booking.turf?.images?.[0] ? { uri: booking.turf.images[0] } : require('../assets/avatar.png')} 
              style={styles.turfImage} 
            />
            <View style={styles.turfDetails}>
              <Text style={styles.turfName}>{booking.turf?.name || 'Turf Arena'}</Text>
              <View style={styles.locationRow}>
                <MapPin size={14} color={Colors.onSurfaceVariant} />
                <Text style={styles.locationText}>{booking.turf?.location || 'Location not available'}</Text>
              </View>
            </View>
          </View>
        </PremiumCard>

        {/* Schedule Card */}
        <PremiumCard style={styles.card}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <View style={styles.infoRow}>
            <Calendar size={20} color={Colors.primary} />
            <Text style={styles.infoText}>{formattedDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Clock size={20} color={Colors.primary} />
            <Text style={styles.infoText}>{booking.timeSlot}</Text>
          </View>
        </PremiumCard>

        {/* Payment Card */}
        <PremiumCard style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Booking Amount</Text>
            <Text style={styles.paymentValue}>₹{booking.amount}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Payment Status</Text>
            <Text style={[styles.paymentValue, { color: '#10B981' }]}>PAID</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.paymentRow}>
            <View style={styles.totalLabelRow}>
              <CreditCard size={18} color={Colors.onBackground} />
              <Text style={styles.totalLabel}>Total Paid</Text>
            </View>
            <Text style={styles.totalValue}>₹{booking.amount}</Text>
          </View>
        </PremiumCard>

        {/* Cancellation Info (if applicable) */}
        {booking.status === 'CANCEL_REQUESTED' && (
          <View style={styles.alertBox}>
            <AlertCircle size={20} color="#F59E0B" />
            <Text style={styles.alertText}>
              Your cancellation request is being processed. It may take up to 24 hours for review.
            </Text>
          </View>
        )}

        {/* Cancellation Button */}
        {(booking.status === 'CONFIRMED' || booking.status === 'PAID') && (
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={handleRequestCancellation}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#EF4444" />
            ) : (
              <>
                <XCircle size={20} color="#EF4444" />
                <Text style={styles.cancelButtonText}>Request Cancellation</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainer,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: Colors.surfaceContainerLow,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  statusSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  statusIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  bookingId: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
  },
  card: {
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  turfRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  turfImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
  },
  turfDetails: {
    flex: 1,
  },
  turfName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onBackground,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.onBackground,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 15,
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
  },
  paymentValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.surfaceContainer,
    marginVertical: 12,
  },
  totalLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.primary,
  },
  alertBox: {
    flexDirection: 'row',
    backgroundColor: '#F59E0B10',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B30',
    gap: 12,
    marginBottom: 24,
    alignItems: 'center'
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    color: '#D97706',
    fontWeight: '600',
    lineHeight: 18,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF444410',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EF444430',
    gap: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
  },
});

export default BookingDetailScreen;
