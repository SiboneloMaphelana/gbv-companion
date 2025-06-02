import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import DailyCheckIn from '../components/mentalHealth/DailyCheckIn';
import BreathingExercises from '../components/mentalHealth/BreathingExercises';
import MeditationGuides from '../components/mentalHealth/MeditationGuides';
import CrisisResources from '../components/mentalHealth/CrisisResources';
import SelfCareReminders from '../components/mentalHealth/SelfCareReminders';

const Tab = createMaterialTopTabNavigator();

const MentalHealthScreen = () => {
  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          tabBarScrollEnabled: true,
          tabBarLabelStyle: styles.tabLabel,
          tabBarStyle: styles.tabBar,
          tabBarIndicatorStyle: styles.tabIndicator,
        }}
      >
        <Tab.Screen name="Check-In" component={DailyCheckIn} />
        <Tab.Screen name="Breathing" component={BreathingExercises} />
        <Tab.Screen name="Meditation" component={MeditationGuides} />
        <Tab.Screen name="Crisis Help" component={CrisisResources} />
        <Tab.Screen name="Self-Care" component={SelfCareReminders} />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabLabel: {
    fontSize: 12,
    textTransform: 'none',
  },
  tabBar: {
    backgroundColor: '#fff',
    elevation: 0,
    shadowOpacity: 0,
  },
  tabIndicator: {
    backgroundColor: '#6200ee',
  },
});

export default MentalHealthScreen; 