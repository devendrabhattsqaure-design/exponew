import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  StyleSheet, 
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, CreditCard, History, User, ChevronRight, LogOut, Award, Calendar } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import PremiumCard from '../components/PremiumCard';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = 'http://192.168.18.23:5000/api';

const ProfileScreen = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchUserBookings();
    }
  }, [user]);

  const fetchUserBookings = async () => {
    try {
      // Use user.id which in our backend matches the database UUID based on the Auth sync
      const response = await fetch(`${BACKEND_URL}/bookings/user/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              navigation.replace('Login');
            } catch (error) {
              Alert.alert('Error', 'Failed to log out');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image 
              source={require('../assets/avatar.png')} 
              style={styles.avatar} 
            />
            <View style={styles.editBadge}>
              <Award size={14} color="#ffffff" fill={Colors.primaryContainer} />
            </View>
          </View>
          <Text style={styles.userName}>{user?.user_metadata?.full_name || 'Premium Player'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'player@turfscore.com'}</Text>
          <View style={styles.tagContainer}>
            <View style={styles.proTag}>
              <Text style={styles.proTagText}>PRO MEMBER</Text>
            </View>
          </View>
        </View>

        {/* User Stats Card */}
        <PremiumCard style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>4.9</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12.5k</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
        </PremiumCard>

        {/* Recent Bookings Section */}
        <Text style={styles.sectionTitle}>Recent Bookings</Text>
        {loadingBookings ? (
          <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 20 }} />
        ) : bookings.length > 0 ? (
          bookings.slice(0, 3).map((booking, index) => (
            <PremiumCard key={index} style={styles.bookingCard} level="low">
              <View style={styles.bookingRow}>
                <View style={styles.bookingIcon}>
                  <Calendar size={20} color={Colors.primary} />
                </View>
                <View style={styles.bookingDetails}>
                  <Text style={styles.bookingTurf}>{booking.turf?.name || 'Turf Arena'}</Text>
                  <Text style={styles.bookingTime}>{new Date(booking.bookingDate).toLocaleDateString()} • {booking.timeSlot}</Text>
                </View>
                <View style={styles.bookingStatus}>
                  <Text style={styles.bookingAmount}>₹{booking.amount}</Text>
                  <Text style={styles.statusText}>{booking.status}</Text>
                </View>
              </View>
            </PremiumCard>
          ))
        ) : (
          <Text style={styles.noBookingsText}>No bookings yet. Time to play!</Text>
        )}

        {/* Settings Menu */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Account Settings</Text>
        <PremiumCard style={styles.menuContainer} level="low">
          {[
            { icon: User, label: 'Personal Information', color: '#4F46E5' },
            { icon: History, label: 'Booking History', color: '#10B981' },
            { icon: CreditCard, label: 'Payment Methods', color: '#F59E0B' },
            { icon: Settings, label: 'Preferences', color: '#6B7280' },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={[styles.menuItem, i === 3 && styles.noBorder]}>
              <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                <item.icon size={20} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <ChevronRight size={20} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
          ))}
        </PremiumCard>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  editBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
  },
  tagContainer: {
    marginTop: 12,
  },
  proTag: {
    backgroundColor: Colors.primaryContainer + '20',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  proTagText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 24,
    justifyContent: 'space-between',
    padding: 20,
    marginBottom: 32,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: Colors.surfaceContainer,
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onBackground,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  menuContainer: {
    marginHorizontal: 24,
    padding: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainer,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.onBackground,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    padding: 16,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  bookingCard: {
    marginHorizontal: 24,
    marginBottom: 12,
    padding: 16,
  },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.primaryContainer + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  bookingDetails: {
    flex: 1,
  },
  bookingTurf: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onBackground,
    marginBottom: 4,
  },
  bookingTime: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  bookingStatus: {
    alignItems: 'flex-end',
  },
  bookingAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.onBackground,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  noBookingsText: {
    marginHorizontal: 24,
    color: Colors.onSurfaceVariant,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  }
});

export default ProfileScreen;
