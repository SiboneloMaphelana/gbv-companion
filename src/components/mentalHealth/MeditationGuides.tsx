import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Card, Button, IconButton, ProgressBar } from 'react-native-paper';
import { meditationService, Track, MeditationSession } from '../../services/meditationService';

const MeditationGuides = () => {
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetchMeditationTracks();
    return () => {
      meditationService.cleanup();
    };
  }, []);

  const fetchMeditationTracks = async () => {
    try {
      const meditationSessions = await meditationService.fetchMeditationTracks();
      setSessions(meditationSessions);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tracks:', error);
      setLoading(false);
    }
  };

  const playSound = async (track: Track) => {
    try {
      await meditationService.playSound(track, onPlaybackStatusUpdate);
      setActiveTrack(track);
      setIsPlaying(true);
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
    if (isPlaying) {
      await meditationService.pauseSound();
    } else {
      await meditationService.resumeSound();
    }
    setIsPlaying(!isPlaying);
  };

  const stopPlayback = async () => {
    await meditationService.stopSound();
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