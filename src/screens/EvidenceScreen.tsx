import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Card, Title, FAB, Portal, Dialog, Button, IconButton, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Audio, Video, ResizeMode } from 'expo-av';
import * as FileSystem from 'expo-file-system';

const { width } = Dimensions.get('window');

interface MediaItem {
  id: string;
  uri: string;
  type: 'image' | 'video' | 'audio';
  timestamp: string;
  name?: string;
}

export default function EvidenceScreen() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingItemId, setPlayingItemId] = useState<string | null>(null);
  const [fabOpen, setFabOpen] = useState(false);

  useEffect(() => {
    loadMediaItems();
    setupAudio();
    
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Error setting up audio:', error);
    }
  };

  const loadMediaItems = async () => {
    try {
      const evidenceDirUri = `${FileSystem.documentDirectory}evidence/`;
      const dirInfo = await FileSystem.getInfoAsync(evidenceDirUri);
      
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(evidenceDirUri, { intermediates: true });
      }

      const files = await FileSystem.readDirectoryAsync(evidenceDirUri);
      const items = await Promise.all(
        files.map(async (filename) => {
          const uri = `${evidenceDirUri}${filename}`;
          let type: 'image' | 'video' | 'audio' = 'image';
          if (filename.toLowerCase().includes('video') || filename.endsWith('.mp4') || filename.endsWith('.mov')) {
            type = 'video';
          } else if (filename.toLowerCase().includes('audio') || filename.endsWith('.m4a') || filename.endsWith('.mp3')) {
            type = 'audio';
          }
          
          return {
            id: filename,
            uri,
            type,
            timestamp: new Date().toISOString(),
          };
        })
      );
      
      // Sort by timestamp, newest first
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setMediaItems(items);
    } catch (error) {
      console.error('Error loading media items:', error);
    }
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const { status: audioStatus } = await Audio.requestPermissionsAsync();
    
    return cameraStatus === 'granted' && 
           libraryStatus === 'granted' && 
           audioStatus === 'granted';
  };

  const takePhoto = async () => {
    if (!(await requestPermissions())) {
      console.log('Permissions not granted');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const filename = `image_${Date.now()}.jpg`;
        const destUri = `${FileSystem.documentDirectory}evidence/${filename}`;
        
        await FileSystem.copyAsync({
          from: asset.uri,
          to: destUri,
        });

        const newItem: MediaItem = {
          id: filename,
          uri: destUri,
          type: 'image',
          timestamp: new Date().toISOString(),
        };

        setMediaItems(prev => [newItem, ...prev]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  const recordVideo = async () => {
    if (!(await requestPermissions())) {
      console.log('Permissions not granted');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
        allowsEditing: false,
        videoMaxDuration: 30, // 30 seconds max
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const filename = `video_${Date.now()}.mp4`;
        const destUri = `${FileSystem.documentDirectory}evidence/${filename}`;
        
        await FileSystem.copyAsync({
          from: asset.uri,
          to: destUri,
        });

        const newItem: MediaItem = {
          id: filename,
          uri: destUri,
          type: 'video',
          timestamp: new Date().toISOString(),
        };

        setMediaItems(prev => [newItem, ...prev]);
      }
    } catch (error) {
      console.error('Error recording video:', error);
    }
  };

  const startRecording = async () => {
    if (!(await requestPermissions())) {
      console.log('Permissions not granted');
      return;
    }

    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        const filename = `audio_${Date.now()}.m4a`;
        const destUri = `${FileSystem.documentDirectory}evidence/${filename}`;
        
        await FileSystem.copyAsync({
          from: uri,
          to: destUri,
        });

        const newItem: MediaItem = {
          id: filename,
          uri: destUri,
          type: 'audio',
          timestamp: new Date().toISOString(),
        };

        setMediaItems(prev => [newItem, ...prev]);
      }

      setRecording(null);
    } catch (error) {
      console.error('Error stopping recording:', error);
      setRecording(null);
    }
  };

  const playAudio = async (uri: string, itemId: string) => {
    try {
      // Stop any currently playing audio
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setIsPlaying(true);
      setPlayingItemId(itemId);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          if (status.didJustFinish) {
            setIsPlaying(false);
            setPlayingItemId(null);
          }
        }
      });

    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      setPlayingItemId(null);
    }
  };

  const stopAudio = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
      setIsPlaying(false);
      setPlayingItemId(null);
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  const deleteMedia = async (item: MediaItem) => {
    try {
      // Stop audio if it's the item being deleted
      if (playingItemId === item.id && sound) {
        await stopAudio();
      }

      await FileSystem.deleteAsync(item.uri);
      setMediaItems(prev => prev.filter(i => i.id !== item.id));
      setSelectedMedia(null);
      setViewerVisible(false);
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  };

  const openViewer = (item: MediaItem) => {
    setSelectedMedia(item);
    setViewerVisible(true);
  };

  const closeViewer = () => {
    setViewerVisible(false);
    setSelectedMedia(null);
  };

  const renderMediaItem = ({ item }: { item: MediaItem }) => (
    <TouchableOpacity
      onPress={() => openViewer(item)}
      style={styles.mediaItemContainer}
    >
      <Card style={styles.mediaCard}>
        <Card.Content style={styles.cardContent}>
          {item.type === 'image' && (
            <Image source={{ uri: item.uri }} style={styles.thumbnail} />
          )}
          
          {item.type === 'video' && (
            <View style={styles.videoContainer}>
              <View style={styles.videoThumbnail}>
                <IconButton
                  icon="play-circle"
                  size={60}
                  iconColor="#2196F3"
                />
                <Text style={styles.videoLabel}>Video Recording</Text>
              </View>
            </View>
          )}
          
          {item.type === 'audio' && (
            <View style={styles.audioContainer}>
              <IconButton
                icon={playingItemId === item.id && isPlaying ? 'pause-circle' : 'play-circle'}
                size={60}
                iconColor="#2196F3"
                onPress={() => {
                  if (playingItemId === item.id && isPlaying) {
                    stopAudio();
                  } else {
                    playAudio(item.uri, item.id);
                  }
                }}
              />
              <Text style={styles.audioLabel}>Audio Recording</Text>
            </View>
          )}
          
          <View style={styles.mediaInfo}>
            <Text style={styles.mediaType}>{item.type.toUpperCase()}</Text>
            <Text style={styles.timestamp}>
              {new Date(item.timestamp).toLocaleString()}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={mediaItems}
        renderItem={renderMediaItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <Portal>
        <Dialog 
          visible={viewerVisible} 
          onDismiss={closeViewer}
          style={styles.dialog}
        >
          <Dialog.Content style={styles.dialogContent}>
            {selectedMedia && (
              <>
                {selectedMedia.type === 'image' && (
                  <Image 
                    source={{ uri: selectedMedia.uri }} 
                    style={styles.fullImage}
                    resizeMode={ResizeMode.CONTAIN}
                  />
                )}
                
                {selectedMedia.type === 'video' && (
                  <Video
                    source={{ uri: selectedMedia.uri }}
                    style={styles.fullVideo}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    shouldPlay={false}
                  />
                )}
                
                {selectedMedia.type === 'audio' && (
                  <View style={styles.fullAudioContainer}>
                    <IconButton
                      icon={playingItemId === selectedMedia.id && isPlaying ? 'pause-circle' : 'play-circle'}
                      size={80}
                      iconColor="#2196F3"
                      onPress={() => {
                        if (playingItemId === selectedMedia.id && isPlaying) {
                          stopAudio();
                        } else {
                          playAudio(selectedMedia.uri, selectedMedia.id);
                        }
                      }}
                    />
                    <Text style={styles.fullAudioLabel}>
                      {playingItemId === selectedMedia.id && isPlaying ? 'Playing...' : 'Tap to play audio'}
                    </Text>
                  </View>
                )}
                
                <Text style={styles.dialogTimestamp}>
                  {new Date(selectedMedia.timestamp).toLocaleString()}
                </Text>
              </>
            )}
          </Dialog.Content>
          
          <Dialog.Actions>
            <Button 
              mode="outlined" 
              onPress={() => selectedMedia && deleteMedia(selectedMedia)}
              textColor="#f44336"
            >
              Delete
            </Button>
            <Button mode="contained" onPress={closeViewer}>
              Close
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB.Group
        open={fabOpen}
        visible
        icon={fabOpen ? 'close' : 'plus'}
        actions={[
          {
            icon: 'camera',
            label: 'Take Photo',
            onPress: takePhoto,
          },
          {
            icon: 'video',
            label: 'Record Video',
            onPress: recordVideo,
          },
          {
            icon: recording ? 'stop' : 'microphone',
            label: recording ? 'Stop Recording' : 'Record Audio',
            onPress: recording ? stopRecording : startRecording,
            style: recording ? { backgroundColor: '#f44336' } : undefined,
          },
        ]}
        onStateChange={({ open }) => setFabOpen(open)}
        style={styles.fab}
      />
      
      {recording && (
        <View style={styles.recordingIndicator}>
          <Text style={styles.recordingText}>🔴 Recording...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 16,
    paddingBottom: 100, // Space for FAB
  },
  mediaItemContainer: {
    marginBottom: 12,
  },
  mediaCard: {
    elevation: 2,
    borderRadius: 8,
  },
  cardContent: {
    padding: 12,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  videoContainer: {
    position: 'relative',
  },
  videoThumbnail: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2196F3',
    borderStyle: 'dashed',
  },
  videoLabel: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  audioContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2196F3',
    borderStyle: 'dashed',
  },
  audioLabel: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  mediaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  mediaType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2196F3',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  dialog: {
    maxHeight: '80%',
  },
  dialogContent: {
    paddingHorizontal: 0,
  },
  fullImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  fullVideo: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  fullAudioContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginVertical: 16,
  },
  fullAudioLabel: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  dialogTimestamp: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  recordingIndicator: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  recordingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});