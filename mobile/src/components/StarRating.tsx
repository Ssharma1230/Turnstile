import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import Star from './Star';

type StarRatingProps = {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: number;
};

export default function StarRating({ rating, onRatingChange, size = 32 }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];

  const handleStarPress = (starValue: number) => {
    // If tapping the same star that's currently full, make it half
    if (rating === starValue) {
      onRatingChange(starValue - 0.5);
    } 
    // If tapping the same star that's currently half, make it full (next star)
    else if (rating === starValue - 0.5) {
      onRatingChange(starValue);
    } 
    // Different star tapped -> set to that full star
    else {
      onRatingChange(starValue);
    }
  };

  const getStarFill = (starValue: number) => {
    if (rating >= starValue) {
      return 1; // Full
    } else if (rating >= starValue - 0.5) {
      return 0.5; // Half
    } else {
      return 0; // Empty
    }
  };

  return (
    <View style={styles.container}>
      {stars.map((starValue) => (
        <TouchableOpacity
          key={starValue}
          onPress={() => handleStarPress(starValue)}
          style={styles.starButton}
        >
          <Star filled={getStarFill(starValue)} size={size} />
        </TouchableOpacity>
      ))}
      <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    marginLeft: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
});