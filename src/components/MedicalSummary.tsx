import React, { useState, useEffect } from 'react';
import { FileText, Download, Copy, Check, LineChart } from 'lucide-react';
import { getEpisodeData, getPatient } from '../db/helpers';
import { generateMedicalSummary, exportAsText } from '../utils/medicalSummary';
import { type IllnessEpisode, type SymptomEntry, type VitalSign, type Intervention } from '../db/database';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import jsPDF from 'jspdf';

interface Props {
  episodeId: number;
}

export const MedicalSummary: React.FC<Props> = ({ episodeId }) => {
  const [episode, setEpisode] = useState<IllnessEpisode | null>(null);
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([]);
  const [vitals, setVitals] = useState<VitalSign[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [summary, setSummary] = useState('');
  const [patientIdentifier, setPatientIdentifier] = useState('');
  const [copied, setCopied] = useState(false);

  const loadData = async () => {
    const data = await getEpisodeData(episodeId);
    if (!data.episode) return;

    setEpisode(data.episode);
    setSymptoms(data.symptoms);
    setVitals(data.vitals);
    setInterventions(data.interventions);

    const summaryText = generateMedicalSummary({
      episode: data.episode,
      symptoms: data.symptoms,
      vitals: data.vitals,
      interventions: data.interventions,
    });
    setSummary(summaryText);

    const patient = await getPatient(data.episode.patientId);
    if (patient) {
      setPatientIdentifier(patient.identifier);
    }
  };

  useEffect(() => {
    loadData();
  }, [episodeId]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadText = () => {
    const fullText = exportAsText(
      { episode: episode!, symptoms, vitals, interventions },
      patientIdentifier
    );
    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical-summary-${format(new Date(), 'yyyy-MM-dd-HHmm')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const fullText = exportAsText(
      { episode: episode!, symptoms, vitals, interventions },
      patientIdentifier
    );

    doc.setFontSize(10);
    const lines = doc.splitTextToSize(fullText, 180);
    doc.text(lines, 15, 15);
    doc.save(`medical-summary-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`);
  };

  // Prepare temperature chart data
  const temperatureData = vitals
    .filter((v) => v.type === 'temperature' && v.temperature)
    .map((v) => ({
      time: format(v.timestamp, 'MM/dd HH:mm'),
      temp: v.temperature,
      unit: v.temperatureUnit,
    }))
    .reverse();

  return (
    <div className="space-y-6">
      {/* Medical Summary */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FileText className="w-8 h-8 text-primary-600" />
            <h2 className="text-3xl font-bold text-gray-900">Medical Summary</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCopy} className="btn-secondary flex items-center gap-2">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={handleDownloadText} className="btn-secondary flex items-center gap-2">
              <Download className="w-4 h-4" />
              Text
            </button>
            <button onClick={handleDownloadPDF} className="btn-primary flex items-center gap-2">
              <Download className="w-4 h-4" />
              PDF
            </button>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200 font-mono text-sm whitespace-pre-wrap overflow-x-auto">
          {summary || 'Loading summary...'}
        </div>

        <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ IMPORTANT DISCLAIMER:</strong> This summary is for record-keeping purposes
            only and does not constitute medical advice. Always consult with qualified healthcare
            providers for all medical decisions. This app does not diagnose, treat, or provide
            medical recommendations.
          </p>
        </div>
      </div>

      {/* Temperature Chart */}
      {temperatureData.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            <LineChart className="w-6 h-6 text-primary-600" />
            <h3 className="text-2xl font-bold text-gray-900">Temperature Trend</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={temperatureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis
                  domain={[
                    (dataMin: number) => Math.floor(dataMin - 1),
                    (dataMax: number) => Math.ceil(dataMax + 1),
                  ]}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="temp"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Normal ranges:</strong> Oral: 97.6-99.6°F (36.4-37.6°C) | Rectal: 98.6-100.6°F
              (37-38.1°C) | Temporal: 99.5°F (37.5°C)
            </p>
          </div>
        </div>
      )}

      {/* Symptom Duration Visualization */}
      {symptoms.length > 0 && (
        <div className="card">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Symptom Duration</h3>
          <div className="space-y-4">
            {Array.from(new Set(symptoms.map((s) => s.symptom))).map((symptomName) => {
              const symptomEntries = symptoms.filter((s) => s.symptom === symptomName);
              const firstEntry = symptomEntries[0];
              const latestEntry = symptomEntries[symptomEntries.length - 1];
              const isResolved = latestEntry.resolvedAt != null;

              return (
                <div key={symptomName} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{symptomName}</span>
                    <span className="text-sm text-gray-600">
                      {format(firstEntry.timestamp, 'MM/dd HH:mm')}
                      {isResolved && ` - ${format(latestEntry.resolvedAt!, 'MM/dd HH:mm')}`}
                    </span>
                  </div>
                  <div className="h-8 bg-gray-200 rounded-lg overflow-hidden relative">
                    <div
                      className={`h-full rounded-lg ${
                        isResolved ? 'bg-green-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: isResolved ? '100%' : '100%' }}
                    >
                      <div className="flex items-center justify-center h-full text-white text-sm font-medium">
                        {isResolved ? '✓ Resolved' : 'Active'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Intervention Effectiveness Summary */}
      {interventions.filter((i) => i.effectiveness).length > 0 && (
        <div className="card">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Intervention Effectiveness</h3>
          <div className="space-y-3">
            {interventions
              .filter((i) => i.effectiveness)
              .map((intervention, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {intervention.type === 'medication'
                        ? intervention.medicationName
                        : intervention.treatmentName}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        intervention.effectiveness === 'helped'
                          ? 'bg-green-100 text-green-800'
                          : intervention.effectiveness === 'no_change'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {intervention.effectiveness === 'helped'
                        ? '✓ Helped'
                        : intervention.effectiveness === 'no_change'
                        ? '− No Change'
                        : '✗ Made Worse'}
                    </span>
                  </div>
                  {intervention.effectivenessNotes && (
                    <p className="text-sm text-gray-600 mt-2">{intervention.effectivenessNotes}</p>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
