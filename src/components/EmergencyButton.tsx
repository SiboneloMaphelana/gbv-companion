import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Portal, FAB } from 'react-native-paper';
import { useEmergency } from '../context/EmergencyContext';

export default function EmergencyButton() {
  const { triggerEmergency } = useEmergency();

  return (
    <Portal>
      <FAB
        icon="phone-alert"
        style={styles.fab}
        color="#fff"
        customSize={56}
        mode="elevated"
        animated={true}
        theme={{ colors: { primaryContainer: '#ff3b30' } }}
        onPress={triggerEmergency}
        onLongPress={triggerEmergency}
      />
    </Portal>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80, // Above tab bar
  },
}); 