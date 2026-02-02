import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function CreateScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.placeholder}>
        <Text style={styles.icon}>🎟️</Text>
        <Text style={styles.title}>Create New Entry</Text>
        <Text style={styles.subtitle}>
          We'll build the full form next!
        </Text>
        <Text style={styles.description}>
          This will include:{'\n'}
          • Sport type selection{'\n'}
          • Team names{'\n'}
          • Venue & date{'\n'}
          • Star rating (1-5){'\n'}
          • Photo upload{'\n'}
          • Description
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  placeholder: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 24,
    textAlign: 'center',
  },
});