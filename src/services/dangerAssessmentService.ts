import { format } from 'date-fns';

export interface IncidentRecord {
  id: string;
  date: Date;
  severity: number; // 1-5 scale
  description: string;
}

export interface AssessmentRecord {
  id: string;
  date: Date;
  score: number;
  riskLevel: 'variable' | 'increased' | 'severe' | 'extreme';
  incidents: IncidentRecord[];
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  weight: number;
  helpText?: string;
}

export interface AssessmentResult {
  score: number;
  riskLevel: 'variable' | 'increased' | 'severe' | 'extreme';
  interpretation: string;
  recommendations: string[];
}

// Questions from the Danger Assessment tool
export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: '1',
    question: 'Has the physical violence increased in frequency over the past year?',
    weight: 1,
    helpText: 'Consider how often incidents occur compared to previous years'
  },
  {
    id: '2',
    question: 'Has the physical violence increased in severity over the past year?',
    weight: 1,
    helpText: 'Think about whether incidents have become more intense or dangerous'
  },
  {
    id: '3',
    question: 'Does your partner own a gun?',
    weight: 2,
    helpText: 'Consider any firearms they have access to'
  },
  {
    id: '4',
    question: 'Have you left them after living together during the past year?',
    weight: 1,
    helpText: 'Include any separations, even temporary ones'
  },
  {
    id: '5',
    question: 'Is your partner unemployed?',
    weight: 1,
    helpText: 'Consider their current employment status'
  },
  {
    id: '6',
    question: 'Has your partner ever used a weapon against you or threatened you with a weapon?',
    weight: 3,
    helpText: 'Include any type of weapon or object used as a weapon'
  },
  {
    id: '7',
    question: 'Has your partner ever threatened to kill you?',
    weight: 3,
    helpText: 'Include both direct and indirect threats'
  },
  {
    id: '8',
    question: 'Has your partner ever tried to choke/strangle you?',
    weight: 3,
    helpText: 'Include any attempts to restrict breathing'
  },
  {
    id: '9',
    question: 'Does your partner use drugs?',
    weight: 1,
    helpText: 'Consider illegal drugs or misuse of prescription medications'
  },
  {
    id: '10',
    question: 'Does your partner have an alcohol problem?',
    weight: 1,
    helpText: 'Consider if alcohol affects their behavior or daily life'
  },
  {
    id: '11',
    question: 'Does your partner control most or all of your daily activities?',
    weight: 2,
    helpText: 'Think about decisions regarding friends, family, money, or going places'
  },
  {
    id: '12',
    question: 'Is your partner violently and constantly jealous of you?',
    weight: 2,
    helpText: 'Consider possessive behaviors and accusations'
  },
  {
    id: '13',
    question: 'Has your partner ever beaten you while you were pregnant?',
    weight: 3,
    helpText: 'Include any physical violence during pregnancy'
  },
  {
    id: '14',
    question: 'Has your partner ever threatened or tried to commit suicide?',
    weight: 2,
    helpText: 'Include both threats and attempts'
  },
  {
    id: '15',
    question: 'Does your partner threaten to harm your children?',
    weight: 2,
    helpText: 'Include any threats of physical or emotional harm'
  }
];

export const SAFETY_RESOURCES = {
  emergency: {
    title: 'Emergency Services',
    contacts: [
      { name: 'Emergency', number: '000' },
      { name: 'Police', number: '131 444' },
    ]
  },
  hotlines: {
    title: '24/7 Support Hotlines',
    contacts: [
      { name: '1800RESPECT', number: '1800 737 732' },
      { name: 'Lifeline', number: '13 11 14' },
      { name: 'DV Connect', number: '1800 811 811' },
    ]
  },
  support: {
    title: 'Support Services',
    contacts: [
      { name: 'Legal Aid', number: '1300 651 188' },
      { name: 'Safe Steps', number: '1800 015 188' },
      { name: 'Relationships Australia', number: '1300 364 277' },
    ]
  }
};

export const RISK_LEVEL_COLORS = {
  variable: '#4CAF50',
  increased: '#FF9800',
  severe: '#F44336',
  extreme: '#D32F2F',
};

