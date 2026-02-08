import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { entryAPI } from '../../src/services/api';
import StarRating from '../../src/components/StarRating';
import DateTimePicker from '@react-native-community/datetimepicker';

const SPORTS = ['NBA', 'NFL', 'MLB', 'NHL', 'MLS', 'NCAA Football', 'NCAA Basketball', 'Other'];

export default function CreateEntryScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Form state
  const [sportType, setSportType] = useState('');
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [venueName, setVenueName] = useState('');
  const [gameDate, setGameDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [rating, setRating] = useState(3.0);
  const [description, setDescription] = useState('');
  const [seatSection, setSeatSection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setGameDate(selectedDate);
    }
  };

  const closeDatePicker = () => {
    setShowDatePicker(false);
  };

  // Reset form to initial state
  const resetForm = () => {
    setSportType('');
    setHomeTeam('');
    setAwayTeam('');
    setVenueName('');
    setGameDate(new Date());
    setHomeScore('');
    setAwayScore('');
    setRating(3.0);
    setDescription('');
    setSeatSection('');
    
    // Scroll to top
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleSubmit = async () => {
    // Validation
    if (!sportType) {
      Alert.alert('Missing Field', 'Please select a sport type');
      return;
    }
    if (!homeTeam.trim()) {
      Alert.alert('Missing Field', 'Please enter the home team');
      return;
    }
    if (!awayTeam.trim()) {
      Alert.alert('Missing Field', 'Please enter the away team');
      return;
    }
    if (!venueName.trim()) {
      Alert.alert('Missing Field', 'Please enter the venue name');
      return;
    }
    if (!homeScore.trim() || !awayScore.trim()) {
      Alert.alert('Missing Field', 'Please enter the final score');
      return;
    }

    setIsSubmitting(true);

    try {
      const entryData = {
        sport_type: sportType,
        home_team: homeTeam.trim(),
        away_team: awayTeam.trim(),
        venue_name: venueName.trim(),
        game_date: gameDate.toISOString().split('T')[0], // YYYY-MM-DD
        home_score: parseInt(homeScore),
        away_score: parseInt(awayScore),
        rating,
        description: description.trim() || undefined,
        seat_section: seatSection.trim() || undefined,
      };

      console.log('📤 Creating entry:', entryData);
      const response = await entryAPI.create(entryData);
      console.log('✅ Entry created:', response);

      // Clear the form and scroll to top
      resetForm();

      // Show success message
      Alert.alert('Success', 'Entry created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Navigate to home tab with refresh flag
            router.push({
              pathname: '/(tabs)',
              params: { refresh: Date.now().toString() }
            });
          },
        },
      ]);
    } catch (error: any) {
      console.error('❌ Create entry error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to create entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
        bounces={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* Sport Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Sport Type *</Text>
          <View style={styles.sportGrid}>
            {SPORTS.map((sport) => (
              <TouchableOpacity
                key={sport}
                style={[
                  styles.sportButton,
                  sportType === sport && styles.sportButtonActive,
                ]}
                onPress={() => setSportType(sport)}
              >
                <Text
                  style={[
                    styles.sportButtonText,
                    sportType === sport && styles.sportButtonTextActive,
                  ]}
                >
                  {sport}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Teams */}
        <View style={styles.section}>
          <Text style={styles.label}>Home Team *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Lakers"
            value={homeTeam}
            onChangeText={setHomeTeam}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Away Team *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Warriors"
            value={awayTeam}
            onChangeText={setAwayTeam}
          />
        </View>

        {/* Venue */}
        <View style={styles.section}>
          <Text style={styles.label}>Venue *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Crypto.com Arena"
            value={venueName}
            onChangeText={setVenueName}
          />
        </View>

        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.label}>Game Date *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              📅 {gameDate.toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={gameDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles.datePickerDoneButton}
                  onPress={closeDatePicker}
                >
                  <Text style={styles.datePickerDoneText}>Done</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Score (Required) */}
        <View style={styles.section}>
          <Text style={styles.label}>Final Score *</Text>
          <View style={styles.scoreRow}>
            <View style={styles.scoreInput}>
              <Text style={styles.scoreLabel}>Home</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={homeScore}
                onChangeText={setHomeScore}
                keyboardType="number-pad"
              />
            </View>
            <Text style={styles.scoreDash}>-</Text>
            <View style={styles.scoreInput}>
              <Text style={styles.scoreLabel}>Away</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={awayScore}
                onChangeText={setAwayScore}
                keyboardType="number-pad"
              />
            </View>
          </View>
        </View>

        {/* Rating */}
        <View style={styles.section}>
          <Text style={styles.label}>Your Rating *</Text>
          <StarRating rating={rating} onRatingChange={setRating} />
          <Text style={styles.hint}>Tap stars to rate. Tap same star twice for half stars.</Text>
        </View>

        {/* Seat Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Seat Section (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Section 101, Row 5"
            value={seatSection}
            onChangeText={setSeatSection}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Share your experience..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Create Entry</Text>
          )}
        </TouchableOpacity>

        {/* Extra bottom padding for better scrolling */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 0,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  sportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sportButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sportButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  sportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  sportButtonTextActive: {
    color: '#fff',
  },
  dateButton: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1f2937',
  },
  datePickerContainer: {
    marginTop: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 8,
  },
  datePickerDoneButton: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  datePickerDoneText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  scoreInput: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  scoreDash: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9ca3af',
    marginTop: 20,
  },
  hint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 100,
  },
});