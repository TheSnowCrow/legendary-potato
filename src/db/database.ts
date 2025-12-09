import Dexie, { type Table } from 'dexie';

export type Severity = 'mild' | 'moderate' | 'severe';
export type TemperatureUnit = 'F' | 'C';
export type TemperatureMethod = 'oral' | 'rectal' | 'temporal' | 'axillary';
export type Effectiveness = 'helped' | 'no_change' | 'made_worse';

export interface Patient {
  id?: number;
  identifier: string; // "Child 1", "Child 2", or custom emoji/name
  emoji?: string;
  createdAt: Date;
  archived?: boolean;
}

export interface IllnessEpisode {
  id?: number;
  patientId: number;
  startDate: Date;
  endDate?: Date;
  chiefComplaint: string;
  status: 'active' | 'resolved' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface SymptomEntry {
  id?: number;
  episodeId: number;
  symptom: string;
  severity: Severity;
  notes?: string;
  timestamp: Date;
  resolvedAt?: Date;
}

export interface VitalSign {
  id?: number;
  episodeId: number;
  type: 'temperature' | 'breathing' | 'hydration' | 'food' | 'sleep';
  timestamp: Date;
  // Temperature specific
  temperature?: number;
  temperatureUnit?: TemperatureUnit;
  temperatureMethod?: TemperatureMethod;
  // Breathing specific
  breathingRate?: number;
  breathingDifficulty?: Severity;
  // Hydration specific
  wetDiapers?: number;
  fluidIntake?: string;
  // Food specific
  foodIntake?: 'normal' | 'reduced' | 'refusing';
  // Sleep specific
  sleepDuration?: number; // hours
  sleepQuality?: 'good' | 'fair' | 'poor';
  notes?: string;
}

export interface Intervention {
  id?: number;
  episodeId: number;
  type: 'medication' | 'treatment';
  timestamp: Date;
  // Medication specific
  medicationName?: string;
  dose?: string;
  // Treatment specific
  treatmentName?: string;
  // Both
  effectiveness?: Effectiveness;
  effectivenessNotes?: string;
  notes?: string;
}

export class SymptomTrackerDB extends Dexie {
  patients!: Table<Patient, number>;
  illnessEpisodes!: Table<IllnessEpisode, number>;
  symptomEntries!: Table<SymptomEntry, number>;
  vitalSigns!: Table<VitalSign, number>;
  interventions!: Table<Intervention, number>;

  constructor() {
    super('SymptomTrackerDB');

    this.version(1).stores({
      patients: '++id, identifier, createdAt, archived',
      illnessEpisodes: '++id, patientId, startDate, endDate, status, createdAt',
      symptomEntries: '++id, episodeId, symptom, timestamp, resolvedAt',
      vitalSigns: '++id, episodeId, type, timestamp',
      interventions: '++id, episodeId, type, timestamp',
    });
  }
}

export const db = new SymptomTrackerDB();

// Common symptoms for quick entry
export const COMMON_SYMPTOMS = [
  'Fever',
  'Cough',
  'Runny Nose',
  'Congestion',
  'Vomiting',
  'Diarrhea',
  'Rash',
  'Ear Pain',
  'Sore Throat',
  'Difficulty Breathing',
  'Lethargy',
  'Irritability',
  'Loss of Appetite',
];

// Common medications
export const COMMON_MEDICATIONS = [
  'Acetaminophen (Tylenol)',
  'Ibuprofen (Motrin/Advil)',
  'Antibiotics',
  'Antihistamine',
  'Cough Medicine',
  'Decongestant',
];

// Common treatments
export const COMMON_TREATMENTS = [
  'Albuterol/Nebulizer',
  'Nasal Suctioning',
  'Humidifier',
  'Cooling Measures',
  'Increased Fluids',
  'Rest',
];
