import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, TextInput, Card, Chip, ProgressBar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MoodEntry {
  date: string;
  mood: string;
  journal: string;
  activities: string[];
  energyLevel: number;
}

const moods = [
  { emoji: '😊', label: 'Great' },
  { emoji: '🙂', label: 'Good' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '😔', label: 'Down' },
  { emoji: '😢', label: 'Struggling' },
];

const activities = [
  'Exercise', 'Reading', 'Meditation', 'Family Time',
  'Work', 'Social', 'Rest', 'Therapy', 'Outdoors'
];

const DailyCheckIn = () => {
  const [selectedMood, setSelectedMood] = useState('');
  const [journal, setJournal] = useState('');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [energyLevel, setEnergyLevel] = useState(0.5);
  const [recentEntries, setRecentEntries] = useState<MoodEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadRecentEntries();
  }, []);

  const loadRecentEntries = async () => {
    try {
      const entries = await AsyncStorage.getItem('moodEntries');
      if (entries) {
        setRecentEntries(JSON.parse(entries));
      }
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMood) {
      return;
    }

    const newEntry: MoodEntry = {
      date: new Date().toISOString(),
      mood: selectedMood,
      journal,
      activities: selectedActivities,
      energyLevel,
    };

    try {
      const updatedEntries = [newEntry, ...recentEntries].slice(0, 7); // Keep last 7 days
      await AsyncStorage.setItem('moodEntries', JSON.stringify(updatedEntries));
      setRecentEntries(updatedEntries);
      
      // Reset form
      setSelectedMood('');
      setJournal('');
      setSelectedActivities([]);
      setEnergyLevel(0.5);
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  const toggleActivity = (activity: string) => {
    setSelectedActivities(prev =>
      prev.includes(activity)
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.mainCard}>
        <Card.Content>
          <Text style={styles.title}>How are you feeling today?</Text>
          
          <View style={styles.moodContainer}>
            {moods.map(({ emoji, label }) => (
              <Button
                key={label}
                mode={selectedMood === `${emoji} ${label}` ? 'contained' : 'outlined'}
                onPress={() => setSelectedMood(`${emoji} ${label}`)}
                style={styles.moodButton}
              >
                {emoji} {label}
              </Button>
            ))}
          </View>

          <Text style={styles.subtitle}>Energy Level</Text>
          <ProgressBar
            progress={energyLevel}
            color="#6200ee"
            style={styles.energyBar}
          />
          <View style={styles.energyLabels}>
            <Text>Low</Text>
            <Text>High</Text>
          </View>
          <Button
            mode="text"
            onPress={() => setEnergyLevel(Math.min(1, energyLevel + 0.1))}
          >
            Increase
          </Button>
          <Button
            mode="text"
            onPress={() => setEnergyLevel(Math.max(0, energyLevel - 0.1))}
          >
            Decrease
          </Button>

          <Text style={styles.subtitle}>What have you been up to?</Text>
          <View style={styles.activitiesContainer}>
            {activities.map((activity) => (
              <Chip
                key={activity}
                selected={selectedActivities.includes(activity)}
                onPress={() => toggleActivity(activity)}
                style={styles.activityChip}
                mode="outlined"
              >
                {activity}
              </Chip>
            ))}
          </View>

          <Text style={styles.subtitle}>Journal Entry</Text>
          <TextInput
            mode="outlined"
            multiline
            numberOfLines={4}
            value={journal}
            onChangeText={setJournal}
            placeholder="How are you feeling? What's on your mind?"
            style={styles.journalInput}
          />

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.submitButton}
            disabled={!selectedMood}
          >
            Save Check-in
          </Button>
        </Card.Content>
      </Card>

      <Button
        mode="text"
        onPress={() => setShowHistory(!showHistory)}
        style={styles.historyButton}
      >
        {showHistory ? 'Hide History' : 'Show History'}
      </Button>

      {showHistory && recentEntries.map((entry, index) => (
        <Card key={entry.date} style={styles.historyCard}>
          <Card.Content>
            <Text style={styles.historyDate}>{formatDate(entry.date)}</Text>
            <Text style={styles.historyMood}>{entry.mood}</Text>
            {entry.activities.length > 0 && (
              <View style={styles.historyActivities}>
                {entry.activities.map(activity => (
                  <Chip
                    key={activity}
                    style={[styles.historyChip, { height: 24 }]}
                    textStyle={{ fontSize: 12 }}
                  >
                    {activity}
                  </Chip>
                ))}
              </View>
            )}
            {entry.journal && (
              <Text style={styles.historyJournal}>{entry.journal}</Text>
            )}
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mainCard: {
    margin: 16,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
  },
  moodContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  moodButton: {
    marginVertical: 4,
  },
  energyBar: {
    height: 8,
    borderRadius: 4,
  },
  energyLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  activitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  activityChip: {
    marginBottom: 8,
  },
  journalInput: {
    marginBottom: 20,
  },
  submitButton: {
    marginTop: 10,
    paddingVertical: 8,
  },
  historyButton: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  historyCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  historyMood: {
    fontSize: 20,
    marginVertical: 8,
  },
  historyActivities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginVertical: 8,
  },
  historyChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  historyJournal: {
    marginTop: 8,
    color: '#444',
    fontStyle: 'italic',
  },
});

export default DailyCheckIn; 