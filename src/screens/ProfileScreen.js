import React, { useState, useEffect, useCallback, memo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  StyleSheet, 
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  User, ChevronRight, LogOut, Award, Calendar, 
  Edit3, Save, X, Phone, Mail, Clock, 
  CheckCircle, XCircle, ChevronDown, MapPin
} from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import PremiumCard from '../components/PremiumCard';
import { useAuth } from '../context/AuthContext';
import Toast from 'react-native-toast-message';

const BACKEND_URL = 'http://192.168.18.23:5000/api';

// ─── Booking Card (memoized) ───────────────────────────────
const BookingCard = memo(({ booking }) => {
  const date = new Date(booking.bookingDate);
  const formattedDate = date.toLocaleDateString('en-IN', { 
    day: 'numeric', month: 'short', year: 'numeric' 
  });
  
  const statusColors = {
    PAID: { bg: '#10B98120', text: '#10B981' },
    CONFIRMED: { bg: '#10B98120', text: '#10B981' },
    CANCELLED: { bg: '#EF444420', text: '#EF4444' },
    PENDING: { bg: '#F59E0B20', text: '#F59E0B' },
  };
  
  const statusStyle = statusColors[booking.status] || statusColors.PAID;
  
  return (
    <PremiumCard style={styles.bookingCard} level="low">
      <View style={styles.bookingRow}>
        <View style={styles.bookingIcon}>
          <Calendar size={20} color={Colors.primary} />
        </View>
        <View style={styles.bookingDetails}>
          <Text style={styles.bookingTurf}>{booking.turf?.name || 'Turf Arena'}</Text>
          {booking.turf?.location ? (
            <View style={styles.bookingLocationRow}>
              <MapPin size={11} color={Colors.onSurfaceVariant} />
              <Text style={styles.bookingLocationText}>{booking.turf.location}</Text>
            </View>
          ) : null}
          <Text style={styles.bookingTime}>{formattedDate} • {booking.timeSlot}</Text>
        </View>
        <View style={styles.bookingStatus}>
          <Text style={styles.bookingAmount}>₹{booking.amount}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{booking.status}</Text>
          </View>
        </View>
      </View>
    </PremiumCard>
  );
});

// ─── Personal Info Section ──────────────────────────────────
const PersonalInfoSection = memo(({ user, onSave, saving }) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Sync local state when user prop changes (e.g. after save/refresh)
  useEffect(() => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
  }, [user?.name, user?.phone]);

  const handleSave = useCallback(async () => {
    try {
      await onSave({ name: name.trim(), phone: phone.trim() });
      setEditing(false);
      Toast.show({ type: 'success', text1: 'Profile Updated', text2: 'Your changes have been saved' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Update Failed', text2: err.message || 'Failed to update profile' });
    }
  }, [name, phone, onSave]);

  const handleCancel = useCallback(() => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setEditing(false);
  }, [user]);

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : 'N/A';

  return (
    <View style={styles.sectionContainer}>
      {/* Section Header with Edit toggle */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        {!editing ? (
          <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
            <Edit3 size={16} color={Colors.primary} />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <X size={16} color="#EF4444" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveBtn} 
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size={14} color="#fff" />
              ) : (
                <Save size={16} color="#fff" />
              )}
              <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <PremiumCard style={styles.infoCard} level="low">
        {/* Name Field */}
        <View style={styles.infoRow}>
          <View style={[styles.infoIcon, { backgroundColor: '#4F46E520' }]}>
            <User size={18} color="#4F46E5" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Full Name</Text>
            {editing ? (
              <TextInput
                style={styles.infoInput}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={Colors.onSurfaceVariant + '60'}
              />
            ) : (
              <Text style={styles.infoValue}>{user?.name || 'Not set'}</Text>
            )}
          </View>
        </View>

        <View style={styles.infoDivider} />

        {/* Email Field (read-only) */}
        <View style={styles.infoRow}>
          <View style={[styles.infoIcon, { backgroundColor: '#10B98120' }]}>
            <Mail size={18} color="#10B981" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email || 'Not set'}</Text>
          </View>
          {!editing && (
            <View style={styles.verifiedBadge}>
              <CheckCircle size={14} color="#10B981" />
            </View>
          )}
        </View>

        <View style={styles.infoDivider} />

        {/* Phone Field */}
        <View style={styles.infoRow}>
          <View style={[styles.infoIcon, { backgroundColor: '#F59E0B20' }]}>
            <Phone size={18} color="#F59E0B" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Phone</Text>
            {editing ? (
              <TextInput
                style={styles.infoInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter phone number"
                placeholderTextColor={Colors.onSurfaceVariant + '60'}
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={[styles.infoValue, !user?.phone && styles.notSet]}>
                {user?.phone || 'Not set'}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.infoDivider} />

        {/* Member Since (read-only) */}
        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
          <View style={[styles.infoIcon, { backgroundColor: '#6B728020' }]}>
            <Clock size={18} color="#6B7280" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>{memberSince}</Text>
          </View>
        </View>
      </PremiumCard>
    </View>
  );
});

