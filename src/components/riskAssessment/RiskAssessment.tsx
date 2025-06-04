import React, { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Linking } from 'react-native';
import { Text, Card, Button, Portal, Modal, TextInput, IconButton, List, Divider, ProgressBar, Title, Paragraph } from 'react-native-paper';
import { Calendar, DateData } from 'react-native-calendars';
import { format } from 'date-fns';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import {
  dangerAssessmentService,
  ASSESSMENT_QUESTIONS,
  SAFETY_RESOURCES,
  IncidentRecord,
  AssessmentResult
} from '../../services/dangerAssessmentService';

type RootStackParamList = {
  RiskCheck: undefined;
  Journal: undefined;
};

const RiskAssessment = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentDescription, setIncidentDescription] = useState('');
  const [incidentSeverity, setIncidentSeverity] = useState(1);
  const [currentStep, setCurrentStep] = useState<'calendar' | 'questions' | 'results'>('calendar');
  const [answers, setAnswers] = useState<{ [key: string]: boolean }>({});
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);

  const handleDateSelect = (date: string) => {
    setSelectedDate(new Date(date));
    setShowIncidentModal(true);
  };

  const handleAddIncident = () => {
    if (selectedDate && incidentDescription) {
      const newIncident = dangerAssessmentService.addIncident({
        date: selectedDate,
        severity: incidentSeverity,
        description: incidentDescription,
      });
      setIncidents(dangerAssessmentService.getIncidents());
      setShowIncidentModal(false);
      setIncidentDescription('');
      setIncidentSeverity(1);
      setSelectedDate(null);
    }
  };

  const handleDeleteIncident = (id: string) => {
    dangerAssessmentService.deleteIncident(id);
    setIncidents(dangerAssessmentService.getIncidents());
  };

  const handleAnswer = (questionId: string, answer: boolean) => {
    dangerAssessmentService.setAnswer(questionId, answer);
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleComplete = () => {
    const result = dangerAssessmentService.getAssessmentResult();
    setAssessmentResult(result);
    setCurrentStep('results');
    navigation.navigate('RiskCheck');
  };

  const getMarkedDates = () => {
    const markedDates: any = {};
    incidents.forEach(incident => {
      const dateStr = format(incident.date, 'yyyy-MM-dd');
      markedDates[dateStr] = {
        marked: true,
        dotColor: getSeverityColor(incident.severity),
      };
    });
    return markedDates;
  };

  const getSeverityColor = (severity: number) => {
    const colors = ['#4CAF50', '#8BC34A', '#FFEB3B', '#FF9800', '#F44336'];
    return colors[severity - 1] || colors[0];
  };

  const handleCallSupport = useCallback((number: string) => {
    Linking.openURL(`tel:${number}`);
  }, []);

  const renderCalendarStep = () => (
    <View>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Incident Calendar</Title>
          <Paragraph>Mark dates where incidents occurred. This helps track patterns over time.</Paragraph>
        </Card.Content>
      </Card>

      <Calendar
        markedDates={getMarkedDates()}
        onDayPress={(day: DateData) => handleDateSelect(day.dateString)}
        theme={{
          todayTextColor: '#6200ee',
          selectedDayBackgroundColor: '#6200ee',
        }}
      />

      <View style={styles.incidentList}>
        <Title>Recorded Incidents</Title>
        {incidents.map(incident => (
          <Card key={incident.id} style={styles.incidentCard}>
            <Card.Content>
              <View style={styles.incidentHeader}>
                <Text>{format(incident.date, 'MMM d, yyyy')}</Text>
                <IconButton
                  icon="delete"
                  size={20}
                  onPress={() => handleDeleteIncident(incident.id)}
                />
              </View>
              <Text>Severity: {incident.severity}/5</Text>
              <Text>{incident.description}</Text>
            </Card.Content>
          </Card>
        ))}
      </View>

      <Button
        mode="contained"
        onPress={() => setCurrentStep('questions')}
        style={styles.button}
      >
        Continue to Assessment
      </Button>
    </View>
  );

  const renderQuestionsStep = () => (
    <View>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Danger Assessment Questions</Title>
          <Paragraph>Please answer the following questions honestly. Your responses are private and help assess risk levels.</Paragraph>
        </Card.Content>
      </Card>

      {ASSESSMENT_QUESTIONS.map(question => (
        <Card key={question.id} style={styles.questionCard}>
          <Card.Content>
            <Text style={styles.question}>{question.question}</Text>
            {question.helpText && (
              <Text style={styles.helpText}>{question.helpText}</Text>
            )}
            <View style={styles.answerButtons}>
              <Button
                mode={answers[question.id] === true ? 'contained' : 'outlined'}
                onPress={() => handleAnswer(question.id, true)}
                style={styles.answerButton}
              >
                Yes
              </Button>
              <Button
                mode={answers[question.id] === false ? 'contained' : 'outlined'}
                onPress={() => handleAnswer(question.id, false)}
                style={styles.answerButton}
              >
                No
              </Button>
            </View>
          </Card.Content>
        </Card>
      ))}

      <Button
        mode="contained"
        onPress={handleComplete}
        style={styles.button}
      >
        Complete Assessment
      </Button>
    </View>
  );

  const renderResultsStep = () => {
    if (!assessmentResult) return null;

    const getRiskLevelColor = (level: string) => {
      switch (level) {
        case 'variable': return '#4CAF50';
        case 'increased': return '#FF9800';
        case 'severe': return '#F44336';
        case 'extreme': return '#D32F2F';
        default: return '#000000';
      }
    };

    return (
      <View>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Assessment Results</Title>
            <View style={styles.riskLevel}>
              <Text style={[styles.riskLevelText, { color: getRiskLevelColor(assessmentResult.riskLevel) }]}>
                {assessmentResult.riskLevel.toUpperCase()} RISK
              </Text>
            </View>
            <Paragraph style={styles.interpretation}>
              {assessmentResult.interpretation}
            </Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Recommended Actions</Title>
            {assessmentResult.recommendations.map((recommendation, index) => (
              <List.Item
                key={index}
                title={recommendation}
                left={props => <List.Icon {...props} icon="check-circle" />}
              />
            ))}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Support Resources</Title>
            {Object.entries(SAFETY_RESOURCES).map(([key, category]) => (
              <View key={key}>
                <Text style={styles.resourceCategory}>{category.title}</Text>
                {category.contacts.map((contact, index) => (
                  <List.Item
                    key={index}
                    title={contact.name}
                    description={contact.number}
                    left={props => <List.Icon {...props} icon="phone" />}
                    onPress={() => handleCallSupport(contact.number)}
                    style={styles.contactItem}
                  />
                ))}
                <Divider />
              </View>
            ))}
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={() => {
            dangerAssessmentService.clearAssessment();
            setIncidents([]);
            setAnswers({});
            setAssessmentResult(null);
            setCurrentStep('calendar');
          }}
          style={styles.button}
        >
          Start New Assessment
        </Button>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {currentStep === 'calendar' && renderCalendarStep()}
      {currentStep === 'questions' && renderQuestionsStep()}
      {currentStep === 'results' && renderResultsStep()}

      <Portal>
        <Modal
          visible={showIncidentModal}
          onDismiss={() => setShowIncidentModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Title>Record Incident</Title>
          <TextInput
            label="Description"
            value={incidentDescription}
            onChangeText={setIncidentDescription}
            multiline
            style={styles.input}
          />
          <Text>Severity (1-5):</Text>
          <View style={styles.severityContainer}>
            {[1, 2, 3, 4, 5].map(level => (
              <Button
                key={level}
                mode={incidentSeverity === level ? 'contained' : 'outlined'}
                onPress={() => setIncidentSeverity(level)}
                style={styles.severityButton}
              >
                {level}
              </Button>
            ))}
          </View>
          <Button mode="contained" onPress={handleAddIncident} style={styles.button}>
            Add Incident
          </Button>
        </Modal>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  button: {
    marginVertical: 16,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  input: {
    marginVertical: 8,
  },
  severityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  severityButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  incidentList: {
    marginTop: 16,
  },
  incidentCard: {
    marginVertical: 8,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionCard: {
    marginVertical: 8,
  },
  question: {
    fontSize: 16,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  answerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  answerButton: {
    width: '40%',
  },
  riskLevel: {
    alignItems: 'center',
    marginVertical: 16,
  },
  riskLevelText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  interpretation: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  resourceCategory: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  contactItem: {
    paddingVertical: 4,
  },
});

export default RiskAssessment; 