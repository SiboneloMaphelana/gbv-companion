import { config } from '../config/config';
import type { LocationCoordinates } from './location.service';

export interface Place {
  name: string;
  vicinity: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  place_id: string;
  types: string[];
}

export interface PlaceType {
  type: 'police' | 'hospital' | 'embassy';
  label: string;
}

class PlacesService {
  private readonly PLACE_TYPES: PlaceType[] = [
    { type: 'police', label: 'Police Stations' },
    { type: 'hospital', label: 'Hospitals' },
    { type: 'embassy', label: 'Embassies' }
  ];

  private readonly SEARCH_RADIUS = config.emergency.searchRadius;

  async fetchNearbyPlaces(location: LocationCoordinates): Promise<Place[]> {
    try {
      const placesPromises = this.PLACE_TYPES.map(({ type }) =>
        this.fetchPlacesByType(location, type)
      );

      const results = await Promise.all(placesPromises);
      return results.flat();
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      throw new Error('Failed to fetch nearby places');
    }
  }

  private async fetchPlacesByType(
    location: LocationCoordinates,
    type: PlaceType['type']
  ): Promise<Place[]> {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.latitude},${location.longitude}&radius=${this.SEARCH_RADIUS}&type=${type}&key=${config.api.google.places}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.results) {
      throw new Error(`Failed to fetch ${type} places`);
    }

    return data.results;
  }

  getPlaceTypes(): PlaceType[] {
    return this.PLACE_TYPES;
  }
}

export const placesService = new PlacesService(); 