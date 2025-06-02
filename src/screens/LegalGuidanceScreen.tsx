import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, View, Linking } from 'react-native';
import { Card, Title, Paragraph, Button, List, Divider, IconButton, Searchbar, Chip, Portal, Modal, TextInput } from 'react-native-paper';

interface ChecklistItem {
  text: string;
  link: string | null;
}

interface ChecklistTemplate {
  title: string;
  items: ChecklistItem[];
}

interface CommonQuestion {
  question: string;
  answer: string;
  relatedActions: string[];
}

const legalSections = [
  {
    id: 'rights',
    title: '📜 Your Legal Rights',
    icon: 'scale-balance',
    content: 'Under South African law, you have the following rights:',
    subsections: [
      {
        title: 'Constitutional Rights',
        content: 'Right to dignity, safety, and freedom from all forms of violence (Section 12 of Constitution)',
        actions: ['Report violation of rights', 'Seek legal representation']
      },
      {
        title: 'Domestic Violence Act Rights',
        content: 'Protection against physical, sexual, emotional, economic abuse, harassment, and stalking',
        actions: ['Apply for protection order', 'Report breaches of protection order']
      },
      {
        title: 'Criminal Law Rights',
        content: 'Right to lay criminal charges for assault, rape, or other forms of abuse',
        actions: ['Open criminal case', 'Request victim support services']
      }
    ]
  },
  {
    id: 'immediate_steps',
    title: '🛡️ What to Do if You\'re Abused',
    icon: 'alert-octagon',
    content: 'Important steps to take immediately after abuse:',
    subsections: [
      {
        title: 'Ensure Immediate Safety',
        content: 'Get to a safe place and contact trusted people or emergency services',
        actions: [
          'Call SAPS Emergency: 10111',
          'Contact GBV Command Centre: 0800 428 428',
          'Save emergency numbers on speed dial'
        ]
      },
      {
        title: 'Document Everything',
        content: 'Keep detailed records of incidents, including:',
        actions: [
          'Take photos of injuries',
          'Save threatening messages/emails',
          'Write down dates and details of incidents',
          'Keep copies of medical reports'
        ]
      },
      {
        title: 'Seek Medical Attention',
        content: 'Visit the nearest hospital or clinic for examination and documentation',
        actions: [
          'Request J88 form for legal evidence',
          'Ask for copy of medical report',
          'Get referral to counseling services'
        ]
      }
    ]
  },
  {
    id: 'protection_order',
    title: '🧾 How to Get a Protection Order',
    icon: 'file-document',
    content: 'Step-by-step guide to obtaining a protection order:',
    subsections: [
      {
        title: 'Step 1: Application',
        content: 'Visit your nearest Magistrate\'s Court to apply for a protection order',
        actions: [
          'Bring your ID document',
          'Provide abuser\'s details and address',
          'Describe the abuse in detail',
          'Bring supporting evidence if available'
        ]
      },
      {
        title: 'Step 2: Interim Order',
        content: 'The court can issue an interim (temporary) protection order immediately',
        actions: [
          'Understand interim order conditions',
          'Keep copies of all documents',
          'Know return date for final order'
        ]
      },
      {
        title: 'Step 3: Service and Final Order',
        content: 'Police will serve the order to the abuser, and a final hearing will be scheduled',
        actions: [
          'Attend the final hearing',
          'Bring additional evidence',
          'Request court support services'
        ]
      }
    ]
  },
  {
    id: 'police_reporting',
    title: '🕵️ Reporting to the Police',
    icon: 'police-badge',
    content: 'Guidelines for reporting abuse to the police:',
    subsections: [
      {
        title: 'At the Police Station',
        content: 'You have the right to open a case at any police station',
        actions: [
          'Ask for a female officer if preferred',
          'Request case number immediately',
          'Ask for victim support services',
          'Request copy of your statement'
        ]
      },
      {
        title: 'Following Up',
        content: 'Keep track of your case:',
        actions: [
          'Note investigating officer\'s details',
          'Follow up regularly on case progress',
          'Report any new incidents',
          'Contact station commander if unhappy with service'
        ]
      }
    ]
  },
  {
    id: 'court_process',
    title: '🧑‍⚖️ Going to Court',
    icon: 'gavel',
    content: 'Understanding the court process:',
    subsections: [
      {
        title: 'Preparation',
        content: 'Getting ready for court:',
        actions: [
          'Organize all evidence and documents',
          'Prepare your testimony',
          'Arrange for witnesses',
          'Request court preparation services'
        ]
      },
      {
        title: 'Court Day',
        content: 'What to expect and do in court:',
        actions: [
          'Arrive early',
          'Dress appropriately',
          'Bring all documents',
          'Request interpreter if needed'
        ]
      }
    ]
  },
  {
    id: 'legal_aid',
    title: '🧰 Legal Aid & Support Services',
    icon: 'lifebuoy',
    content: 'Free and low-cost legal assistance:',
    subsections: [
      {
        title: 'Legal Aid South Africa',
        content: 'Free legal services for qualifying individuals',
        actions: [
          'Call 0800 110 110 for assistance',
          'Visit nearest Legal Aid office',
          'Check qualification criteria'
        ]
      },
      {
        title: 'NGO Support',
        content: 'Organizations providing legal and support services:',
        actions: [
          'POWA: 011 642 4345',
          'LvA: 087 150 7130',
          'Rape Crisis: 021 447 1467'
        ]
      }
    ]
  },
  {
    id: 'documents',
    title: '📄 Sample Documents',
    icon: 'file-document-multiple',
    content: 'Important legal documents and forms:',
    subsections: [
      {
        title: 'Protection Order Forms',
        content: 'Download and complete these forms:',
        actions: [
          'Form 1: Application for Protection Order',
          'Form 2: Interim Protection Order',
          'Form 3: Notice to Respondent'
        ]
      },
      {
        title: 'Affidavit Templates',
        content: 'Guidelines for writing affidavits:',
        actions: [
          'Download affidavit template',
          'View sample statements',
          'Get commissioner of oaths locations'
        ]
      }
    ]
  }
];

