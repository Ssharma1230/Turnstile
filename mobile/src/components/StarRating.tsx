import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';

type StarRatingProps = {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: number;
};

export default function StarRating({ rating, onRatingChange, size = 40 }: StarRatingProps) {
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

  const renderStar = (starValue: number) => {
    // Full star: rating is >= this star value
    if (rating >= starValue) {
      return (
        <TouchableOpacity
          key={starValue}
          onPress={() => handleStarPress(starValue)}
          style={styles.starButton}
        >
          <Text style={[styles.star, { fontSize: size }]}>⭐</Text>
        </TouchableOpacity>
      );
    }
    
    // Half star: rating is exactly 0.5 less than this star value
    if (rating === starValue - 0.5) {
      return (
        <TouchableOpacity
          key={starValue}
          onPress={() => handleStarPress(starValue)}
          style={styles.starButton}
        >
          <View style={styles.halfStarContainer}>
            <Text style={[styles.star, styles.starEmpty, { fontSize: size }]}>☆</Text>
            <View style={[styles.halfStarOverlay, { width: size / 2 }]}>
              <Text style={[styles.star, { fontSize: size }]}>⭐</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
    
    // Empty star: rating is less than this star value
    return (
      <TouchableOpacity
        key={starValue}
        onPress={() => handleStarPress(starValue)}
        style={styles.starButton}
      >
        <Text style={[styles.star, styles.starEmpty, { fontSize: size }]}>☆</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {stars.map(renderStar)}
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
  star: {
    color: '#f59e0b',
  },
  starEmpty: {
    color: '#d1d5db',
  },
  halfStarContainer: {
    position: 'relative',
  },
  halfStarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
  },
  ratingText: {
    marginLeft: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
});