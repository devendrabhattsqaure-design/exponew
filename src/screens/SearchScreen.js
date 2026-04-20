import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, Image, ActivityIndicator, Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search, X, MapPin, Star, SlidersHorizontal,
  ArrowUpDown, Layers, Trophy, Target, Zap, 
  Activity, CircleDot, ChevronLeft, Filter
} from 'lucide-react-native';
import { Colors } from '../constants/Colors';

const BACKEND_URL = 'http://192.168.18.23:5000/api';

const CATEGORIES = [
  { id: 'All', name: 'All', icon: Layers },
  { id: 'Football', name: 'Football', icon: Trophy },
  { id: 'Cricket', name: 'Cricket', icon: Target },
  { id: 'Tennis', name: 'Tennis', icon: Zap },
  { id: 'Padel', name: 'Padel', icon: Activity },
  { id: 'Basketball', name: 'Basketball', icon: CircleDot },
];

const SORT_OPTIONS = [
  { id: 'default', label: 'Default' },
  { id: 'price_low', label: 'Price: Low → High' },
  { id: 'price_high', label: 'Price: High → Low' },
  { id: 'rating', label: 'Top Rated' },
  { id: 'name', label: 'A → Z' },
];

const RATING_FILTERS = [
  { id: 'all', label: 'Any' },
  { id: '4', label: '4.0+' },
  { id: '4.5', label: '4.5+' },
];