class DangerAssessmentService {
  private incidents: IncidentRecord[] = [];
  private answers: { [key: string]: boolean } = {};
  private assessmentHistory: AssessmentRecord[] = [];

  addIncident(incident: Omit<IncidentRecord, 'id'>): IncidentRecord {
    const newIncident = {
      ...incident,
      id: Date.now().toString(),
    };
    this.incidents.push(newIncident);
    return newIncident;
  }

  updateIncident(id: string, updates: Partial<IncidentRecord>): void {
    this.incidents = this.incidents.map(incident =>
      incident.id === id ? { ...incident, ...updates } : incident
    );
  }

  deleteIncident(id: string): void {
    this.incidents = this.incidents.filter(incident => incident.id !== id);
  }

  getIncidents(): IncidentRecord[] {
    return [...this.incidents].sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  setAnswer(questionId: string, answer: boolean): void {
    this.answers[questionId] = answer;
  }

  private calculateScore(): number {
    return ASSESSMENT_QUESTIONS.reduce((score, question) => {
      return score + (this.answers[question.id] ? question.weight : 0);
    }, 0);
  }

  getAssessmentResult(): AssessmentResult {
    const score = this.calculateScore();
    const incidentCount = this.incidents.length;
    let riskLevel: AssessmentResult['riskLevel'];
    let interpretation: string;
    let recommendations: string[];

    // Score interpretation based on the Danger Assessment scoring system
    if (score < 8) {
      riskLevel = 'variable';
      interpretation = 'Your current risk level is variable. While some risk factors are present, they may not indicate immediate danger.';
      recommendations = [
        'Consider creating a safety plan',
        'Save emergency contact numbers',
        'Stay connected with trusted friends or family',
        'Document any concerning incidents',
      ];
    } else if (score < 14) {
      riskLevel = 'increased';
      interpretation = 'Your assessment indicates an increased risk level. This suggests the presence of several concerning factors.';
      recommendations = [
        'Create or review your safety plan',
        'Share your situation with trusted people',
        'Save emergency contacts in your phone',
        'Consider reaching out to support services',
        'Keep important documents in a safe place',
      ];
    } else if (score < 18) {
      riskLevel = 'severe';
      interpretation = 'Your assessment indicates a severe risk level. Multiple serious risk factors are present.';
      recommendations = [
        'Prioritize your safety plan',
        'Connect with domestic violence support services',
        'Consider legal protection options',
        'Ensure you have a safe place to go if needed',
        'Keep emergency numbers readily available',
        'Share your safety plan with trusted people',
      ];
    } else {
      riskLevel = 'extreme';
      interpretation = 'Your assessment indicates an extreme risk level. Immediate safety planning is strongly recommended.';
      recommendations = [
        'Contact domestic violence support services immediately',
        'Consider seeking legal protection',
        'Review and implement your safety plan',
        'Connect with trusted support people',
        'Keep emergency numbers accessible',
        'Consider temporary alternative accommodation',
        'Document all incidents',
      ];
    }

    const result = {
      score,
      riskLevel,
      interpretation,
      recommendations,
    };

    // Save the assessment to history
    this.saveAssessment(result);

    return result;
  }

  private saveAssessment(result: AssessmentResult): void {
    const assessment: AssessmentRecord = {
      id: Date.now().toString(),
      date: new Date(),
      score: result.score,
      riskLevel: result.riskLevel,
      incidents: [...this.incidents], // Save a copy of current incidents
    };
    this.assessmentHistory.push(assessment);
  }

  getAssessmentHistory(): AssessmentRecord[] {
    return [...this.assessmentHistory].sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  getAssessmentsByDateRange(startDate: Date, endDate: Date): AssessmentRecord[] {
    return this.assessmentHistory.filter(
      assessment => assessment.date >= startDate && assessment.date <= endDate
    );
  }

  clearAssessment(): void {
    this.incidents = [];
    this.answers = {};
  }
}

export const dangerAssessmentService = new DangerAssessmentService(); 