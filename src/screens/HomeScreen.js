import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MapPin, Star, Bell, Filter, Trophy, Target, Zap } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import PremiumCard from '../components/PremiumCard';
import PremiumButton from '../components/PremiumButton';
import { useAuth } from '../context/AuthContext';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name || user?.name || user?.email?.split('@')[0] || 'Player';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={24} color={Colors.onBackground} />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image 
            source={require('../assets/hero.png')} 
            style={styles.heroImage} 
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Find your perfect playground.</Text>
            <PremiumButton 
              title="Explore Turfs" 
              onPress={() => {}} 
              style={styles.heroButton}
            />
          </View>
        </View>

        {/* Stats Section / Activity */}
        <PremiumCard style={styles.statsCard} level="lowest">
          <View style={styles.statsHeader}>
            <Trophy size={20} color={Colors.primaryContainer} />
            <Text style={styles.statsTitle}>Monthly Activity</Text>
          </View>
          <Text style={styles.statsValue}>You played 14 hours this month.</Text>
          <Text style={styles.statsSubtitle}>Great progress! You're in the top 5%.</Text>
        </PremiumCard>

        {/* Quick Filters */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
          {[
            { name: 'Football', icon: Trophy },
            { name: 'Padel', icon: Target },
            { name: 'Tennis', icon: Zap },
            { name: 'Cricket', icon: Filter }
          ].map((cat, i) => (
            <TouchableOpacity key={i} style={[styles.categoryChip, i === 0 && styles.activeChip]}>
              <cat.icon size={18} color={i === 0 ? Colors.onPrimary : Colors.onSurfaceVariant} />
              <Text style={[styles.categoryText, i === 0 && styles.activeCategoryText]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recommended Turfs */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended for you</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>

        {/* Turf Card */}
        <TouchableOpacity 
          activeOpacity={0.9} 
          onPress={() => navigation.navigate('TurfDetail')}
        >
          <PremiumCard style={styles.turfCard}>
            <Image 
              source={require('../assets/padel.png')} 
              style={styles.turfImage} 
            />
            <View style={styles.turfInfo}>
              <View style={styles.turfHeader}>
                <Text style={styles.turfName}>Emerald Arena Complex</Text>
                <View style={styles.rating}>
                  <Star size={14} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.ratingText}>4.9</Text>
                </View>
              </View>
              <View style={styles.locationContainer}>
                <MapPin size={14} color={Colors.onSurfaceVariant} />
                <Text style={styles.locationText}>Downtown District • 1.2 km away</Text>
              </View>
            </View>
          </PremiumCard>
        </TouchableOpacity>

        <PremiumCard style={styles.turfCard}>
          <View style={styles.proBanner}>
            <Text style={styles.proTitle}>Pro Membership</Text>
            <Text style={styles.proDesc}>Unlock priority booking and 15% discount on all premium turfs.</Text>
            <PremiumButton title="Upgrade Now" onPress={() => {}} style={{marginTop: 12}} />
          </View>
        </PremiumCard>

      </ScrollView>

      {/* Bottom Navbar removed - handled by App.js Tab Navigator */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
  },
  greeting: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    fontFamily: 'System',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.onBackground,
    marginTop: 4,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContainer: {
    marginHorizontal: 24,
    height: 280,
    borderRadius: 32,
    overflow: 'hidden',
    marginBottom: 24,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    padding: 24,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 16,
    lineHeight: 38,
  },
  heroButton: {
    width: 160,
  },
  statsCard: {
    marginHorizontal: 24,
    backgroundColor: Colors.primary,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsTitle: {
    color: Colors.onPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsValue: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statsSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 24,
    marginTop: 32,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  viewAll: {
    color: Colors.primaryContainer,
    fontWeight: '600',
    fontSize: 14,
  },
  categories: {
    paddingLeft: 24,
    marginBottom: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 50,
    marginRight: 12,
  },
  activeChip: {
    backgroundColor: Colors.primary,
  },
  categoryText: {
    marginLeft: 8,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  activeCategoryText: {
    color: Colors.onPrimary,
  },
  turfCard: {
    marginHorizontal: 24,
    padding: 0,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  turfImage: {
    width: '100%',
    height: 200,
  },
  turfInfo: {
    padding: 20,
  },
  turfHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  turfName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    marginLeft: 4,
    fontWeight: '700',
    fontSize: 12,
    color: Colors.onBackground,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  locationText: {
    color: Colors.onSurfaceVariant,
    fontSize: 13,
    marginLeft: 4,
  },
  proBanner: {
    padding: 24,
    backgroundColor: Colors.surfaceContainerLow,
  },
  proTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  proDesc: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginTop: 8,
    lineHeight: 20,
  },
  navText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    color: Colors.onSurfaceVariant,
  }
});

export default HomeScreen;
