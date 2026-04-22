import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { BlurView } from 'expo-blur';
import { ArrowLeft, Star, MapPin, Clock, Wifi, ShieldCheck, Coffee } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import RazorpayCheckout from 'react-native-razorpay';
import { NativeModules } from 'react-native';
import Constants from 'expo-constants';
import { useAuth } from '../context/AuthContext';
import PremiumButton from '../components/PremiumButton';

const VERSION = "P-2.2-SAFE"; // Nuclear Fix Version Tag

const BACKEND_URL = 'http://192.168.18.23:5000/api';

const TurfDetailScreen = ({ route, navigation }) => {
  // Grab the dynamic turf passed from HomeScreen
  const { turf } = route.params || {};

  const scrollY = useRef(new Animated.Value(0)).current;
  const [showPayment, setShowPayment] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);

  const { user } = useAuth();

  // Header opacity animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [200, 300],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Fetch dynamic slots
  useEffect(() => {
    const fetchSlots = async () => {
      if (!turf?.id) return;
      try {
        setLoadingSlots(true);
        const res = await fetch(`${BACKEND_URL}/turfs/${turf.id}/slots?date=${selectedDate}`);
        const data = await res.json();
        setAvailableSlots(data);
        if (data.length > 0) setSelectedTimeSlot(data[0].startTime);
      } catch (e) {
        console.log('Error fetching slots', e);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [turf?.id, selectedDate]);

  const handleBooking = async () => {
    if (!turf || !selectedTimeSlot) {
      Toast.show({ type: 'info', text1: 'Selection Required', text2: 'Please select a time slot first.' });
      return;
    }

    try {
      setLoadingSlots(true);
      const selectedSlotObj = availableSlots.find(s => s.startTime === selectedTimeSlot);
      const bookingAmount = selectedSlotObj ? selectedSlotObj.price : (turf?.pricePerHour || 3500);

      // 1. Create Order on Backend
      const orderRes = await fetch(`${BACKEND_URL}/bookings/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: bookingAmount })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to initialize payment');

      // 2. Open Razorpay Checkout
      const options = {
        description: `Booking for ${turf.name}`,
        image: turf.imageUrl || 'https://i.imgur.com/3g7nmJC.png',
        currency: 'INR',
        key: 'rzp_live_SRnIHqpELg4O62',
        amount: orderData.amount,
        name: 'Turf Score',
        order_id: orderData.id,
        prefill: {
          email: user?.email || '',
          contact: '',
          name: user?.name || ''
        },
        theme: { color: Colors.primary }
      };

      // 2. Nuclear Environment Detection
      const nativeBridge = NativeModules.RazorpayCheckout;
      
      // Determine if we should force simulation mode
      // We force simulation if the native bridge is missing OR if we're clearly in Expo Go
      const isExpoGo = Constants?.appOwnership === 'expo' || Constants?.expoVersion;
      const isNativeFunctional = nativeBridge && typeof nativeBridge.open === 'function';
      
      const shouldSimulate = isExpoGo || !isNativeFunctional;

      console.log(`RZP Debug [${VERSION}]:`, { 
        isExpoGo,
        nativeBridgeExists: !!nativeBridge, 
        isNativeFunctional,
        finalDecision: shouldSimulate ? 'SIMULATE' : 'NATIVE'
      });

      if (shouldSimulate) {
        if (__DEV__) {
          Alert.alert(
            `Simulation Mode (${VERSION})`,
            'Native Razorpay is unavailable in Expo Go. Simulate success to test the celebration flow?',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Simulate Success', 
                onPress: () => {
                  const mockData = {
                    razorpay_payment_id: 'pay_mock_' + Math.random().toString(36).substr(2, 9),
                    razorpay_order_id: orderData.id,
                    razorpay_signature: 'mock_signature'
                  };
                  handlePaymentSuccess(mockData, bookingAmount);
                }
              }
            ]
          );
        } else {
          Alert.alert('Production Error', 'Payment bridge missing. Please contact support.');
        }
        return;
      }

      // 3. Native Execution Path (only for standalone/dev clients)
      try {
        const rzp = RazorpayCheckout || nativeBridge;
        rzp.open(options)
          .then((data) => {
            handlePaymentSuccess(data, bookingAmount);
          })
          .catch((error) => {
            console.error('Razorpay Error:', error);
            if (error.code !== 2) { 
               Alert.alert(`Error: ${error.code}`, error.description);
            }
          });
      } catch (err) {
        console.error('Razorpay Critical Fail:', err);
        Alert.alert('Payment Error', 'Native bridge call failed unexpectedly.');
      }

    } catch (error) {
      console.error(error);
      Alert.alert('Payment Error', error.message);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handlePaymentSuccess = async (paymentData, amount) => {
    try {
      const response = await fetch(`${BACKEND_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          turfId: turf?.id,
          bookingDate: selectedDate,
          timeSlot: selectedTimeSlot,
          amount: amount,
          razorpayOrderId: paymentData.razorpay_order_id,
          razorpayPaymentId: paymentData.razorpay_payment_id,
          razorpaySignature: paymentData.razorpay_signature,
          paymentMethod: 'razorpay'
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save booking');
      }
      navigation.navigate('BookingSuccess', { booking: result });
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: 'Sync Error', text2: error.message });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Sticky Top Header */}
      <Animated.View style={[styles.stickyHeader, { opacity: headerOpacity }]}>
        <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.stickyHeaderContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.stickyBack}
          >
            <ArrowLeft size={24} color={Colors.onBackground} />
          </TouchableOpacity>
          <Text style={styles.stickyTitle}>{turf?.name || 'Loading...'}</Text>
          <View style={{ width: 48 }} />
        </View>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >

        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: turf?.imageUrl || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1000&auto=format&fit=crop' }}
            style={styles.image}
          />
          <TouchableOpacity
            style={styles.floatingBack}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.headerInfo}>
            <View>
              <Text style={styles.title}>{turf?.name || 'Loading...'}</Text>
              <Text style={{ fontSize: 10, color: '#ccc', letterSpacing: 1 }}>VER: {VERSION}</Text>
              <View style={styles.locationContainer}>
                <MapPin size={16} color={Colors.onSurfaceVariant} />
                <Text style={styles.locationText}>{turf?.location || 'Unknown Location'}</Text>
              </View>
            </View>
            <View style={styles.ratingBox}>
              <Star size={16} color="#FFD700" fill="#FFD700" />
              <Text style={styles.ratingText}>{turf?.rating || 4.5}</Text>
              <Text style={styles.reviewCount}>(128)</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>About the Turf</Text>
          <Text style={styles.description}>
            {turf?.description || 'Experience play on our world-class FIFA-pro synthetic grass. Perfect for high-intensity matches.'}
          </Text>

          <Text style={styles.sectionTitle}>World Class Amenities</Text>
          <View style={styles.amenities}>
            {turf?.amenities?.map((item, i) => (
              <View key={i} style={styles.amenityItem}>
                <View style={styles.amenityIcon}>
                  {item === 'Wifi' && <Wifi size={20} color={Colors.primaryContainer} />}
                  {item === 'Shower' && <Clock size={20} color={Colors.primaryContainer} />}
                  {item === 'Cafeteria' && <Coffee size={20} color={Colors.primaryContainer} />}
                  {item === 'Parking' && <ShieldCheck size={20} color={Colors.primaryContainer} />}
                  {item === 'Floodlights' && <Coffee size={20} color={Colors.primaryContainer} />}
                  {item === 'Beverages' && <Coffee size={20} color={Colors.primaryContainer} />}
                  {item === 'Locker Room' && <ShieldCheck size={20} color={Colors.primaryContainer} />}
                  {item === 'Equipment Rental' && <Clock size={20} color={Colors.primaryContainer} />}
                </View>
                <Text style={styles.amenityLabel}>{item}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Select Slot</Text>
          <View style={styles.dateSelector}>
            <Text style={styles.month}>{new Date(selectedDate).toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
                const d = new Date();
                d.setDate(d.getDate() + offset);
                const isSelected = d.toISOString().split('T')[0] === selectedDate;
                return (
                  <TouchableOpacity
                    key={offset}
                    style={[styles.dateCard, isSelected && styles.activeDate]}
                    onPress={() => setSelectedDate(d.toISOString().split('T')[0])}
                  >
                    <Text style={[styles.dayName, isSelected && styles.activeText]}>
                      {d.toLocaleString('default', { weekday: 'short' })}
                    </Text>
                    <Text style={[styles.dayNum, isSelected && styles.activeText]}>
                      {d.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {loadingSlots ? (
            <ActivityIndicator color={Colors.primary} style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.timeSlots}>
              {availableSlots.length > 0 ? (
                availableSlots.map((slot, i) => {
                  const isSelected = selectedTimeSlot === slot.startTime;
                  return (
                    <TouchableOpacity
                      key={slot.id}
                      style={[styles.timeChip, isSelected && styles.activeTimeChip]}
                      onPress={() => setSelectedTimeSlot(slot.startTime)}
                    >
                      <Text style={[styles.timeText, isSelected && styles.activeText]}>
                        {slot.startTime}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <Text style={styles.noSlotsText}>No slots available for this date.</Text>
              )}
            </View>
          )}
        </View>
      </Animated.ScrollView>

      {/* Fixed Bottom Booking */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={styles.priceValue}>₹{turf?.pricePerHour || 3500}/hr</Text>
        </View>
        <PremiumButton
          title="Proceed to Pay"
          onPress={handleBooking}
          style={styles.bookButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 10,
    justifyContent: 'flex-end',
    paddingBottom: 12,
  },
  stickyHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  stickyBack: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  imageContainer: {
    height: 400,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  floatingBack: {
    position: 'absolute',
    top: 60,
    left: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -40,
    padding: 24,
    paddingBottom: 150,
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    color: Colors.onSurfaceVariant,
    marginLeft: 4,
    fontSize: 14,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  ratingText: {
    marginLeft: 6,
    fontWeight: '700',
    fontSize: 16,
    color: Colors.onBackground,
  },
  reviewCount: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.surfaceContainer,
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.onBackground,
    marginBottom: 12,
    marginTop: 8,
  },
  description: {
    fontSize: 15,
    color: Colors.onSurfaceVariant,
    lineHeight: 24,
    marginBottom: 24,
  },
  amenities: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  amenityItem: {
    alignItems: 'center',
  },
  amenityIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  amenityLabel: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
  },
  dateSelector: {
    marginBottom: 16,
  },
  month: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onBackground,
    marginBottom: 12,
  },
  dateCard: {
    width: 64,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activeDate: {
    backgroundColor: Colors.primary,
  },
  dayName: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginBottom: 4,
  },
  dayNum: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  activeText: {
    color: '#ffffff',
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.surfaceContainerLow,
  },
  activeTimeChip: {
    backgroundColor: Colors.primary,
  },
  timeText: {
    fontWeight: '700',
    color: Colors.onBackground,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: 24,
    paddingBottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainer,
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  bookButton: {
    width: 200,
  },
  noSlotsText: {
    color: Colors.onSurfaceVariant,
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 10,
  }
});

export default TurfDetailScreen;