const commonQuestions: CommonQuestion[] = [
  {
    question: "Can I report my partner?",
    answer: "Yes, you can report your partner for any form of abuse. Domestic violence is a crime in South Africa, regardless of your relationship status. You can:\n\n• Report to any police station\n• Get a protection order\n• Contact the GBV Command Centre\n\nYou have the right to be protected, even if you live with the abuser.",
    relatedActions: ['police_reporting', 'protection_order']
  },
  {
    question: "What if I'm threatened not to report?",
    answer: "Threats to prevent reporting are a criminal offense. You can:\n\n• Report these threats to the police\n• Include them in your protection order application\n• Get emergency assistance\n\nYour safety is the priority - there are organizations ready to help you.",
    relatedActions: ['immediate_steps', 'legal_aid']
  },
  {
    question: "Do I need evidence to report abuse?",
    answer: "While evidence helps, you can still report abuse without it. Types of evidence that can help:\n\n• Photos of injuries\n• Medical reports\n• Witness statements\n• Messages/emails\n• Voice recordings\n\nThe police must accept your complaint even without evidence.",
    relatedActions: ['police_reporting', 'documents']
  }
];

const checklistTemplates: Record<string, ChecklistTemplate> = {
  court_preparation: {
    title: "Court Preparation Checklist",
    items: [
      { text: "Gather all evidence documents", link: "documents" },
      { text: "Organize witness statements", link: "court_process" },
      { text: "Make copies of all documents", link: "documents" },
      { text: "Note court date and time", link: "court_process" },
      { text: "Arrange transport to court", link: "court_process" },
      { text: "Request time off work if needed", link: null },
      { text: "Arrange childcare if needed", link: null },
      { text: "Contact witness support service", link: "legal_aid" }
    ]
  },
  protection_order: {
    title: "Protection Order Checklist",
    items: [
      { text: "Collect evidence of abuse", link: "documents" },
      { text: "Get ID document ready", link: "protection_order" },
      { text: "Write detailed abuse statement", link: "documents" },
      { text: "Get abuser's address/details", link: "protection_order" },
      { text: "Find nearest Magistrate's Court", link: "legal_aid" },
      { text: "Arrange support person to accompany you", link: "legal_aid" }
    ]
  }
};

