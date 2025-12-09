import { format, differenceInDays } from 'date-fns';
import { type IllnessEpisode, type SymptomEntry, type VitalSign, type Intervention } from '../db/database';

interface EpisodeData {
  episode: IllnessEpisode;
  symptoms: SymptomEntry[];
  vitals: VitalSign[];
  interventions: Intervention[];
}

const formatTimestamp = (date: Date): string => {
  return format(date, 'MM/dd/yyyy HH:mm');
};

const groupSymptomsByType = (symptoms: SymptomEntry[]): Map<string, SymptomEntry[]> => {
  const grouped = new Map<string, SymptomEntry[]>();
  symptoms.forEach((symptom) => {
    const existing = grouped.get(symptom.symptom) || [];
    grouped.set(symptom.symptom, [...existing, symptom]);
  });
  return grouped;
};

const getTemperatureRange = (vitals: VitalSign[]): string => {
  const temps = vitals
    .filter((v) => v.type === 'temperature' && v.temperature)
    .map((v) => ({
      temp: v.temperature!,
      unit: v.temperatureUnit || 'F',
      timestamp: v.timestamp,
    }));

  if (temps.length === 0) return 'No temperature recorded';

  const maxTemp = Math.max(...temps.map((t) => t.temp));
  const minTemp = Math.min(...temps.map((t) => t.temp));
  const unit = temps[0].unit;
  const latestTemp = temps[temps.length - 1];

  if (maxTemp === minTemp) {
    return `Temperature: ${maxTemp}°${unit}`;
  }

  return `Temperature range: ${minTemp}°${unit} - ${maxTemp}°${unit} (most recent: ${latestTemp.temp}°${unit})`;
};

const formatInterventions = (interventions: Intervention[]): string => {
  if (interventions.length === 0) return 'No interventions recorded';

  const formatted = interventions.map((intervention) => {
    let base = `- ${formatTimestamp(intervention.timestamp)}: `;

    if (intervention.type === 'medication') {
      base += `${intervention.medicationName}`;
      if (intervention.dose) base += ` (${intervention.dose})`;
    } else {
      base += intervention.treatmentName;
    }

    if (intervention.effectiveness) {
      const effectMap = {
        helped: 'Helped',
        no_change: 'No change',
        made_worse: 'Made worse',
      };
      base += ` - ${effectMap[intervention.effectiveness]}`;
    }

    if (intervention.effectivenessNotes) {
      base += ` (${intervention.effectivenessNotes})`;
    }

    return base;
  });

  return formatted.join('\n');
};

export const generateMedicalSummary = (data: EpisodeData): string => {
  const { episode, symptoms, vitals, interventions } = data;

  const duration = differenceInDays(new Date(), episode.startDate);
  const durationText = duration === 0 ? 'today' : `${duration} day${duration > 1 ? 's' : ''} ago`;

  let summary = `HISTORY OF PRESENT ILLNESS\n\n`;
  summary += `Chief Complaint: ${episode.chiefComplaint}\n\n`;

  summary += `ONSET:\n`;
  summary += `Symptoms began ${durationText} (${formatTimestamp(episode.startDate)}).\n\n`;

  // Symptom progression
  summary += `SYMPTOM PROGRESSION:\n`;
  const groupedSymptoms = groupSymptomsByType(symptoms);

  groupedSymptoms.forEach((entries, symptomName) => {
    const latest = entries[entries.length - 1];
    const firstOccurrence = entries[0];

    summary += `- ${symptomName}: `;
    summary += `First noted ${formatTimestamp(firstOccurrence.timestamp)} (${firstOccurrence.severity})`;

    if (entries.length > 1) {
      summary += `, ${entries.length} total occurrences`;
    }

    if (latest.resolvedAt) {
      summary += `, resolved ${formatTimestamp(latest.resolvedAt)}`;
    } else {
      summary += `, ongoing`;
    }

    if (latest.notes) {
      summary += `\n  Notes: ${latest.notes}`;
    }

    summary += '\n';
  });

  // Vital signs
  summary += `\nVITAL SIGNS & MEASUREMENTS:\n`;
  summary += `${getTemperatureRange(vitals)}\n`;

  const breathingVitals = vitals.filter((v) => v.type === 'breathing');
  if (breathingVitals.length > 0) {
    const latest = breathingVitals[breathingVitals.length - 1];
    summary += `Breathing: `;
    if (latest.breathingRate) summary += `Rate ${latest.breathingRate}/min, `;
    if (latest.breathingDifficulty) summary += `Difficulty: ${latest.breathingDifficulty}`;
    summary += '\n';
  }

  const hydrationVitals = vitals.filter((v) => v.type === 'hydration');
  if (hydrationVitals.length > 0) {
    const latest = hydrationVitals[hydrationVitals.length - 1];
    summary += `Hydration: `;
    if (latest.wetDiapers !== undefined) summary += `${latest.wetDiapers} wet diapers, `;
    if (latest.fluidIntake) summary += `Fluid intake: ${latest.fluidIntake}`;
    summary += '\n';
  }

  const foodVitals = vitals.filter((v) => v.type === 'food');
  if (foodVitals.length > 0) {
    const latest = foodVitals[foodVitals.length - 1];
    summary += `Food intake: ${latest.foodIntake}\n`;
  }

  const sleepVitals = vitals.filter((v) => v.type === 'sleep');
  if (sleepVitals.length > 0) {
    const latest = sleepVitals[sleepVitals.length - 1];
    summary += `Sleep: `;
    if (latest.sleepDuration) summary += `${latest.sleepDuration} hours, `;
    if (latest.sleepQuality) summary += `Quality: ${latest.sleepQuality}`;
    summary += '\n';
  }

  // Interventions
  summary += `\nINTERVENTIONS & TREATMENTS:\n`;
  summary += formatInterventions(interventions);

  // Current status
  summary += `\n\nCURRENT STATUS:\n`;
  const activeSymptoms = symptoms.filter((s) => !s.resolvedAt);
  if (activeSymptoms.length > 0) {
    summary += `Active symptoms: ${activeSymptoms.map((s) => s.symptom).join(', ')}\n`;
  } else {
    summary += `No active symptoms at this time.\n`;
  }

  summary += `\nLast updated: ${formatTimestamp(episode.updatedAt)}\n`;

  summary += `\n${'='.repeat(60)}\n`;
  summary += `DISCLAIMER: This summary is for record-keeping purposes only.\n`;
  summary += `It does not constitute medical advice. Please consult with a\n`;
  summary += `qualified healthcare provider for all medical decisions.\n`;
  summary += `${'='.repeat(60)}\n`;

  return summary;
};

export const exportAsText = (data: EpisodeData, patientIdentifier: string): string => {
  const summary = generateMedicalSummary(data);
  return `Patient: ${patientIdentifier}\n${summary}`;
};
