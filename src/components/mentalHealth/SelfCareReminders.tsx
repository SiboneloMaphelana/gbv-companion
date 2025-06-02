import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Switch, Button, TextInput, FAB } from 'react-native-paper';
import { TimePickerModal } from 'react-native-paper-dates';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerForPushNotificationsAsync, scheduleDailyReminder, cancelReminder, ReminderNotification } from '../../utils/notifications';

interface SelfCareActivity {
  id: string;
  title: string;
  description: string;
  isEnabled: boolean;
  time: string;
}

const defaultActivities: SelfCareActivity[] = [
  {
    id: '1',
    title: 'Morning Meditation',
    description: 'Start your day with 5 minutes of mindful breathing',
    isEnabled: false,
    time: '08:00',
  },
  {
    id: '2',
    title: 'Hydration Check',
    description: 'Remember to drink water regularly throughout the day',
    isEnabled: false,
    time: '10:00',
  },
  {
    id: '3',
    title: 'Movement Break',
    description: 'Take a short walk or stretch',
    isEnabled: false,
    time: '14:00',
  },
  {
    id: '4',
    title: 'Gratitude Practice',
    description: "Write down three things you're grateful for",
    isEnabled: false,
    time: '20:00',
  },
];

const SelfCareReminders = () => {
  const [activities, setActivities] = useState<SelfCareActivity[]>(defaultActivities);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    time: '',
  });

  useEffect(() => {
    loadActivities();
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    const token = await registerForPushNotificationsAsync();
    if (!token) {
      Alert.alert(
        'Notifications Permission',
        'Please enable notifications to receive self-care reminders.',
        [{ text: 'OK' }]
      );
    }
  };

  const loadActivities = async () => {
    try {
      const savedActivities = await AsyncStorage.getItem('selfCareActivities');
      if (savedActivities) {
        setActivities(JSON.parse(savedActivities));
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const saveActivities = async (updatedActivities: SelfCareActivity[]) => {
    try {
      await AsyncStorage.setItem('selfCareActivities', JSON.stringify(updatedActivities));
    } catch (error) {
      console.error('Error saving activities:', error);
    }
  };

  const toggleActivity = async (id: string) => {
    const updatedActivities = activities.map(activity => {
      if (activity.id === id) {
        const isEnabled = !activity.isEnabled;
        
        // Schedule or cancel notification
        if (isEnabled) {
          scheduleDailyReminder({
            id: activity.id,
            title: activity.title,
            body: activity.description,
            time: activity.time,
          });
        } else {
          cancelReminder(activity.id);
        }
        
        return { ...activity, isEnabled };
      }
      return activity;
    });
    
    setActivities(updatedActivities);
    await saveActivities(updatedActivities);
  };

  const addActivity = async () => {
    if (newActivity.title && newActivity.description && newActivity.time) {
      const newActivityItem: SelfCareActivity = {
        id: Date.now().toString(),
        ...newActivity,
        isEnabled: false,
      };

      const updatedActivities = [...activities, newActivityItem];
      setActivities(updatedActivities);
      await saveActivities(updatedActivities);
      
      setNewActivity({ title: '', description: '', time: '' });
      setShowAddActivity(false);
    }
  };

  const deleteActivity = async (id: string) => {
    const activity = activities.find(a => a.id === id);
    if (activity?.isEnabled) {
      await cancelReminder(id);
    }
    
    const updatedActivities = activities.filter(activity => activity.id !== id);
    setActivities(updatedActivities);
    await saveActivities(updatedActivities);
  };

  const onTimeConfirm = ({ hours, minutes }: { hours: number; minutes: number }) => {
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    setNewActivity({ ...newActivity, time: formattedTime });
    setShowTimePicker(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Self-Care Reminders</Text>
        
        {showAddActivity ? (
          <Card style={styles.addCard}>
            <Card.Content>
              <TextInput
                label="Activity Title"
                value={newActivity.title}
                onChangeText={(text) => setNewActivity({ ...newActivity, title: text })}
                style={styles.input}
              />
              <TextInput
                label="Description"
                value={newActivity.description}
                onChangeText={(text) => setNewActivity({ ...newActivity, description: text })}
                style={styles.input}
              />
              <Button
                mode="outlined"
                onPress={() => setShowTimePicker(true)}
                style={styles.input}
              >
                {newActivity.time || 'Set Time'}
              </Button>
              <View style={styles.buttonRow}>
                <Button onPress={() => setShowAddActivity(false)}>Cancel</Button>
                <Button mode="contained" onPress={addActivity}>
                  Add Activity
                </Button>
              </View>
            </Card.Content>
          </Card>
        ) :
          activities.map((activity) => (
            <Card key={activity.id} style={styles.activityCard}>
              <Card.Content>
                <View style={styles.activityHeader}>
                  <View style={styles.titleContainer}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    {activity.time && (
                      <Text style={styles.time}>{activity.time}</Text>
                    )}
                  </View>
                  <Switch
                    value={activity.isEnabled}
                    onValueChange={() => toggleActivity(activity.id)}
                  />
                </View>
                <Text style={styles.description}>{activity.description}</Text>
                <Button
                  mode="text"
                  onPress={() => deleteActivity(activity.id)}
                  style={styles.deleteButton}
                >
                  Remove
                </Button>
              </Card.Content>
            </Card>
          ))
        }
      </ScrollView>
      
      <TimePickerModal
        visible={showTimePicker}
        onDismiss={() => setShowTimePicker(false)}
        onConfirm={onTimeConfirm}
      />
      
      <FAB
        style={styles.fab}
        icon={showAddActivity ? 'close' : 'plus'}
        onPress={() => setShowAddActivity(!showAddActivity)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 16,
  },
  activityCard: {
    margin: 8,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  time: {
    color: '#666',
    marginTop: 4,
  },
  description: {
    color: '#444',
    marginTop: 4,
  },
  addCard: {
    margin: 8,
  },
  input: {
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  deleteButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    left: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
});

export default SelfCareReminders; 