import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  StyleSheet, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, CreditCard, History, User, ChevronRight, LogOut, Award } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import PremiumCard from '../components/PremiumCard';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { user, signOut } = useAuth();

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

        {/* Settings Menu */}
        <Text style={styles.sectionTitle}>Account Settings</Text>
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
  }
});

export default ProfileScreen;
