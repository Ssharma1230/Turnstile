import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => {
        if (isAuthenticated) {
          router.replace('/(tabs)');  // Navigate to tabs
        } else {
          router.replace('/login');
        }
      }, 100);
    }
  }, [isAuthenticated, isLoading]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Turnstile</Text>
      <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#1a1a1a',
  },
  loader: {
    marginTop: 16,
  },
});