// ─── Memoized Search Result Card ────────────────────────────
const SearchResultCard = memo(({ turf, onPress }) => (
  <TouchableOpacity style={styles.resultCard} onPress={onPress} activeOpacity={0.88}>
    <Image
      source={{ uri: turf.imageUrl || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&q=80' }}
      style={styles.resultImage}
    />
    <View style={styles.resultInfo}>
      <Text style={styles.resultName} numberOfLines={1}>{turf.name}</Text>
      <View style={styles.resultLocationRow}>
        <MapPin size={12} color={Colors.onSurfaceVariant} />
        <Text style={styles.resultLocation} numberOfLines={1}>{turf.location}</Text>
      </View>
      <View style={styles.resultBottom}>
        <View style={styles.resultRating}>
          <Star size={12} color="#FFD700" fill="#FFD700" />
          <Text style={styles.resultRatingText}>{turf.rating}</Text>
        </View>
        <View style={styles.resultCatBadge}>
          <Text style={styles.resultCatText}>{turf.category || 'Football'}</Text>
        </View>
      </View>
      <View style={styles.resultPriceRow}>
        <Text style={styles.resultPrice}>₹{turf.pricePerHour}</Text>
        <Text style={styles.resultPerHour}>/hr</Text>
      </View>
    </View>
  </TouchableOpacity>
));

// ─── Main Search Screen ─────────────────────────────────────
const SearchScreen = ({ navigation, route }) => {
  const passedTurfs = route?.params?.turfs;
  const [allTurfs, setAllTurfs] = useState(passedTurfs || []);
  const [loading, setLoading] = useState(!passedTurfs);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [minRating, setMinRating] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const searchInputRef = useRef(null);

  // Fetch turfs if not passed from Home
  useEffect(() => {
    if (!passedTurfs || passedTurfs.length === 0) {
      fetchTurfs();
    }
  }, []);

  const fetchTurfs = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/turfs`);
      const data = await res.json();
      setAllTurfs(data);
    } catch (e) {
      console.log('Error fetching turfs:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Apply all filters + sort ──
  const filteredResults = React.useMemo(() => {
    let results = [...allTurfs];

    // Category filter
    if (selectedCategory !== 'All') {
      results = results.filter(t =>
        (t.category || 'Football').toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Search query filter (name + location)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      results = results.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q)
      );
    }

    // Rating filter
    if (minRating !== 'all') {
      const min = parseFloat(minRating);
      results = results.filter(t => t.rating >= min);
    }

    // Sort
    switch (sortBy) {
      case 'price_low':
        results.sort((a, b) => a.pricePerHour - b.pricePerHour);
        break;
      case 'price_high':
        results.sort((a, b) => b.pricePerHour - a.pricePerHour);
        break;
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return results;
  }, [allTurfs, selectedCategory, searchQuery, sortBy, minRating]);

  const handleTurfPress = useCallback((turf) => {
    navigation.navigate('TurfDetail', { turf });
  }, [navigation]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  }, []);

  const resetFilters = useCallback(() => {
    setSelectedCategory('All');
    setSortBy('default');
    setMinRating('all');
  }, []);

  const renderTurf = useCallback(({ item }) => (
    <SearchResultCard turf={item} onPress={() => handleTurfPress(item)} />
  ), [handleTurfPress]);

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Search Header ── */}
      <View style={styles.searchHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={Colors.onBackground} />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Search size={18} color={Colors.onSurfaceVariant} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search turfs, locations..."
            placeholderTextColor={Colors.onSurfaceVariant + '80'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={18} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterToggle, showFilters && styles.filterToggleActive]}
          onPress={() => setShowFilters(prev => !prev)}
        >
          <SlidersHorizontal size={18} color={showFilters ? '#fff' : Colors.onBackground} />
        </TouchableOpacity>
      </View>

      {/* ── Filter Panel ── */}
      {showFilters && (
        <View style={styles.filterPanel}>
          {/* Sort By */}
          <View style={styles.filterSection}>
            <View style={styles.filterTitleRow}>
              <ArrowUpDown size={14} color={Colors.primary} />
              <Text style={styles.filterTitle}>Sort By</Text>
            </View>
            <View style={styles.filterChips}>
              {SORT_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.filterChip, sortBy === opt.id && styles.activeFilterChip]}
                  onPress={() => setSortBy(opt.id)}
                >
                  <Text style={[styles.filterChipText, sortBy === opt.id && styles.activeFilterChipText]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Rating */}
          <View style={styles.filterSection}>
            <View style={styles.filterTitleRow}>
              <Star size={14} color={Colors.primary} />
              <Text style={styles.filterTitle}>Min Rating</Text>
            </View>
            <View style={styles.filterChips}>
              {RATING_FILTERS.map(opt => (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.filterChip, minRating === opt.id && styles.activeFilterChip]}
                  onPress={() => setMinRating(opt.id)}
                >
                  <Text style={[styles.filterChipText, minRating === opt.id && styles.activeFilterChipText]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Reset */}
          <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
            <Text style={styles.resetBtnText}>Reset All Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Category Chips ── */}
      <FlatList
        horizontal
        data={CATEGORIES}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
        keyExtractor={item => item.id}
        renderItem={({ item: cat }) => {
          const isActive = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              style={[styles.catChip, isActive && styles.activeCatChip]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <cat.icon size={14} color={isActive ? '#fff' : Colors.onSurfaceVariant} />
              <Text style={[styles.catChipText, isActive && styles.activeCatChipText]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* ── Results Count ── */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredResults.length} turf{filteredResults.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* ── Results List ── */}
      {loading ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredResults}
          renderItem={renderTurf}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search or filters
              </Text>
              <TouchableOpacity style={styles.emptyResetBtn} onPress={resetFilters}>
                <Text style={styles.emptyResetText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // ── Search Header ──
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.onBackground,
    fontWeight: '600',
  },
  filterToggle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterToggleActive: {
    backgroundColor: Colors.primary,
  },
  // ── Filter Panel ──
  filterPanel: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 18,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.surfaceContainerLow,
  },
  activeFilterChip: {
    backgroundColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  activeFilterChipText: {
    color: '#ffffff',
  },
  resetBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
  // ── Categories ──
  categoryRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 6,
  },
  activeCatChip: {
    backgroundColor: Colors.primary,
  },
  catChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
  },
  activeCatChipText: {
    color: '#ffffff',
  },
  // ── Results ──
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  resultsList: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  resultImage: {
    width: 120,
    height: '100%',
    minHeight: 130,
  },
  resultInfo: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  resultName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.onBackground,
    marginBottom: 4,
  },
  resultLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  resultLocation: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    fontWeight: '500',
    flex: 1,
  },
  resultBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  resultRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  resultRatingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B8860B',
  },
  resultCatBadge: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  resultCatText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  resultPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  resultPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primary,
  },
  resultPerHour: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
    marginLeft: 2,
  },
  // ── Empty / Loading ──
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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
    marginBottom: 20,
  },
  emptyResetBtn: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyResetText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});

export default memo(SearchScreen);
