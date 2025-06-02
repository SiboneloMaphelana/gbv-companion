import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Card, Button, IconButton, ProgressBar, Searchbar, Chip, Menu } from 'react-native-paper';
import { meditationService, Track, MeditationSession, CATEGORIES } from '../../services/meditationService';

type SearchType = 'track' | 'artist';

const MeditationGuides = () => {
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [searchType, setSearchType] = useState<SearchType>('track');
  const [isSearching, setIsSearching] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

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

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query) {
      fetchMeditationTracks();
      return;
    }

    setIsSearching(true);
    try {
      const result = searchType === 'artist' 
        ? await meditationService.searchByArtist(query)
        : await meditationService.searchByTrack(query);
      
      setSessions(result.sessions);
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const filterByCategory = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    if (!categoryId) {
      fetchMeditationTracks();
      return;
    }
    
    const filteredSessions = sessions.filter(session => session.category === categoryId);
    setSessions(filteredSessions);
  };

  const playSound = async (track: Track) => {
    try {
      setIsLoadingAudio(true);
      await meditationService.playSound(track, onPlaybackStatusUpdate);
      setActiveTrack(track);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing sound:', error);
    } finally {
      setIsLoadingAudio(false);
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
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder={`Search by ${searchType}...`}
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button
              mode="contained"
              onPress={() => setMenuVisible(true)}
              style={styles.searchTypeButton}
            >
              {searchType === 'track' ? 'Track' : 'Artist'}
            </Button>
          }
        >
          <Menu.Item
            onPress={() => {
              setSearchType('track');
              setMenuVisible(false);
              if (searchQuery) handleSearch(searchQuery);
            }}
            title="Search by Track"
          />
          <Menu.Item
            onPress={() => {
              setSearchType('artist');
              setMenuVisible(false);
              if (searchQuery) handleSearch(searchQuery);
            }}
            title="Search by Artist"
          />
        </Menu>
      </View>

      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#6200ee" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : (
        <>
          {!searchQuery && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
              <Chip
                selected={selectedCategory === null}
                onPress={() => filterByCategory(null)}
                style={styles.categoryChip}
              >
                All
              </Chip>
              {CATEGORIES.map(category => (
                <Chip
                  key={category.id}
                  selected={selectedCategory === category.id}
                  onPress={() => filterByCategory(category.id)}
                  style={styles.categoryChip}
                >
                  {category.name}
                </Chip>
              ))}
            </ScrollView>
          )}

          {activeTrack ? (
            <View style={styles.activeSession}>
              <Card style={styles.activeCard}>
                <Card.Content>
                  <Text style={styles.activeTitle}>{activeTrack.title}</Text>
                  <Text style={styles.activeSubtitle}>By {activeTrack.artist}</Text>
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
                    {isLoadingAudio ? (
                      <ActivityIndicator size="large" color="#6200ee" />
                    ) : (
                      <IconButton
                        icon={isPlaying ? "pause" : "play"}
                        size={40}
                        onPress={handlePlayPause}
                      />
                    )}
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
              <Text style={styles.title}>
                {searchQuery 
                  ? `Search Results for "${searchQuery}"`
                  : 'Guided Meditations'}
              </Text>
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
                          loading={isLoadingAudio}
                          disabled={isLoadingAudio}
                        >
                          {`${track.title} - ${track.artist}`}
                        </Button>
                      ))}
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </View>
          )}
        </>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  searchBar: {
    flex: 1,
    elevation: 2,
  },
  searchTypeButton: {
    minWidth: 100,
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  categoryChip: {
    marginRight: 8,
  },
  loadingContainer: {
    padding: 20,
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