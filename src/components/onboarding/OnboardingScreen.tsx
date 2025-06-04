import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Text, Button, Card, RadioButton } from 'react-native-paper';
import { useOnboarding } from '../../context/OnboardingContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const OnboardingScreen = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const { setOnboardingComplete, setAppIcon, currentAppIcon } = useOnboarding();

  const onboardingSteps = [
    {
      title: 'Welcome to GBV Companion',
      description: 'Your trusted personal safety companion. Swipe to learn about the key features.',
      image: require('../../../assets/welcome.svg'),
    },
    {
      title: 'Emergency Button',
      description: 'Quick access to emergency services and your trusted contacts with just one tap.',
      image: require('../../../assets/emergency.svg'),
    },
    {
      title: 'Resource Directory',
      description: 'Find local support services, shelters, and helplines in your area.',
      image: require('../../../assets/resources.svg'),
    },
    {
      title: 'Safety Planning',
      description: 'Create and maintain your personal safety plan with guided assistance.',
      image: require('../../../assets/safety.svg'),
    },
    {
      title: 'Disguise Your App',
      description: 'Choose an alternative app icon to keep your privacy secure.',
      isLastStep: true,
    },
  ];

  const handleNext = () => {
    if (currentPage < onboardingSteps.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleComplete = async () => {
    await setOnboardingComplete();
  };

  const renderDots = () => {
    return (
      <View style={styles.pagination}>
        {onboardingSteps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: currentPage === index ? '#6200ee' : '#ccc' },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderAppIconSelection = () => {
    return (
      <Card style={styles.iconCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.iconTitle}>
            Choose App Icon
          </Text>
          <RadioButton.Group
            onValueChange={(value) => setAppIcon(value as 'default' | 'weather' | 'calculator')}
            value={currentAppIcon}
          >
            <View style={styles.radioItem}>
              <RadioButton.Item label="Default Icon" value="default" />
            </View>
            <View style={styles.radioItem}>
              <RadioButton.Item label="Weather App" value="weather" />
            </View>
            <View style={styles.radioItem}>
              <RadioButton.Item label="Calculator" value="calculator" />
            </View>
          </RadioButton.Group>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const offset = e.nativeEvent.contentOffset.x;
          setCurrentPage(Math.round(offset / width));
        }}
      >
        {onboardingSteps.map((step, index) => (
          <View key={index} style={styles.slide}>
            <View style={styles.content}>
              {step.image && (
                <Image source={step.image} style={styles.image} resizeMode="contain" />
              )}
              <Text variant="headlineMedium" style={styles.title}>
                {step.title}
              </Text>
              <Text variant="bodyLarge" style={styles.description}>
                {step.description}
              </Text>
              {step.isLastStep && renderAppIconSelection()}
            </View>
          </View>
        ))}
      </ScrollView>
      {renderDots()}
      <View style={styles.buttonContainer}>
        {currentPage === onboardingSteps.length - 1 ? (
          <Button mode="contained" onPress={handleComplete} style={styles.button}>
            Get Started
          </Button>
        ) : (
          <Button mode="contained" onPress={handleNext} style={styles.button}>
            Next
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  slide: {
    width,
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
    color: '#1a1a1a',
  },
  description: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  button: {
    width: '100%',
  },
  iconCard: {
    width: '100%',
    marginTop: 20,
  },
  iconTitle: {
    marginBottom: 10,
  },
  radioItem: {
    marginVertical: 4,
  },
});

export default OnboardingScreen; 