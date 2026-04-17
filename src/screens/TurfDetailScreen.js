import React, { useRef, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Animated,
  StatusBar,
  Platform
} from 'react-native';
import { BlurView } from 'expo-blur';
import { ArrowLeft, Star, MapPin, Clock, Wifi, ShieldCheck, Coffee } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import PremiumButton from '../components/PremiumButton';
import RazorpayModal from '../components/RazorpayModal';

const TurfDetailScreen = ({ navigation }) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [showPayment, setShowPayment] = useState(false);

  // Header opacity animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [200, 300],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleBooking = () => {
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    navigation.navigate('BookingSuccess');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Razorpay Modal Integration */}
      <RazorpayModal 
        visible={showPayment}
        amount={3500}
        keyId="rzp_test_SRnZ2EKv9ZxBgb"
        onClose={() => setShowPayment(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

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
          <Text style={styles.stickyTitle}>Emerald Arena</Text>
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
            source={require('../assets/detail.png')} 
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
              <Text style={styles.title}>Emerald Arena</Text>
              <View style={styles.locationContainer}>
                <MapPin size={16} color={Colors.onSurfaceVariant} />
                <Text style={styles.locationText}>Downtown District</Text>
              </View>
            </View>
            <View style={styles.ratingBox}>
              <Star size={16} color="#FFD700" fill="#FFD700" />
              <Text style={styles.ratingText}>4.9</Text>
              <Text style={styles.reviewCount}>(128)</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>About the Turf</Text>
          <Text style={styles.description}>
            Experience play on our world-class FIFA-pro synthetic grass. Emerald Arena offers a unique architectural setting with advanced LED floodlighting and climate-controlled resting zones. Perfect for high-intensity 5-a-side matches.
          </Text>

          <Text style={styles.sectionTitle}>World Class Amenities</Text>
          <View style={styles.amenities}>
            {[
              { icon: Wifi, label: 'Free Wi-Fi' },
              { icon: Clock, label: 'Shower' },
              { icon: Coffee, label: 'Cafeteria' },
              { icon: ShieldCheck, label: 'Parking' }
            ].map((item, i) => (
              <View key={i} style={styles.amenityItem}>
                <View style={styles.amenityIcon}>
                  <item.icon size={20} color={Colors.primaryContainer} />
                </View>
                <Text style={styles.amenityLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Select Slot</Text>
          <View style={styles.dateSelector}>
            <Text style={styles.month}>July 2024</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[12, 13, 14, 15, 16, 17].map((day, i) => (
                <TouchableOpacity key={i} style={[styles.dateCard, i === 0 && styles.activeDate]}>
                  <Text style={[styles.dayName, i === 0 && styles.activeText]}>Mon</Text>
                  <Text style={[styles.dayNum, i === 0 && styles.activeText]}>{day}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.timeSlots}>
            {['06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'].map((time, i) => (
              <TouchableOpacity key={i} style={[styles.timeChip, i === 1 && styles.activeTimeChip]}>
                <Text style={[styles.timeText, i === 1 && styles.activeText]}>{time}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.ScrollView>

      {/* Fixed Bottom Booking */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={styles.priceValue}>₹3500/hr</Text>
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
  }
});

export default TurfDetailScreen;
