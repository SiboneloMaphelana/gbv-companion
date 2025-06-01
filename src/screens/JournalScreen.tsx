import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Audio } from 'expo-av';
import * as SecureStore from 'expo-secure-store';
import { Card, Title, Paragraph, Button, IconButton, List } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface JournalEntry {
  id: string;
  timestamp: string;
  audioUri?: string;
  duration: number;
}

export default function JournalScreen() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    loadEntries();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

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
          duration: 0, // You could calculate actual duration if needed
        };

        const updatedEntries = [...entries, newEntry];
        await SecureStore.setItemAsync('journal_entries', JSON.stringify(updatedEntries));
        setEntries(updatedEntries);
      }

      setRecording(null);
      setIsRecording(false);
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

  const renderItem = ({ item }: { item: JournalEntry }) => (
    <Card style={styles.entryCard}>
      <Card.Content>
        <View style={styles.entryHeader}>
          <Title>Voice Note</Title>
          <Paragraph>{new Date(item.timestamp).toLocaleString()}</Paragraph>
        </View>
        <IconButton
          icon={props => <Ionicons name="play-circle" size={32} color={props.color} />}
          size={32}
          onPress={() => item.audioUri && playSound(item.audioUri)}
        />
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Card style={styles.recordCard}>
        <Card.Content>
          <Title>Voice Journal</Title>
          <Paragraph>Record your thoughts safely and securely.</Paragraph>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  recordCard: {
    margin: 16,
    elevation: 4,
  },
  recordButton: {
    marginTop: 16,
  },
  list: {
    flex: 1,
  },
  entryCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}); 