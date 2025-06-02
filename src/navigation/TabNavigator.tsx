import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { IconButton } from 'react-native-paper';
import { DefaultTheme } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Import screens
import LegalGuidanceScreen from '../screens/LegalGuidanceScreen';
import JournalScreen from '../screens/JournalScreen';
import ResourcesScreen from '../screens/ResourcesScreen';
import SafetyScreen from '../screens/SafetyScreen';
import RiskAssessmentScreen from '../screens/RiskAssessmentScreen';
import EmergencyContactsScreen from '../screens/EmergencyContactsScreen';
import MentalHealthScreen from '../screens/MentalHealthScreen';
import { EmergencyScreen } from '../screens/EmergencyScreen';

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
    <Tab.Navigator 
      screenOptions={screenOptions}
      initialRouteName="Safety"
    >
      <Tab.Screen 
        name="Risk Check" 
        component={RiskAssessmentScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="analytics-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Safety" 
        component={SafetyScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="shield" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Emergency" 
        component={EmergencyScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="hospital-marker" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Mental Health" 
        component={MentalHealthScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="heart-pulse" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Legal Guide" 
        component={LegalGuidanceScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="scale-balance" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Journal" 
        component={JournalScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="book" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Resources" 
        component={ResourcesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="help-circle" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Contacts"
        component={EmergencyContactsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="phone-alert" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
} 