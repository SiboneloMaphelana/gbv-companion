import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Button } from 'react-native-paper';

const breathingPatterns = [
  { name: '4-7-8 Breathing', inhale: 4, hold: 7, exhale: 8 },
  { name: 'Box Breathing', inhale: 4, hold: 4, exhale: 4 },
  { name: 'Deep Breathing', inhale: 5, hold: 2, exhale: 5 },
];

const BreathingExercises = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentPattern, setCurrentPattern] = useState(breathingPatterns[0]);
  const [phase, setPhase] = useState('ready');
  const animation = useRef(new Animated.Value(0)).current;

  const startBreathing = () => {
    setIsActive(true);
    runBreathingAnimation();
  };

  const stopBreathing = () => {
    setIsActive(false);
    setPhase('ready');
    animation.setValue(0);
  };

  const runBreathingAnimation = () => {
    const { inhale, hold, exhale } = currentPattern;
    const sequence = [
      Animated.timing(animation, {
        toValue: 1,
        duration: inhale * 1000,
        useNativeDriver: true,
      }),
      Animated.delay(hold * 1000),
      Animated.timing(animation, {
        toValue: 0,
        duration: exhale * 1000,
        useNativeDriver: true,
      }),
    ];

    Animated.sequence(sequence).start(() => {
      if (isActive) {
        runBreathingAnimation();
      }
    });
  };

  useEffect(() => {
    return () => {
      stopBreathing();
    };
  }, []);

  const animatedStyle = {
    transform: [
      {
        scale: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.5],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{currentPattern.name}</Text>
      
      <View style={styles.circleContainer}>
        <Animated.View style={[styles.circle, animatedStyle]} />
        <Text style={styles.instructions}>
          {isActive ? `${phase}...` : 'Press Start to begin'}
        </Text>
      </View>

      <View style={styles.controls}>
        <Button
          mode="contained"
          onPress={isActive ? stopBreathing : startBreathing}
          style={styles.button}
        >
          {isActive ? 'Stop' : 'Start'}
        </Button>
      </View>

      <View style={styles.patternSelector}>
        {breathingPatterns.map((pattern) => (
          <Button
            key={pattern.name}
            mode={currentPattern.name === pattern.name ? 'contained' : 'outlined'}
            onPress={() => {
              stopBreathing();
              setCurrentPattern(pattern);
            }}
            style={styles.patternButton}
          >
            {pattern.name}
          </Button>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  circleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#6200ee',
    opacity: 0.3,
  },
  instructions: {
    marginTop: 20,
    fontSize: 18,
    textAlign: 'center',
  },
  controls: {
    marginVertical: 20,
  },
  button: {
    paddingHorizontal: 32,
  },
  patternSelector: {
    width: '100%',
    marginBottom: 20,
  },
  patternButton: {
    marginVertical: 4,
  },
});

export default BreathingExercises; 