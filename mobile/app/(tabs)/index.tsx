import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { entryAPI } from '../../src/services/api';
import Star from '../../src/components/Star';

type GameEntry = {
  id: string;
  sport_type: string;
  home_team: string;
  away_team: string;
  venue_name: string;
  game_date: string;
  home_score: number | null;
  away_score: number | null;
  rating: number;
  description: string | null;
  photo_url: string | null;
  seat_section: string | null;
  created_at: string;
};

type SortOption = 'date-desc' | 'date-asc' | 'rating-desc' | 'rating-asc';

const SPORTS = ['All', 'NBA', 'NFL', 'MLB', 'NHL', 'MLS', 'NCAA Football', 'NCAA Basketball', 'Other'];

export default function FeedScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [allEntries, setAllEntries] = useState<GameEntry[]>([]);
  const [displayedEntries, setDisplayedEntries] = useState<GameEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter and sort state
  const [selectedSport, setSelectedSport] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  // Listen for refresh parameter from create screen
  useEffect(() => {
    if (params.refresh) {
      console.log('🔄 Refresh triggered from create screen');
      loadEntries();
    }
  }, [params.refresh]);

  // Apply filters and sorting whenever they change
  useEffect(() => {
    applyFiltersAndSort();
  }, [allEntries, selectedSport, sortBy]);

  const loadEntries = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('📥 Fetching my entries...');
      const response = await entryAPI.getMyEntries();
      console.log('✅ Entries loaded:', response.entries.length);
      setAllEntries(response.entries);
    } catch (error: any) {
      console.log('⚠️ Failed to load entries:', error.message);
      setAllEntries([]);
      setError('Unable to load entries');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...allEntries];

    // Filter by sport
    if (selectedSport !== 'All') {
      filtered = filtered.filter(entry => entry.sport_type === selectedSport);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.game_date).getTime() - new Date(a.game_date).getTime();
        case 'date-asc':
          return new Date(a.game_date).getTime() - new Date(b.game_date).getTime();
        case 'rating-desc':
          return b.rating - a.rating;
        case 'rating-asc':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    setDisplayedEntries(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
  };

  const renderStars = (rating: number) => {
  const stars = [];
  
  for (let i = 1; i <= 5; i++) {
    let filled = 0;
    if (rating >= i) {
      filled = 1; // Full
    } else if (rating >= i - 0.5) {
      filled = 0.5; // Half
    }
    
    stars.push(
      <View key={i} style={{ marginLeft: i > 1 ? 4 : 0 }}>
        <Star filled={filled} size={18} />
      </View>
    );
  }

  return <View style={styles.starsContainer}>{stars}</View>;
};

  const getSortLabel = (sort: SortOption) => {
    switch (sort) {
      case 'date-desc': return 'Newest First';
      case 'date-asc': return 'Oldest First';
      case 'rating-desc': return 'Highest Rated';
      case 'rating-asc': return 'Lowest Rated';
    }
  };

  const renderEntry = ({ item }: { item: GameEntry }) => (
  <TouchableOpacity 
    style={styles.entryCard}
    onPress={() => {
      // Navigate to entry detail screen
      router.push(`/entry/${item.id}`);
    }}
  >
    <View style={styles.entryHeader}>
      <Text style={styles.sportType}>{item.sport_type}</Text>
      {renderStars(item.rating)}
    </View>
    
    <Text style={styles.teams}>
      {item.home_team} vs {item.away_team}
    </Text>
    
    {(item.home_score !== null && item.away_score !== null) && (
      <Text style={styles.score}>
        Final: {item.home_score} - {item.away_score}
      </Text>
    )}
    
    <Text style={styles.venue}>📍 {item.venue_name}</Text>
    <Text style={styles.date}>
      📅 {new Date(item.game_date).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })}
    </Text>
    
    {item.seat_section && (
      <Text style={styles.seat}>🎟️ {item.seat_section}</Text>
    )}
    
    {item.description && (
      <Text style={styles.description} numberOfLines={3}>
        {item.description}
      </Text>
    )}
  </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🎟️</Text>
      <Text style={styles.emptyTitle}>
        {selectedSport === 'All' ? 'No entries yet' : `No ${selectedSport} games yet`}
      </Text>
      <Text style={styles.emptyText}>
        {selectedSport === 'All' 
          ? 'Start tracking your live sports experiences!'
          : `Create your first ${selectedSport} entry or change the filter.`
        }
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push('/(tabs)/create')}
      >
        <Text style={styles.createButtonText}>Create Entry</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading your entries...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Games</Text>
          <Text style={styles.headerSubtitle}>
            {displayedEntries.length} of {allEntries.length} {allEntries.length === 1 ? 'game' : 'games'}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Text style={styles.filterButtonText}>⚙️ Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Active Filters Display */}
      {(selectedSport !== 'All' || sortBy !== 'date-desc') && (
        <View style={styles.activeFilters}>
          {selectedSport !== 'All' && (
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>{selectedSport}</Text>
              <TouchableOpacity onPress={() => setSelectedSport('All')}>
                <Text style={styles.filterChipClose}> ✕</Text>
              </TouchableOpacity>
            </View>
          )}
          {sortBy !== 'date-desc' && (
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>{getSortLabel(sortBy)}</Text>
              <TouchableOpacity onPress={() => setSortBy('date-desc')}>
                <Text style={styles.filterChipClose}> ✕</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      
      {/* Entries List */}
      <FlatList
        data={displayedEntries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          displayedEntries.length === 0 ? styles.emptyContainer : styles.listContent
        }
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#2563eb"
          />
        }
        ListEmptyComponent={renderEmptyState}
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter & Sort</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              {/* Sport Filter */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Sport</Text>
                <View style={styles.sportGrid}>
                  {SPORTS.map((sport) => (
                    <TouchableOpacity
                      key={sport}
                      style={[
                        styles.sportFilterButton,
                        selectedSport === sport && styles.sportFilterButtonActive,
                      ]}
                      onPress={() => setSelectedSport(sport)}
                    >
                      <Text
                        style={[
                          styles.sportFilterButtonText,
                          selectedSport === sport && styles.sportFilterButtonTextActive,
                        ]}
                      >
                        {sport}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Sort Options */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Sort By</Text>
                
                <TouchableOpacity
                  style={[styles.sortOption, sortBy === 'date-desc' && styles.sortOptionActive]}
                  onPress={() => setSortBy('date-desc')}
                >
                  <Text style={[styles.sortOptionText, sortBy === 'date-desc' && styles.sortOptionTextActive]}>
                    📅 Newest Games First
                  </Text>
                  {sortBy === 'date-desc' && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sortOption, sortBy === 'date-asc' && styles.sortOptionActive]}
                  onPress={() => setSortBy('date-asc')}
                >
                  <Text style={[styles.sortOptionText, sortBy === 'date-asc' && styles.sortOptionTextActive]}>
                    📅 Oldest Games First
                  </Text>
                  {sortBy === 'date-asc' && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sortOption, sortBy === 'rating-desc' && styles.sortOptionActive]}
                  onPress={() => setSortBy('rating-desc')}
                >
                  <Text style={[styles.sortOptionText, sortBy === 'rating-desc' && styles.sortOptionTextActive]}>
                    ⭐ Highest Rated First
                  </Text>
                  {sortBy === 'rating-desc' && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sortOption, sortBy === 'rating-asc' && styles.sortOptionActive]}
                  onPress={() => setSortBy('rating-asc')}
                >
                  <Text style={[styles.sortOptionText, sortBy === 'rating-asc' && styles.sortOptionTextActive]}>
                    ⭐ Lowest Rated First
                  </Text>
                  {sortBy === 'rating-asc' && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalDoneButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.modalDoneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  filterButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  activeFilters: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  filterChipClose: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  entryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sportType: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teams: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 6,
  },
  score: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 8,
  },
  venue: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  seat: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalClose: {
    fontSize: 24,
    color: '#6b7280',
  },
  modalSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  sportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sportFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sportFilterButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  sportFilterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  sportFilterButtonTextActive: {
    color: '#fff',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  sortOptionActive: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#6b7280',
  },
  sortOptionTextActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 18,
    color: '#2563eb',
    fontWeight: 'bold',
  },
  modalDoneButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    margin: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalDoneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});