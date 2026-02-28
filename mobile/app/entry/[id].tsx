import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
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

export default function EntryDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const entryId = params.id as string;

  const [entry, setEntry] = useState<GameEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (entryId) {
      loadEntry();
    }
  }, [entryId]);

  const loadEntry = async () => {
    setIsLoading(true);
    try {
      console.log('📥 Fetching entry:', entryId);
      const response = await entryAPI.getById(entryId);
      console.log('✅ Entry loaded:', JSON.stringify(response, null, 2));
      console.log('📊 Rating:', response.entry?.rating);
      setEntry(response.entry);
    } catch (error: any) {
      console.error('❌ Failed to load entry:', error);
      Alert.alert('Error', 'Failed to load entry', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    if (!entry) return;
    
    setIsDeleting(true);
    try {
      console.log('🗑️ Deleting entry:', entryId);
      await entryAPI.delete(entryId);
      console.log('✅ Entry deleted');

      Alert.alert('Deleted', 'Entry has been deleted', [
        {
          text: 'OK',
          onPress: () => {
            router.push({
              pathname: '/(tabs)',
              params: { refresh: Date.now().toString() },
            });
          },
        },
      ]);
    } catch (error: any) {
      console.error('❌ Delete error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to delete entry');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderStars = (rating: number | null | undefined) => {
    if (rating == null || rating === 0) {
      return <Text style={styles.noRating}>No rating</Text>;
    }

    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      let filled = 0;
      
      if (rating >= i) {
        filled = 1;
      } else if (rating > i - 1) {
        filled = rating - (i - 1);
      }
      
      stars.push(
        <View key={i} style={{ marginLeft: i > 1 ? 4 : 0 }}>
          <Star filled={filled} size={32} />
        </View>
      );
    }

    return <View style={styles.starsContainer}>{stars}</View>;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading entry...</Text>
      </View>
    );
  }

  if (!entry) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Entry not found</Text>
        <TouchableOpacity
          style={styles.backButtonFull}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonFullText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Entry Details</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Sport Badge */}
        <View style={styles.sportBadge}>
          <Text style={styles.sportBadgeText}>{entry.sport_type || 'Unknown'}</Text>
        </View>

        {/* Teams */}
        <Text style={styles.teams}>
          {entry.home_team || 'Home'} vs {entry.away_team || 'Away'}
        </Text>

        {/* Score */}
        {(entry.home_score != null && entry.away_score != null) && (
          <Text style={styles.score}>
            Final Score: {entry.home_score} - {entry.away_score}
          </Text>
        )}

        {/* Date */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📅 Date</Text>
          <Text style={styles.infoValue}>
            {entry.game_date ? new Date(entry.game_date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }) : 'Unknown date'}
          </Text>
        </View>

        {/* Venue */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📍 Venue</Text>
          <Text style={styles.infoValue}>{entry.venue_name || 'Unknown venue'}</Text>
        </View>

        {/* Seat Section */}
        {entry.seat_section && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🎟️ Seat</Text>
            <Text style={styles.infoValue}>{entry.seat_section}</Text>
          </View>
        )}

        {/* Rating */}
        <View style={styles.ratingSection}>
          <Text style={styles.ratingLabel}>Your Rating</Text>
          <View style={styles.ratingDisplay}>
            {renderStars(entry.rating)}
            {entry.rating != null && (
              <Text style={styles.ratingNumber}>
                {Number(entry.rating).toFixed(1)}
              </Text>
            )}
          </View>
        </View>

        {/* Description */}
        {entry.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionLabel}>Your Experience</Text>
            <Text style={styles.descriptionText}>{entry.description}</Text>
          </View>
        )}

        {/* Delete Button */}
        <TouchableOpacity
          style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
          onPress={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.deleteButtonText}>🗑️ Delete Entry</Text>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 16,
  },
  backButtonFull: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonFullText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  content: {
    flex: 1,
  },
  sportBadge: {
    alignSelf: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 24,
    marginBottom: 16,
  },
  sportBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  teams: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  score: {
    fontSize: 20,
    fontWeight: '600',
    color: '#059669',
    textAlign: 'center',
    marginBottom: 24,
  },
  infoRow: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  ratingSection: {
    backgroundColor: '#fff',
    paddingVertical: 24,
    paddingHorizontal: 24,
    marginTop: 16,
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
  },
  ratingDisplay: {
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  ratingNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  noRating: {
    fontSize: 16,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  descriptionSection: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 24,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    marginHorizontal: 24,
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    backgroundColor: '#fca5a5',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  bottomSpacer: {
    height: 40,
  },
});