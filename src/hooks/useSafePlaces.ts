import { useState, useEffect } from 'react';
import { locationService } from '../services/location.service';
import { placesService, type Place as GooglePlace } from '../services/places.service';
import { calculateDistance, formatDistance } from '../utils/distance.utils';

export interface SafePlace {
  name: string;
  vicinity: string;
  distance: number;
  formattedDistance: string;
  place_id: string;
  placeType: string;
  rank: number;
}

interface UseSafePlacesReturn {
  places: SafePlace[];
  loading: boolean;
  error: string | null;
  refreshPlaces: () => Promise<void>;
}

const MAX_PLACES = 5;

export const useSafePlaces = (): UseSafePlacesReturn => {
  const [places, setPlaces] = useState<SafePlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const processPlaces = (rawPlaces: GooglePlace[], userLocation: { latitude: number; longitude: number }): SafePlace[] => {
    const allPlaces = rawPlaces.map(place => {
      const distance = calculateDistance(
        userLocation,
        {
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
        }
      );

      return {
        name: place.name,
        vicinity: place.vicinity,
        distance,
        formattedDistance: formatDistance(distance),
        place_id: place.place_id,
        placeType: determineType(place),
        rank: 0, // Will be set after sorting
      };
    });

    // Sort by distance and take top 5
    const sortedPlaces = allPlaces
      .sort((a, b) => a.distance - b.distance)
      .slice(0, MAX_PLACES)
      .map((place, index) => ({
        ...place,
        rank: index + 1
      }));

    return sortedPlaces;
  };

  const determineType = (place: GooglePlace): string => {
    // This will be determined by the type parameter used in the API call
    // We can enhance this later if needed
    if (place.types?.includes('police')) return 'Police Station';
    if (place.types?.includes('hospital')) return 'Hospital';
    if (place.types?.includes('embassy')) return 'Embassy';
    return 'Safe Place';
  };

  const refreshPlaces = async () => {
    setLoading(true);
    setError(null);

    try {
      const hasPermission = await locationService.requestPermissions();
      if (!hasPermission) {
        setError('Permission to access location was denied');
        return;
      }

      const userLocation = await locationService.getCurrentLocation();
      const nearbyPlaces = await placesService.fetchNearbyPlaces(userLocation);
      const processedPlaces = processPlaces(nearbyPlaces, userLocation);
      
      setPlaces(processedPlaces);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      console.error('Error in useSafePlaces:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshPlaces();
  }, []);

  return {
    places,
    loading,
    error,
    refreshPlaces,
  };
}; 