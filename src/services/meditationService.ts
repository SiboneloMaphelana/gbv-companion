import { Audio } from 'expo-av';
import axios from 'axios';
import { config } from '../config/config';

export interface Track {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  url: string;
}

export interface MeditationSession {
  id: string;
  title: string;
  description: string;
  tracks: Track[];
}

export class MeditationService {
  private sound: Audio.Sound | null = null;

  async fetchMeditationTracks(): Promise<MeditationSession[]> {
    const options = {
      method: 'GET',
      url: 'https://shazam.p.rapidapi.com/search',
      params: {
        term: 'meditation music relaxation',
        locale: 'en-US',
        offset: '0',
        limit: '5'
      },
      headers: {
        'X-RapidAPI-Key': config.api.shazam.key,
        'X-RapidAPI-Host': 'shazam.p.rapidapi.com'
      }
    };

    try {
      const response = await axios.request(options);
      const tracks = response.data.tracks.hits.map((hit: any) => ({
        id: hit.track.key,
        title: hit.track.title,
        subtitle: hit.track.subtitle,
        duration: '5 min',
        url: hit.track.hub.actions?.[1]?.uri || ''
      }));

      // Group tracks into meditation sessions
      return [
        {
          id: '1',
          title: 'Stress Relief',
          description: 'Calming sounds to help reduce stress and anxiety',
          tracks: tracks.slice(0, 3)
        },
        {
          id: '2',
          title: 'Deep Relaxation',
          description: 'Peaceful melodies for deep relaxation and inner peace',
          tracks: tracks.slice(3, 6)
        },
      ];
    } catch (error) {
      console.error('Error fetching tracks:', error);
      throw error;
    }
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