export default function LegalGuidanceScreen() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [expandedSubsection, setExpandedSubsection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showQA, setShowQA] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<CommonQuestion | null>(null);
  const [showChecklist, setShowChecklist] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<ChecklistTemplate | null>(null);
  const [customQuestion, setCustomQuestion] = useState('');

  const handleEmergencyCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    // Auto-expand sections that match the search
    if (query) {
      const matchingSection = legalSections.find(section =>
        section.title.toLowerCase().includes(query.toLowerCase()) ||
        section.content.toLowerCase().includes(query.toLowerCase()) ||
        section.subsections.some(sub =>
          sub.title.toLowerCase().includes(query.toLowerCase()) ||
          sub.content.toLowerCase().includes(query.toLowerCase())
        )
      );
      if (matchingSection) {
        setExpandedSection(matchingSection.id);
      }
    }
  }, []);

  const handleQuestionSelect = (question: any) => {
    setSelectedQuestion(question);
    setShowQA(true);
  };

  const handleChecklistSelect = (type: keyof typeof checklistTemplates) => {
    setSelectedChecklist(checklistTemplates[type]);
    setShowChecklist(true);
  };

  const filteredSections = legalSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.subsections.some(sub =>
      sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.actions.some(action =>
        action.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
  );

  return (
    <>
      <ScrollView style={styles.container}>
        <Card style={styles.introCard}>
          <Card.Content>
            <Title>Legal Rights & Support Guide</Title>
            <Paragraph>
              This comprehensive guide will help you understand your legal rights and options in South Africa. 
              All information is confidential and available offline.
            </Paragraph>
            <Button
              mode="contained"
              icon="phone"
              onPress={() => handleEmergencyCall('10111')}
              style={styles.emergencyButton}
            >
              Emergency: Call 10111
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.searchCard}>
          <Card.Content>
            <Searchbar
              placeholder="Search for help (e.g., 'protection order', 'report abuse')"
              onChangeText={handleSearch}
              value={searchQuery}
              style={styles.searchbar}
            />
          </Card.Content>
        </Card>

        <Card style={styles.interactiveCard}>
          <Card.Content>
            <Title>Need Quick Help?</Title>
            <View style={styles.questionButtons}>
              <Button
                mode="outlined"
                onPress={() => setShowQA(true)}
                style={styles.actionButton}
                icon="help-circle"
              >
                Ask Legal Questions
              </Button>
              <Button
                mode="outlined"
                onPress={() => handleChecklistSelect('court_preparation')}
                style={styles.actionButton}
                icon="checkbox-marked"
              >
                Generate Checklist
              </Button>
            </View>
          </Card.Content>
        </Card>

        {filteredSections.map((section) => (
          <View key={section.id} style={styles.sectionContainer}>
            <List.Accordion
              title={section.title}
              left={props => <List.Icon {...props} icon={section.icon} />}
              expanded={expandedSection === section.id}
              onPress={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
              style={styles.accordion}
            >
              <Card style={styles.sectionCard}>
                <Card.Content>
                  <Paragraph style={styles.sectionContent}>{section.content}</Paragraph>
                  {section.subsections.map((subsection, index) => (
                    <View key={index}>
                      <List.Accordion
                        title={subsection.title}
                        style={styles.subAccordion}
                        expanded={expandedSubsection === `${section.id}-${index}`}
                        onPress={() => setExpandedSubsection(expandedSubsection === `${section.id}-${index}` ? null : `${section.id}-${index}`)}
                      >
                        <Paragraph style={styles.subsectionContent}>
                          {subsection.content}
                        </Paragraph>
                        <Divider style={styles.divider} />
                        {subsection.actions.map((action, actionIndex) => (
                          <List.Item
                            key={actionIndex}
                            title={action}
                            left={props => <List.Icon {...props} icon="chevron-right" />}
                            style={styles.actionItem}
                          />
                        ))}
                      </List.Accordion>
                      {index < section.subsections.length - 1 && <Divider />}
                    </View>
                  ))}
                </Card.Content>
              </Card>
            </List.Accordion>
          </View>
        ))}
      </ScrollView>

      <Portal>
        <Modal
          visible={showQA}
          onDismiss={() => {
            setShowQA(false);
            setSelectedQuestion(null);
            setCustomQuestion('');
          }}
          contentContainerStyle={styles.modal}
        >
          <ScrollView>
            <Card>
              <Card.Content>
                <Title>Legal Q&A Assistant</Title>
                <TextInput
                  label="Ask your question"
                  value={customQuestion}
                  onChangeText={setCustomQuestion}
                  style={styles.input}
                />
                <Button
                  mode="contained"
                  onPress={() => {/* TODO: Handle custom question */}}
                  style={styles.modalButton}
                >
                  Get Answer
                </Button>
                <Divider style={styles.divider} />
                <Title style={styles.subtitle}>Common Questions:</Title>
                {commonQuestions.map((q, index) => (
                  <Card key={index} style={styles.questionCard}>
                    <Card.Content>
                      <Paragraph style={styles.question}>{q.question}</Paragraph>
                      {selectedQuestion === q && (
                        <>
                          <Paragraph style={styles.answer}>{q.answer}</Paragraph>
                          <View style={styles.relatedActions}>
                            {q.relatedActions.map((action, i) => (
                              <Chip
                                key={i}
                                onPress={() => {
                                  setShowQA(false);
                                  setExpandedSection(action);
                                }}
                                style={styles.chip}
                              >
                                View Related Info
                              </Chip>
                            ))}
                          </View>
                        </>
                      )}
                      {selectedQuestion !== q && (
                        <Button
                          mode="text"
                          onPress={() => setSelectedQuestion(q)}
                        >
                          Show Answer
                        </Button>
                      )}
                    </Card.Content>
                  </Card>
                ))}
              </Card.Content>
            </Card>
          </ScrollView>
        </Modal>

        <Modal
          visible={showChecklist}
          onDismiss={() => {
            setShowChecklist(false);
            setSelectedChecklist(null);
          }}
          contentContainerStyle={styles.modal}
        >
          <ScrollView>
            <Card>
              <Card.Content>
                <Title>{selectedChecklist?.title || 'Checklist'}</Title>
                <View style={styles.checklistTypes}>
                  <Button
                    mode="outlined"
                    onPress={() => handleChecklistSelect('court_preparation')}
                    style={styles.checklistTypeButton}
                  >
                    Court Preparation
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => handleChecklistSelect('protection_order')}
                    style={styles.checklistTypeButton}
                  >
                    Protection Order
                  </Button>
                </View>
                {selectedChecklist?.items.map((item: ChecklistItem, index: number) => (
                  <List.Item
                    key={index}
                    title={item.text}
                    left={props => <List.Icon {...props} icon="checkbox-blank-outline" />}
                    right={() => item.link && (
                      <Button
                        mode="text"
                        onPress={() => {
                          setShowChecklist(false);
                          setExpandedSection(item.link);
                        }}
                      >
                        Learn More
                      </Button>
                    )}
                  />
                ))}
              </Card.Content>
            </Card>
          </ScrollView>
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  introCard: {
    margin: 16,
    elevation: 4,
  },
  emergencyButton: {
    marginTop: 16,
    backgroundColor: '#d32f2f',
  },
  sectionContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  accordion: {
    backgroundColor: '#fff',
    elevation: 2,
  },
  subAccordion: {
    backgroundColor: '#f8f8f8',
    paddingLeft: 8,
  },
  sectionCard: {
    marginTop: 1,
  },
  sectionContent: {
    marginBottom: 16,
  },
  subsectionContent: {
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  divider: {
    marginVertical: 8,
  },
  actionItem: {
    paddingLeft: 16,
  },
  searchCard: {
    margin: 16,
    marginTop: 0,
  },
  searchbar: {
    elevation: 0,
  },
  interactiveCard: {
    margin: 16,
    marginTop: 0,
  },
  questionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  modal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  input: {
    marginBottom: 16,
  },
  modalButton: {
    marginVertical: 8,
  },
  subtitle: {
    fontSize: 18,
    marginVertical: 8,
  },
  questionCard: {
    marginVertical: 8,
  },
  question: {
    fontWeight: 'bold',
  },
  answer: {
    marginTop: 8,
  },
  relatedActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    margin: 4,
  },
  checklistTypes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  checklistTypeButton: {
    flex: 1,
    marginHorizontal: 4,
  },
}); 