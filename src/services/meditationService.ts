import { Audio } from 'expo-av';
import axios from 'axios';
import { config } from '../config/config';

export interface Track {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  url: string;
  category: string;
}

export interface MeditationSession {
  id: string;
  title: string;
  description: string;
  category: string;
  tracks: Track[];
}

export type Category = {
  id: string;
  name: string;
  description: string;
};

export const CATEGORIES: Category[] = [
  {
    id: 'stress-relief',
    name: 'Stress Relief',
    description: 'Calming sounds to help reduce stress and anxiety'
  },
  {
    id: 'sleep',
    name: 'Sleep',
    description: 'Peaceful melodies to help you fall asleep'
  },
  {
    id: 'focus',
    name: 'Focus',
    description: 'Background sounds to improve concentration'
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness',
    description: 'Gentle music for mindfulness practice'
  }
];

export class MeditationService {
  private sound: Audio.Sound | null = null;
  private cachedTracks: Track[] = [];

  async fetchMeditationTracks(searchTerm: string = ''): Promise<MeditationSession[]> {
    const options = {
      method: 'GET',
      url: 'https://shazam.p.rapidapi.com/search',
      params: {
        term: searchTerm || 'meditation music relaxation',
        locale: 'en-US',
        offset: '0',
        limit: '20'
      },
      headers: {
        'X-RapidAPI-Key': config.api.shazam.key,
        'X-RapidAPI-Host': 'shazam.p.rapidapi.com'
      }
    };

    try {
      const response = await axios.request(options);
      this.cachedTracks = response.data.tracks.hits.map((hit: any) => ({
        id: hit.track.key,
        title: hit.track.title,
        subtitle: hit.track.subtitle,
        duration: '5 min',
        url: hit.track.hub.actions?.[1]?.uri || '',
        category: this.assignCategory(hit.track.title.toLowerCase())
      }));

      // Group tracks by category
      return this.groupTracksByCategory(this.cachedTracks);
    } catch (error) {
      console.error('Error fetching tracks:', error);
      throw error;
    }
  }

  private assignCategory(title: string): string {
    if (title.includes('sleep') || title.includes('night') || title.includes('dream')) {
      return 'sleep';
    } else if (title.includes('focus') || title.includes('concentration') || title.includes('study')) {
      return 'focus';
    } else if (title.includes('mindful') || title.includes('zen') || title.includes('peace')) {
      return 'mindfulness';
    }
    return 'stress-relief'; // default category
  }

  private groupTracksByCategory(tracks: Track[]): MeditationSession[] {
    return CATEGORIES.map(category => ({
      id: category.id,
      title: category.name,
      description: category.description,
      category: category.id,
      tracks: tracks.filter(track => track.category === category.id)
    }));
  }

  searchTracks(query: string): MeditationSession[] {
    if (!query) {
      return this.groupTracksByCategory(this.cachedTracks);
    }

    const filteredTracks = this.cachedTracks.filter(track =>
      track.title.toLowerCase().includes(query.toLowerCase()) ||
      track.subtitle.toLowerCase().includes(query.toLowerCase())
    );

    return this.groupTracksByCategory(filteredTracks);
  }

  async playSound(track: Track, onPlaybackStatusUpdate: (status: any) => void): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: track.url },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      this.sound = newSound;
      await newSound.playAsync();
    } catch (error) {
      console.error('Error playing sound:', error);
      throw error;
    }
  }

  async pauseSound(): Promise<void> {
    if (this.sound) {
      await this.sound.pauseAsync();
    }
  }

  async resumeSound(): Promise<void> {
    if (this.sound) {
      await this.sound.playAsync();
    }
  }

  async stopSound(): Promise<void> {
    if (this.sound) {
      await this.sound.stopAsync();
      await this.sound.unloadAsync();
      this.sound = null;
    }
  }

  async cleanup(): Promise<void> {
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
    }
  }
}

export const meditationService = new MeditationService(); 