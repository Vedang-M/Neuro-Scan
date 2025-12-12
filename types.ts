export interface PatientMetrics {
  cognitiveStability: number; // 0-100
  agitationRisk: number; // 0-100
  sleepQuality: number; // 0-100
  lastAssessmentScore: number;
}

export interface MemoryItem {
  id: string;
  url: string;
  tags: string[];
  date: string;
  emotion: 'Happy' | 'Neutral' | 'Sad' | 'Nostalgic';
  description: string;
}

export interface AssessmentResult {
  date: string;
  type: 'Speech' | 'Drawing' | 'Recall';
  score: number; // 0-100
  details: Record<string, any>;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  MEMORYSCAPE = 'MEMORYSCAPE',
  ASSESSMENTS = 'ASSESSMENTS',
  AGITATION = 'AGITATION',
  VITALS = 'VITALS',
  ROUTINE = 'ROUTINE',
  FAMILY = 'FAMILY',
  CLINICIAN = 'CLINICIAN',
  NARRATIVE = 'NARRATIVE'
}

export interface User {
  name: string;
  role: 'PATIENT' | 'CAREGIVER' | 'CLINICIAN';
}