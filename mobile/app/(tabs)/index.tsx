import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';
import { entryAPI } from '../../src/services/api';

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

export default function FeedScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [entries, setEntries] = useState<GameEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('📥 Fetching my entries...');
      const response = await entryAPI.getMyEntries();
      console.log('✅ Entries loaded:', response.entries.length);
      setEntries(response.entries);
    } catch (error: any) {
      console.log('⚠️ Failed to load entries (endpoint may not exist yet):', error.message);
      // Silently fail - just show empty state
      // Don't alert the user since the endpoint might not be built yet
      setEntries([]);
      setError('Unable to load entries');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);

    return (
      <View style={styles.starsContainer}>
        {[...Array(fullStars)].map((_, i) => (
          <Text key={`full-${i}`} style={styles.star}>⭐</Text>
        ))}
        {hasHalfStar && <Text style={styles.star}>⭐</Text>}
        {[...Array(emptyStars)].map((_, i) => (
          <Text key={`empty-${i}`} style={styles.starEmpty}>☆</Text>
        ))}
      </View>
    );
  };

  const renderEntry = ({ item }: { item: GameEntry }) => (
    <TouchableOpacity 
      style={styles.entryCard}
      onPress={() => {
        // TODO: Navigate to entry detail screen
        console.log('Entry clicked:', item.id);
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
      
      <Text style={styles.timestamp}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🎟️</Text>
      <Text style={styles.emptyTitle}>No entries yet</Text>
      <Text style={styles.emptyText}>
        Start tracking your live sports experiences!
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push('/(tabs)/create')}
      >
        <Text style={styles.createButtonText}>Create Your First Entry</Text>
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Games</Text>
        <Text style={styles.headerSubtitle}>
          {entries.length} {entries.length === 1 ? 'game' : 'games'} attended
        </Text>
      </View>
      
      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          entries.length === 0 ? styles.emptyContainer : styles.listContent
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
  },
  star: {
    fontSize: 16,
    marginLeft: 2,
  },
  starEmpty: {
    fontSize: 16,
    marginLeft: 2,
    color: '#d1d5db',
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
  timestamp: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 8,
  },
});