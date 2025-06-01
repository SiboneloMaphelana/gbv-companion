import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { DefaultTheme } from 'react-native-paper';
import { IconButton } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

// Import screens
import LegalGuidanceScreen from '../screens/LegalGuidanceScreen';
import JournalScreen from '../screens/JournalScreen';
import ResourcesScreen from '../screens/ResourcesScreen';
import SafetyScreen from '../screens/SafetyScreen';

const Tab = createBottomTabNavigator();

// Custom theme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',
    accent: '#03dac4',
    background: '#f6f6f6',
    surface: '#ffffff',
    text: '#000000',
    error: '#B00020',
  },
};

export default function TabNavigator() {
  const { signOut } = useAuth();

  const screenOptions = {
    tabBarActiveTintColor: theme.colors.primary,
    tabBarInactiveTintColor: 'gray',
    headerStyle: {
      backgroundColor: theme.colors.primary,
    },
    headerTintColor: '#fff',
    headerRight: () => (
      <IconButton
        icon="logout"
        iconColor="#fff"
        size={24}
        onPress={signOut}
      />
    ),
  };

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen 
        name="Legal Guide" 
        component={LegalGuidanceScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Journal" 
        component={JournalScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="journal-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Resources" 
        component={ResourcesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Safety" 
        component={SafetyScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shield-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
} 