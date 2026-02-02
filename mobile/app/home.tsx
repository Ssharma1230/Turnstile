import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Auth guard - redirect if not authenticated
  useEffect(() => {
    console.log('🏠 HomeScreen: isAuthenticated =', isAuthenticated, 'isLoading =', isLoading);
    
    if (!isLoading && !isAuthenticated) {
      console.log('🚪 Not authenticated, redirecting to login...');
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading]);

  const handleLogout = async () => {
    console.log('👋 Home: Logout button pressed');
    await logout();
    // Navigation happens in useEffect above
  };

  // Show loading while checking auth
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // Show nothing if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Turnstile!</Text>
      <Text style={styles.subtitle}>Hello, {user?.username}! 👋</Text>
      <Text style={styles.email}>{user?.email}</Text>
      
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  email: {
    fontSize: 14,
    color: '#999',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});