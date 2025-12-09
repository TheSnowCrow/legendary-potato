import { db, type Patient, type IllnessEpisode, type SymptomEntry, type VitalSign, type Intervention } from './database';

// Patient operations
export const createPatient = async (identifier: string, emoji?: string): Promise<number> => {
  return await db.patients.add({
    identifier,
    emoji,
    createdAt: new Date(),
    archived: false,
  });
};

export const getActivePatients = async (): Promise<Patient[]> => {
  return await db.patients.where('archived').equals(0).toArray();
};

export const getAllPatients = async (): Promise<Patient[]> => {
  return await db.patients.toArray();
};

export const getPatient = async (id: number): Promise<Patient | undefined> => {
  return await db.patients.get(id);
};

export const archivePatient = async (id: number): Promise<void> => {
  await db.patients.update(id, { archived: true });
};

// Illness Episode operations
export const createIllnessEpisode = async (
  patientId: number,
  chiefComplaint: string
): Promise<number> => {
  const now = new Date();
  return await db.illnessEpisodes.add({
    patientId,
    startDate: now,
    chiefComplaint,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  });
};

export const getActiveEpisodes = async (patientId: number): Promise<IllnessEpisode[]> => {
  return await db.illnessEpisodes
    .where('patientId')
    .equals(patientId)
    .and((episode) => episode.status === 'active')
    .toArray();
};

export const getEpisode = async (id: number): Promise<IllnessEpisode | undefined> => {
  return await db.illnessEpisodes.get(id);
};

export const updateEpisode = async (
  id: number,
  updates: Partial<IllnessEpisode>
): Promise<void> => {
  await db.illnessEpisodes.update(id, {
    ...updates,
    updatedAt: new Date(),
  });
};

export const resolveEpisode = async (id: number): Promise<void> => {
  await db.illnessEpisodes.update(id, {
    status: 'resolved',
    endDate: new Date(),
    updatedAt: new Date(),
  });
};

export const archiveEpisode = async (id: number): Promise<void> => {
  await db.illnessEpisodes.update(id, {
    status: 'archived',
    updatedAt: new Date(),
  });
};

// Symptom operations
export const addSymptom = async (symptom: Omit<SymptomEntry, 'id'>): Promise<number> => {
  return await db.symptomEntries.add(symptom);
};

export const getEpisodeSymptoms = async (episodeId: number): Promise<SymptomEntry[]> => {
  return await db.symptomEntries
    .where('episodeId')
    .equals(episodeId)
    .reverse()
    .sortBy('timestamp');
};

export const resolveSymptom = async (id: number): Promise<void> => {
  await db.symptomEntries.update(id, { resolvedAt: new Date() });
};

// Vital Signs operations
export const addVitalSign = async (vital: Omit<VitalSign, 'id'>): Promise<number> => {
  return await db.vitalSigns.add(vital);
};

export const getEpisodeVitals = async (episodeId: number): Promise<VitalSign[]> => {
  return await db.vitalSigns
    .where('episodeId')
    .equals(episodeId)
    .reverse()
    .sortBy('timestamp');
};

export const getTemperatureReadings = async (episodeId: number): Promise<VitalSign[]> => {
  return await db.vitalSigns
    .where('episodeId')
    .equals(episodeId)
    .and((vital) => vital.type === 'temperature')
    .reverse()
    .sortBy('timestamp');
};

// Intervention operations
export const addIntervention = async (
  intervention: Omit<Intervention, 'id'>
): Promise<number> => {
  return await db.interventions.add(intervention);
};

export const getEpisodeInterventions = async (episodeId: number): Promise<Intervention[]> => {
  return await db.interventions
    .where('episodeId')
    .equals(episodeId)
    .reverse()
    .sortBy('timestamp');
};

export const updateInterventionEffectiveness = async (
  id: number,
  effectiveness: Intervention['effectiveness'],
  notes?: string
): Promise<void> => {
  await db.interventions.update(id, {
    effectiveness,
    effectivenessNotes: notes,
  });
};

// Get all data for an episode (for export/summary)
export const getEpisodeData = async (episodeId: number) => {
  const [episode, symptoms, vitals, interventions] = await Promise.all([
    getEpisode(episodeId),
    getEpisodeSymptoms(episodeId),
    getEpisodeVitals(episodeId),
    getEpisodeInterventions(episodeId),
  ]);

  return {
    episode,
    symptoms,
    vitals,
    interventions,
  };
};

// Delete all data (for privacy/reset)
export const clearAllData = async (): Promise<void> => {
  await db.transaction('rw', [db.patients, db.illnessEpisodes, db.symptomEntries, db.vitalSigns, db.interventions], async () => {
    await db.patients.clear();
    await db.illnessEpisodes.clear();
    await db.symptomEntries.clear();
    await db.vitalSigns.clear();
    await db.interventions.clear();
  });
};
