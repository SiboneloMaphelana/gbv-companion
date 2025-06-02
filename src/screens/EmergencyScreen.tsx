import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useSafePlaces } from '../hooks/useSafePlaces';
import { PlaceCard } from '../components/PlaceCard';

export const EmergencyScreen = () => {
  const { places, loading, error } = useSafePlaces();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Finding safe places nearby...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Nearby Safe Places</Text>
      <FlatList
        data={places}
        keyExtractor={(item) => item.place_id}
        renderItem={({ item }) => <PlaceCard place={item} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#E91E63',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#E91E63',
  },
}); 