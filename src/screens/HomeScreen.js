import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { 
  View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, 
  StatusBar, ActivityIndicator, Dimensions, FlatList, Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Search, MapPin, Star, Bell, Trophy, Target, Zap, 
  Layers, Activity, CircleDot, ChevronRight, Flame
} from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import PremiumCard from '../components/PremiumCard';
import { useAuth } from '../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BACKEND_URL = 'http://192.168.18.23:5000/api';
const SLIDER_WIDTH = SCREEN_WIDTH - 48;
const AUTO_SCROLL_INTERVAL = 4000;

// ─── Banner Data ────────────────────────────────────────────
const BANNERS = [
  {
    id: '1',
    title: 'Book Your\nDream Turf',
    subtitle: 'Premium pitches near you',
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80',
    accent: '#22C55E',
  },
  {
    id: '2',
    title: 'Weekend\nTournaments',
    subtitle: 'Join exciting competitions & win prizes',
    image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80',
    accent: '#3B82F6',
  },
  {
    id: '3',
    title: 'Pro Member\nBenefits',
    subtitle: 'Save 15% on all premium bookings',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
    accent: '#F59E0B',
  },
];

// ─── Categories ─────────────────────────────────────────────
const CATEGORIES = [
  { id: 'All', name: 'All', icon: Layers, color: '#006e2f' },
  { id: 'Football', name: 'Football', icon: Trophy, color: '#22C55E' },
  { id: 'Cricket', name: 'Cricket', icon: Target, color: '#3B82F6' },
  { id: 'Tennis', name: 'Tennis', icon: Zap, color: '#F59E0B' },
  { id: 'Padel', name: 'Padel', icon: Activity, color: '#8B5CF6' },
  { id: 'Basketball', name: 'Basketball', icon: CircleDot, color: '#EF4444' },
];

// ─── Memoized Turf Card ─────────────────────────────────────
const TurfCard = memo(({ turf, onPress }) => (
  <TouchableOpacity activeOpacity={0.88} onPress={onPress} style={styles.turfCardTouch}>
    <View style={styles.turfCard}>
      <Image 
        source={{ uri: turf.imageUrl || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&q=80' }} 
        style={styles.turfImage} 
      />
      {/* Category badge */}
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryBadgeText}>{turf.category || 'Football'}</Text>
      </View>
      <View style={styles.turfInfo}>
        <Text style={styles.turfName} numberOfLines={1}>{turf.name}</Text>
        <View style={styles.turfMeta}>
          <View style={styles.locationRow}>
            <MapPin size={12} color={Colors.onSurfaceVariant} />
            <Text style={styles.locationText} numberOfLines={1}>{turf.location}</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Star size={12} color="#FFD700" fill="#FFD700" />
            <Text style={styles.ratingText}>{turf.rating}</Text>
          </View>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceText}>₹{turf.pricePerHour}</Text>
          <Text style={styles.perHour}>/hr</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
));

// ─── Banner Slide ───────────────────────────────────────────
const BannerSlide = memo(({ item }) => (
  <View style={[styles.bannerSlide, { width: SLIDER_WIDTH }]}>
    <Image source={{ uri: item.image }} style={styles.bannerImage} />
    <View style={styles.bannerOverlay}>
      <View style={[styles.bannerAccent, { backgroundColor: item.accent }]} />
      <Text style={styles.bannerTitle}>{item.title}</Text>
      <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
    </View>
  </View>
));

