import React from 'react';
import { StyleSheet, Text, TouchableOpacity, Linking, Platform, View } from 'react-native';
import type { SafePlace } from '../hooks/useSafePlaces';

interface PlaceCardProps {
  place: SafePlace;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({ place }) => {
  const openMaps = async () => {
    try {
      const query = encodeURIComponent(place.name);
      const url = Platform.select({
        ios: `maps:?q=${query}`,
        android: `geo:0,0?q=${query}`,
        default: `https://www.google.com/maps/search/?api=1&query=${query}`,
      });

      const supported = await Linking.canOpenURL(url!);
      if (supported) {
        await Linking.openURL(url!);
      } else {
        console.warn('Maps app not available');
      }
    } catch (error) {
      console.error('Error opening maps:', error);
    }
  };

  return (
    <TouchableOpacity style={styles.placeCard} onPress={openMaps}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>{place.rank}</Text>
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.placeName}>{place.name}</Text>
        <Text style={styles.placeType}>{place.placeType}</Text>
        <Text style={styles.placeAddress}>{place.vicinity}</Text>
        <Text style={styles.distance}>{place.formattedDistance}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  placeCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
  },
  placeName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  placeType: {
    fontSize: 14,
    color: '#E91E63',
    fontWeight: '500',
    marginBottom: 4,
  },
  placeAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  distance: {
    fontSize: 14,
    color: '#E91E63',
    fontWeight: '500',
  },
}); 