// ─── Booking History Section ────────────────────────────────
const BookingHistorySection = memo(({ bookings, loading }) => {
  if (loading) {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Booking History</Text>
        <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 40 }} />
      </View>
    );
  }

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Booking History</Text>
        <Text style={styles.bookingCount}>{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</Text>
      </View>

      {bookings.length > 0 ? (
        bookings.map((booking) => (
          <BookingCard key={booking.id} booking={booking} />
        ))
      ) : (
        <PremiumCard style={styles.emptyCard} level="low">
          <Calendar size={40} color={Colors.onSurfaceVariant + '40'} />
          <Text style={styles.emptyTitle}>No Bookings Yet</Text>
          <Text style={styles.emptySubtitle}>Your booking history will appear here once you book a turf.</Text>
        </PremiumCard>
      )}
    </View>
  );
});

// ─── Main Profile Screen ────────────────────────────────────
const ProfileScreen = ({ navigation }) => {
  const { user, signOut, refreshUser, updateUser, token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'bookings'
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasFetchedBookings, setHasFetchedBookings] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    if (token) {
      refreshUser();
    }
  }, []);

  // Fetch bookings only when bookings tab is activated and not yet fetched
  useEffect(() => {
    if (activeTab === 'bookings' && !hasFetchedBookings && user?.id) {
      fetchUserBookings();
    }
  }, [activeTab, hasFetchedBookings, user?.id]);

  const fetchUserBookings = useCallback(async () => {
    try {
      setLoadingBookings(true);
      const response = await fetch(`${BACKEND_URL}/bookings/user/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
        setHasFetchedBookings(true);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  }, [user?.id]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshUser();
      if (activeTab === 'bookings') {
        setHasFetchedBookings(false); // Force re-fetch on next render
      }
    } finally {
      setRefreshing(false);
    }
  }, [refreshUser, activeTab]);

  const handleSaveProfile = useCallback(async (updates) => {
    setSaving(true);
    try {
      await updateUser(updates);
    } finally {
      setSaving(false);
    }
  }, [updateUser]);

  const handleLogout = useCallback(async () => {
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
              Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to log out' });
            }
          }
        }
      ]
    );
  }, [signOut, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        
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
          <Text style={styles.userName}>{user?.name || 'Player'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'player@turfscore.com'}</Text>
          <View style={styles.tagContainer}>
            <View style={styles.proTag}>
              <Text style={styles.proTagText}>PRO MEMBER</Text>
            </View>
          </View>
        </View>

        {/* User Stats Card (Dynamic) */}
        <PremiumCard style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.matchesPlayed ?? 0}</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.rating?.toFixed(1) ?? '5.0'}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.xp ?? 0}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
        </PremiumCard>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'info' && styles.activeTab]}
            onPress={() => setActiveTab('info')}
          >
            <User size={16} color={activeTab === 'info' ? Colors.primary : Colors.onSurfaceVariant} />
            <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>Personal Info</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'bookings' && styles.activeTab]}
            onPress={() => setActiveTab('bookings')}
          >
            <Calendar size={16} color={activeTab === 'bookings' ? Colors.primary : Colors.onSurfaceVariant} />
            <Text style={[styles.tabText, activeTab === 'bookings' && styles.activeTabText]}>Booking History</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'info' ? (
          <PersonalInfoSection user={user} onSave={handleSaveProfile} saving={saving} />
        ) : (
          <BookingHistorySection bookings={bookings} loading={loadingBookings} />
        )}

        {/* Logout Button */}
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
  // ── Header ──
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
  // ── Stats ──
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 24,
    justifyContent: 'space-between',
    padding: 20,
    marginBottom: 24,
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
  // ── Tabs ──
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
  },
  activeTabText: {
    color: Colors.primary,
  },
  // ── Section ──
  sectionContainer: {
    paddingHorizontal: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  // ── Edit Actions ──
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.primary + '15',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cancelBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#EF444415',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  // ── Personal Info Card ──
  infoCard: {
    padding: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  notSet: {
    color: Colors.onSurfaceVariant + '80',
    fontStyle: 'italic',
  },
  infoInput: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.onBackground,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  infoDivider: {
    height: 1,
    backgroundColor: Colors.surfaceContainer,
    marginHorizontal: 16,
  },
  verifiedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B98115',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ── Booking History ──
  bookingCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  bookingCard: {
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
    marginBottom: 2,
  },
  bookingLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  bookingLocationText: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
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
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  // ── Empty State ──
  emptyCard: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onBackground,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  // ── Logout ──
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
});

export default memo(ProfileScreen);