// ─── Main HomeScreen ────────────────────────────────────────
const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [turfs, setTurfs] = useState([]);
  const [loadingTurfs, setLoadingTurfs] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeSlide, setActiveSlide] = useState(0);
  
  const sliderRef = useRef(null);
  const timerRef = useRef(null);

  const userName = user?.name || user?.email?.split('@')[0] || 'Player';

  // ── Fetch turfs (once) ──
  const fetchTurfs = useCallback(async () => {
    if (hasFetched) return;
    try {
      const response = await fetch(`${BACKEND_URL}/turfs`);
      const data = await response.json();
      setTurfs(data);
      setHasFetched(true);
    } catch (e) {
      console.log('Error fetching turfs', e);
    } finally {
      setLoadingTurfs(false);
    }
  }, [hasFetched]);

  useEffect(() => { fetchTurfs(); }, [fetchTurfs]);

  // ── Auto-scroll banner slider ──
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActiveSlide(prev => {
        const next = (prev + 1) % BANNERS.length;
        sliderRef.current?.scrollToOffset({ offset: next * SLIDER_WIDTH, animated: true });
        return next;
      });
    }, AUTO_SCROLL_INTERVAL);

    return () => clearInterval(timerRef.current);
  }, []);

  const onSliderScroll = useCallback((event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SLIDER_WIDTH);
    setActiveSlide(index);
  }, []);

  // ── Filter turfs by category ──
  const filteredTurfs = selectedCategory === 'All' 
    ? turfs 
    : turfs.filter(t => (t.category || 'Football').toLowerCase() === selectedCategory.toLowerCase());

  const handleTurfPress = useCallback((turf) => {
    navigation.navigate('TurfDetail', { turf });
  }, [navigation]);

  const handleSearchPress = useCallback(() => {
    navigation.navigate('Search', { turfs });
  }, [navigation, turfs]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* ─── Header ─── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.greetingRow}>
              <Text style={styles.wave}>👋</Text>
              <Text style={styles.greeting}>Welcome back</Text>
            </View>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn} onPress={handleSearchPress}>
              <Search size={20} color={Colors.onBackground} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Bell size={20} color={Colors.onBackground} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Banner Slider ─── */}
        <View style={styles.sliderContainer}>
          <FlatList
            ref={sliderRef}
            data={BANNERS}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <BannerSlide item={item} />}
            onMomentumScrollEnd={onSliderScroll}
            snapToInterval={SLIDER_WIDTH}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 0 }}
            getItemLayout={(_, index) => ({ length: SLIDER_WIDTH, offset: SLIDER_WIDTH * index, index })}
          />
          {/* Dots indicator */}
          <View style={styles.dotsContainer}>
            {BANNERS.map((_, i) => (
              <View key={i} style={[styles.dot, activeSlide === i && styles.activeDot]} />
            ))}
          </View>
        </View>

        {/* ─── Categories Strip ─── */}
        <View style={styles.sectionHeader}>
          <Flame size={18} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Categories</Text>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.categoriesStrip}
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <TouchableOpacity 
                key={cat.id} 
                style={[styles.categoryChip, isActive && { backgroundColor: cat.color }]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.8}
              >
                <cat.icon size={16} color={isActive ? '#fff' : cat.color} />
                <Text style={[styles.categoryText, isActive && styles.activeCatText]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ─── Turfs Section ─── */}
        <View style={styles.sectionHeader}>
          <Trophy size={18} color={Colors.primary} />
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'All' ? 'Popular Turfs' : `${selectedCategory} Turfs`}
          </Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={handleSearchPress}>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>

        {loadingTurfs ? (
          <ActivityIndicator color={Colors.primary} size="large" style={{ marginVertical: 48 }} />
        ) : filteredTurfs.length > 0 ? (
          filteredTurfs.map((turf) => (
            <TurfCard key={turf.id} turf={turf} onPress={() => handleTurfPress(turf)} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🏟️</Text>
            <Text style={styles.emptyTitle}>No turfs found</Text>
            <Text style={styles.emptySubtitle}>
              No {selectedCategory.toLowerCase()} turfs available yet.{'\n'}Try a different category!
            </Text>
          </View>
        )}

        {/* ─── Pro Banner ─── */}
        <View style={styles.proBanner}>
          <View style={styles.proGlow} />
          <View style={styles.proContent}>
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
            <Text style={styles.proTitle}>Upgrade to Pro</Text>
            <Text style={styles.proDesc}>
              Get priority booking, 15% discount, and exclusive tournament access.
            </Text>
            <TouchableOpacity style={styles.proBtn} activeOpacity={0.85}>
              <Text style={styles.proBtnText}>Upgrade Now</Text>
              <ChevronRight size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  wave: {
    fontSize: 20,
  },
  greeting: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    fontWeight: '500',
  },
  userName: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.onBackground,
    marginTop: 4,
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: Colors.surfaceContainerLow,
  },
  // ── Slider ──
  sliderContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  bannerSlide: {
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    padding: 24,
  },
  bannerAccent: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  bannerTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 6,
    fontWeight: '500',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceContainerHighest,
  },
  activeDot: {
    width: 24,
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  // ── Section Header ──
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 14,
    marginTop: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onBackground,
  },
  viewAll: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  // ── Categories ──
  categoriesStrip: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 8,
  },
  categoryText: {
    fontWeight: '700',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  activeCatText: {
    color: '#ffffff',
  },
  // ── Turf Card ──
  turfCardTouch: {
    marginHorizontal: 24,
    marginBottom: 16,
  },
  turfCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  turfImage: {
    width: '100%',
    height: 180,
  },
  categoryBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  turfInfo: {
    padding: 18,
  },
  turfName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onBackground,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  turfMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  locationText: {
    color: Colors.onSurfaceVariant,
    fontSize: 13,
    fontWeight: '500',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
  },
  ratingText: {
    fontWeight: '800',
    fontSize: 13,
    color: '#B8860B',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.primary,
  },
  perHour: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
    marginLeft: 2,
  },
  // ── Empty State ──
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onBackground,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
  },
  // ── Pro Banner ──
  proBanner: {
    marginHorizontal: 24,
    marginTop: 8,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#0a0a0a',
  },
  proGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.primary + '25',
  },
  proContent: {
    padding: 24,
  },
  proBadge: {
    backgroundColor: Colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 14,
  },
  proBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  proTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
  },
  proDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 22,
    marginBottom: 20,
  },
  proBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
  },
  proBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15,
  },
});

export default memo(HomeScreen);
