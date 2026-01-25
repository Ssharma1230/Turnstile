import { StyleSheet, View, Text } from 'react-native';
import { useEffect, useState } from 'react';

export default function Index() {
  const [apiStatus, setApiStatus] = useState('Checking...');

  useEffect(() => {
    // Test connection to backend
    fetch('http://localhost:3000/health')
      .then(res => res.json())
      .then(data => setApiStatus('Connected to API'))
      .catch(err => setApiStatus('API not reachable'));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Turnstile</Text>
      <Text style={styles.subtitle}>Track your live sports experiences</Text>
      <Text style={styles.status}>{apiStatus}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  status: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
});
