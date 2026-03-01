import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';
import { userAPI } from '../../src/services/api';
import Star from '../../src/components/Star';

type UserStats = {
  total_games: number;
  avg_rating: number;
  sports_breakdown: { sport_type: string; count: string }[];
};

export default function ProfileScreen() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
    if (!isAuthenticated) {
      console.log('🚪 User logged out, redirecting to login...');
      router.replace('/login');
    }
  }, [isAuthenticated]);
  
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      console.log('📊 Fetching user stats...');
      const response = await userAPI.getStats();
      console.log('✅ Stats loaded:', response.stats);
      setStats(response.stats);
    } catch (error) {
      console.error('❌ Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const renderAvgRating = () => {
    if (!stats || stats.avg_rating === 0) {
      return <Text style={styles.statValue}>-</Text>;
    }

    const stars = [];
    const rating = stats.avg_rating;
    
    for (let i = 1; i <= 5; i++) {
      let filled = 0;
      
      if (rating >= i) {
        filled = 1; // Full star
      } else if (rating > i - 1) {
        // Partial star - calculate exact fill percentage
        filled = rating - (i - 1);
      }
      // else filled = 0 (empty star)
      
      stars.push(
        <View key={i} style={{ marginLeft: i > 1 ? 2 : 0 }}>
          <Star filled={filled} size={20} />
        </View>
      );
    }

    return (
      <View style={styles.ratingContainer}>
        <View style={styles.starsRow}>{stars}</View>
        <Text style={styles.ratingNumber}>{stats.avg_rating.toFixed(1)}</Text>
      </View>
    );
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.username?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.username}>{user?.username}</Text>
        
        {/* Add bio display */}
        {user?.bio && (
          <Text style={styles.bio}>{user.bio}</Text>
        )}
        
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => router.push('/edit-profile')}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats?.total_games || 0}</Text>
          <Text style={styles.statLabel}>Games</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          {renderAvgRating()}
          <Text style={styles.statLabel}>Avg Rating</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {stats?.sports_breakdown.length || 0}
          </Text>
          <Text style={styles.statLabel}>Sports</Text>
        </View>
      </View>

      {/* Sports Breakdown */}
      {stats && stats.sports_breakdown.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sports Breakdown</Text>
          {stats.sports_breakdown.map((sport) => (
            <View key={sport.sport_type} style={styles.sportItem}>
              <Text style={styles.sportName}>{sport.sport_type}</Text>
              <Text style={styles.sportCount}>{sport.count} games</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => Alert.alert('Coming Soon', 'Notification settings coming soon!')}
        >
          <Text style={styles.menuText}>Notifications</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => Alert.alert('Coming Soon', 'Privacy settings coming soon!')}
        >
          <Text style={styles.menuText}>Privacy</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => Alert.alert('Coming Soon', 'Help & Support coming soon!')}
        >
          <Text style={styles.menuText}>Help & Support</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.menuItem, styles.logoutItem]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>Turnstile v1.0.0</Text>
    </ScrollView>
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
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  bio: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  editButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  ratingNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
  },
  section: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sportName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  sportCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuText: {
    fontSize: 16,
    color: '#1f2937',
  },
  menuArrow: {
    fontSize: 24,
    color: '#9ca3af',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 12,
    marginVertical: 24,
  },
});