import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Text, Card, Button, RadioButton, Title, Divider, List, Portal, Modal } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import SafetyAssistant from '../components/SafetyAssistant';

interface Question {
  id: string;
  text: string;
  weight: number;
}

interface Recommendation {
  riskLevel: 'high' | 'medium' | 'low';
  title: string;
  actions: string[];
}

const questions: Question[] = [
  {
    id: 'physical_violence',
    text: 'Has there been physical violence in the last 6 months?',
    weight: 3,
  },
  {
    id: 'threats',
    text: 'Have there been threats of harm to you or your loved ones?',
    weight: 3,
  },
  {
    id: 'weapons',
    text: 'Does the person have access to weapons?',
    weight: 3,
  },
  {
    id: 'control',
    text: 'Do they try to control your daily activities or monitor your movements?',
    weight: 2,
  },
  {
    id: 'jealousy',
    text: 'Do they show extreme jealousy or possessiveness?',
    weight: 2,
  },
  {
    id: 'isolation',
    text: 'Have they tried to isolate you from family or friends?',
    weight: 2,
  },
  {
    id: 'financial_control',
    text: 'Do they control your access to money or resources?',
    weight: 2,
  },
  {
    id: 'children',
    text: 'Have there been threats involving children (if applicable)?',
    weight: 3,
  },
];

const recommendations: Record<string, Recommendation> = {
  high: {
    riskLevel: 'high',
    title: 'High Risk - Immediate Action Recommended',
    actions: [
      'Contact emergency services if in immediate danger (112/911)',
      'Reach out to a domestic violence hotline for support',
      'Consider seeking shelter at a safe house',
      'Prepare an emergency bag with essential documents and items',
      'Document all incidents and keep evidence in a safe place',
      'Inform trusted family members or friends about your situation',
    ],
  },
  medium: {
    riskLevel: 'medium',
    title: 'Medium Risk - Safety Planning Needed',
    actions: [
      'Create a safety plan with a professional advocate',
      'Keep important documents and emergency contacts readily available',
      'Consider legal options like protection orders',
      'Build a support network of trusted people',
      'Save money in a separate, private account if possible',
    ],
  },
  low: {
    riskLevel: 'low',
    title: 'Lower Risk - Stay Vigilant',
    actions: [
      'Continue to monitor your situation',
      'Keep a record of any concerning incidents',
      'Learn about available resources and support services',
      'Consider counseling or support groups',
      'Review and maintain healthy boundaries',
    ],
  },
};

export default function RiskAssessmentScreen() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [riskLevel, setRiskLevel] = useState<'high' | 'medium' | 'low' | null>(null);
  const [showSafetyAssistant, setShowSafetyAssistant] = useState(false);
  const navigation = useNavigation();

  const calculateRiskLevel = () => {
    let totalScore = 0;
    let maxPossibleScore = 0;

    questions.forEach(question => {
      if (answers[question.id] === 'yes') {
        totalScore += question.weight;
      }
      maxPossibleScore += question.weight;
    });

    const riskPercentage = (totalScore / maxPossibleScore) * 100;

    if (riskPercentage >= 60) {
      return 'high';
    } else if (riskPercentage >= 30) {
      return 'medium';
    }
    return 'low';
  };

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = () => {
    const level = calculateRiskLevel();
    setRiskLevel(level);
    setShowResults(true);
    if (level === 'high') {
      setShowSafetyAssistant(true);
    }
  };

  const handleStartOver = () => {
    setAnswers({});
    setShowResults(false);
    setRiskLevel(null);
  };

  const navigateToSafety = () => {
    navigation.navigate('Safety' as never);
  };

  const renderQuestions = () => (
    <>
      <Text style={styles.description}>
        Please answer the following questions honestly. Your responses are private and will help assess your current situation.
      </Text>
      {questions.map(question => (
        <Card key={question.id} style={styles.questionCard}>
          <Card.Content>
            <Text style={styles.questionText}>{question.text}</Text>
            <RadioButton.Group
              onValueChange={value => handleAnswer(question.id, value)}
              value={answers[question.id] || ''}
            >
              <View style={styles.radioGroup}>
                <RadioButton.Item label="Yes" value="yes" />
                <RadioButton.Item label="No" value="no" />
              </View>
            </RadioButton.Group>
          </Card.Content>
        </Card>
      ))}
      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.button}
        disabled={Object.keys(answers).length < questions.length}
      >
        Submit Assessment
      </Button>
    </>
  );

  const renderResults = () => {
    if (!riskLevel) return null;
    const recommendation = recommendations[riskLevel];

    return (
      <View style={styles.resultsContainer}>
        <Card style={[styles.resultCard, styles[`${riskLevel}Risk`]]}>
          <Card.Content>
            <Title style={styles.resultTitle}>{recommendation.title}</Title>
            <Divider style={styles.divider} />
            <List.Section>
              {recommendation.actions.map((action, index) => (
                <List.Item
                  key={index}
                  title={action}
                  left={props => <List.Icon {...props} icon="chevron-right" />}
                />
              ))}
            </List.Section>
          </Card.Content>
        </Card>

        {riskLevel === 'high' && (
          <Button
            mode="contained"
            onPress={() => setShowSafetyAssistant(true)}
            style={[styles.button, styles.assistantButton]}
            icon="robot"
          >
            Talk to Safety Assistant
          </Button>
        )}

        <Button
          mode="contained"
          onPress={navigateToSafety}
          style={styles.button}
        >
          Go to Safety Resources
        </Button>

        <Button
          mode="outlined"
          onPress={handleStartOver}
          style={styles.button}
        >
          Start New Assessment
        </Button>
      </View>
    );
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <Title style={styles.title}>Risk Assessment</Title>
        {!showResults ? renderQuestions() : renderResults()}
      </ScrollView>

      <Portal>
        <Modal
          visible={showSafetyAssistant}
          onDismiss={() => setShowSafetyAssistant(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <SafetyAssistant />
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
  questionCard: {
    marginBottom: 16,
    elevation: 2,
  },
  questionText: {
    fontSize: 16,
    marginBottom: 10,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    marginVertical: 10,
  },
  resultsContainer: {
    marginTop: 10,
  },
  resultCard: {
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  divider: {
    marginVertical: 10,
  },
  highRisk: {
    backgroundColor: '#ffebee',
  },
  mediumRisk: {
    backgroundColor: '#fff3e0',
  },
  lowRisk: {
    backgroundColor: '#e8f5e9',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    margin: 0,
  },
  assistantButton: {
    backgroundColor: '#1976d2',
  },
}); 