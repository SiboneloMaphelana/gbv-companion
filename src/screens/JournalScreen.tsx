import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Animated } from 'react-native';
import { Audio } from 'expo-av';
import * as SecureStore from 'expo-secure-store';
import { Card, Title, Paragraph, Button, IconButton, Portal, Dialog, TextInput } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface JournalEntry {
  id: string;
  timestamp: string;
  audioUri?: string;
  duration: number;
  name?: string;
}

export default function JournalScreen() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [renameDialogVisible, setRenameDialogVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [newName, setNewName] = useState('');
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    loadEntries();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      // Start the recording duration counter
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      // Start the pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      setRecordingDuration(0);
      pulseAnim.setValue(1);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording]);

  const loadEntries = async () => {
    try {
      const entriesJson = await SecureStore.getItemAsync('journal_entries');
      if (entriesJson) {
        setEntries(JSON.parse(entriesJson));
      }
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        const newEntry: JournalEntry = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          audioUri: uri,
          duration: recordingDuration,
        };

        const updatedEntries = [...entries, newEntry];
        await SecureStore.setItemAsync('journal_entries', JSON.stringify(updatedEntries));
        setEntries(updatedEntries);
      }

      setRecording(null);
      setIsRecording(false);
      setRecordingDuration(0);
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const playSound = async (audioUri: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: audioUri });
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const deleteEntry = async (entry: JournalEntry) => {
    try {
      const updatedEntries = entries.filter(e => e.id !== entry.id);
      await SecureStore.setItemAsync('journal_entries', JSON.stringify(updatedEntries));
      setEntries(updatedEntries);
      setDeleteDialogVisible(false);
      setSelectedEntry(null);
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const renameEntry = async () => {
    if (!selectedEntry || !newName.trim()) return;

    try {
      const updatedEntries = entries.map(entry => 
        entry.id === selectedEntry.id 
          ? { ...entry, name: newName.trim() }
          : entry
      );
      await SecureStore.setItemAsync('journal_entries', JSON.stringify(updatedEntries));
      setEntries(updatedEntries);
      setRenameDialogVisible(false);
      setSelectedEntry(null);
      setNewName('');
    } catch (error) {
      console.error('Error renaming entry:', error);
    }
  };

  const handleRename = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setNewName(entry.name || `Recording ${new Date(entry.timestamp).toLocaleDateString()}`);
    setRenameDialogVisible(true);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderItem = ({ item }: { item: JournalEntry }) => (
    <Card style={styles.entryCard}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.entryHeader}>
          <View style={styles.entryInfo}>
            <Title style={styles.entryTitle}>{item.name || `Recording ${new Date(item.timestamp).toLocaleDateString()}`}</Title>
            <View style={styles.detailsRow}>
              <Paragraph style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Paragraph>
              <Paragraph style={styles.duration}>• {formatDuration(item.duration)}</Paragraph>
            </View>
          </View>
          <View style={styles.entryControls}>
            <IconButton
              icon={props => <Ionicons name="play-circle" size={22} color={props.color} />}
              size={22}
              style={styles.controlButton}
              onPress={() => item.audioUri && playSound(item.audioUri)}
            />
            <IconButton
              icon="pencil"
              size={18}
              style={styles.controlButton}
              onPress={() => handleRename(item)}
            />
            <IconButton
              icon="delete"
              size={18}
              style={styles.controlButton}
              onPress={() => {
                setSelectedEntry(item);
                setDeleteDialogVisible(true);
              }}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Card style={styles.recordCard}>
        <Card.Content>
          <Title>Voice Journal</Title>
          <Paragraph>Record your thoughts safely and securely.</Paragraph>
          {isRecording && (
            <View style={styles.recordingInfo}>
              <Animated.View style={[styles.recordingIndicator, { transform: [{ scale: pulseAnim }] }]} />
              <Paragraph>Recording: {formatDuration(recordingDuration)}</Paragraph>
            </View>
          )}
          <Button
            mode="contained"
            onPress={isRecording ? stopRecording : startRecording}
            style={styles.recordButton}
            icon={isRecording ? 'stop' : 'microphone'}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Button>
        </Card.Content>
      </Card>

      <FlatList
        data={entries}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
      />

      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
        >
          <Dialog.Title>Delete Recording</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Are you sure you want to delete this recording?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={() => selectedEntry && deleteEntry(selectedEntry)}>Delete</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={renameDialogVisible}
          onDismiss={() => {
            setRenameDialogVisible(false);
            setNewName('');
          }}
        >
          <Dialog.Title>Rename Recording</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Recording Name"
              value={newName}
              onChangeText={setNewName}
              mode="outlined"
              style={styles.renameInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setRenameDialogVisible(false);
              setNewName('');
            }}>Cancel</Button>
            <Button onPress={renameEntry}>Rename</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  recordCard: {
    margin: 18,
    elevation: 4,
  },
  recordButton: {
    marginTop: 16,
  },
  list: {
    flex: 1,
  },
  entryCard: {
    marginHorizontal: 8,
    marginBottom: 6,
    elevation: 1,
  },
  cardContent: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryInfo: {
    flex: 1,
    marginRight: 4,
  },
  entryTitle: {
    fontSize: 16,
    lineHeight: 18,
    marginBottom: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timestamp: {
    fontSize: 15,
    color: '#666',
  },
  duration: {
    fontSize: 14,
    color: '#666',
  },
  entryControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: -8,
  },
  controlButton: {
    margin: 0,
    marginHorizontal: -2,
  },
  recordingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'red',
  },
  renameInput: {
    marginTop: 8,
  },
}); 