import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export interface ReminderNotification {
  id: string;
  title: string;
  body: string;
  time: string; // HH:mm format
}

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
    severity: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

// Request permissions
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('self-care-reminders', {
      name: 'Self-Care Reminders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return null;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
  }

  return token;
}

// Schedule a daily reminder
export async function scheduleDailyReminder(reminder: ReminderNotification) {
  const [hours, minutes] = reminder.time.split(':').map(Number);
  
  // Cancel any existing notification with the same ID
  await Notifications.cancelScheduledNotificationAsync(reminder.id);

  // Create trigger for the specified time
  const trigger: Notifications.DailyTriggerInput = {
    hour: hours,
    minute: minutes,
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
  };

  // Schedule the notification
  await Notifications.scheduleNotificationAsync({
    identifier: reminder.id,
    content: {
      title: reminder.title,
      body: reminder.body,
      sound: true,
    },
    trigger,
  });

  return reminder.id;
}

// Cancel a scheduled reminder
export async function cancelReminder(id: string) {
  await Notifications.cancelScheduledNotificationAsync(id);
}

// Get all scheduled reminders
export async function getScheduledReminders() {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  return scheduledNotifications;
} 