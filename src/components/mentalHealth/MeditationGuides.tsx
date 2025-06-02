import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Card, Button, IconButton, ProgressBar } from 'react-native-paper';
import axios from 'axios';
import { Audio } from 'expo-av';
import { config } from '../../config/env';

interface Track {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  url: string;
}

interface MeditationSession {
  id: string;
  title: string;
  description: string;
  tracks: Track[];
}

const MeditationGuides = () => {
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [activeSession, setActiveSession] = useState<MeditationSession | null>(null);
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetchMeditationTracks();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const fetchMeditationTracks = async () => {
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
        'X-RapidAPI-Key': config.shazamApiKey,
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
      const meditationSessions: MeditationSession[] = [
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

      setSessions(meditationSessions);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tracks:', error);
      setLoading(false);
    }
  };

  const playSound = async (track: Track) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: track.url },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
      setActiveTrack(track);
      setIsPlaying(true);
      await newSound.playAsync();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setProgress(status.positionMillis / status.durationMillis);
      if (status.didJustFinish) {
        setIsPlaying(false);
        setProgress(0);
      }
    }
  };

  const handlePlayPause = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const stopPlayback = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
    setSound(null);
    setActiveTrack(null);
    setIsPlaying(false);
    setProgress(0);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading meditation tracks...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {activeTrack ? (
        <View style={styles.activeSession}>
          <Card style={styles.activeCard}>
            <Card.Content>
              <Text style={styles.activeTitle}>{activeTrack.title}</Text>
              <Text style={styles.activeSubtitle}>{activeTrack.subtitle}</Text>
              <ProgressBar
                progress={progress}
                color="#6200ee"
                style={styles.progressBar}
              />
              <View style={styles.controls}>
                <IconButton
                  icon="skip-previous"
                  size={30}
                  onPress={() => setProgress(Math.max(0, progress - 0.1))}
                />
                <IconButton
                  icon={isPlaying ? "pause" : "play"}
                  size={40}
                  onPress={handlePlayPause}
                />
                <IconButton
                  icon="stop"
                  size={40}
                  onPress={stopPlayback}
                />
                <IconButton
                  icon="skip-next"
                  size={30}
                  onPress={() => setProgress(Math.min(1, progress + 0.1))}
                />
              </View>
            </Card.Content>
          </Card>
        </View>
      ) : (
        <View>
          <Text style={styles.title}>Guided Meditations</Text>
          {sessions.map((session) => (
            <Card key={session.id} style={styles.card}>
              <Card.Content>
                <Text style={styles.sessionTitle}>{session.title}</Text>
                <Text style={styles.description}>{session.description}</Text>
                <View style={styles.trackList}>
                  {session.tracks.map((track) => (
                    <Button
                      key={track.id}
                      mode="outlined"
                      onPress={() => playSound(track)}
                      style={styles.trackButton}
                    >
                      {track.title}
                    </Button>
                  ))}
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    marginBottom: 16,
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    color: '#666',
    marginBottom: 16,
  },
  trackList: {
    gap: 8,
  },
  trackButton: {
    marginVertical: 4,
  },
  activeSession: {
    flex: 1,
  },
  activeCard: {
    elevation: 4,
  },
  activeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  activeSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  progressBar: {
    marginVertical: 16,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
});

export default MeditationGuides; 