import React, { useState, useEffect } from 'react';
import { Plus, Check } from 'lucide-react';
import { COMMON_SYMPTOMS, type Severity, type SymptomEntry } from '../db/database';
import { addSymptom, getEpisodeSymptoms, resolveSymptom } from '../db/helpers';
import { format } from 'date-fns';

interface Props {
  episodeId: number;
}

export const SymptomTracker: React.FC<Props> = ({ episodeId }) => {
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([]);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customSymptom, setCustomSymptom] = useState('');
  const [selectedSymptom, setSelectedSymptom] = useState('');
  const [severity, setSeverity] = useState<Severity>('mild');
  const [notes, setNotes] = useState('');

  const loadSymptoms = async () => {
    const data = await getEpisodeSymptoms(episodeId);
    setSymptoms(data);
  };

  useEffect(() => {
    loadSymptoms();
  }, [episodeId]);

  const handleQuickAdd = (symptom: string) => {
    setSelectedSymptom(symptom);
    setSeverity('mild');
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const symptomName = showCustomForm ? customSymptom : selectedSymptom;
    if (!symptomName.trim()) return;

    await addSymptom({
      episodeId,
      symptom: symptomName.trim(),
      severity,
      notes: notes.trim() || undefined,
      timestamp: new Date(),
    });

    await loadSymptoms();
    setSelectedSymptom('');
    setCustomSymptom('');
    setNotes('');
    setShowCustomForm(false);
  };

  const handleResolve = async (symptomId: number) => {
    await resolveSymptom(symptomId);
    await loadSymptoms();
  };

  const activeSymptoms = symptoms.filter((s) => !s.resolvedAt);
  const resolvedSymptoms = symptoms.filter((s) => s.resolvedAt);

  return (
    <div className="space-y-6">
      {/* Quick Entry Buttons */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Add Symptom</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {COMMON_SYMPTOMS.map((symptom) => (
            <button
              key={symptom}
              onClick={() => handleQuickAdd(symptom)}
              className="btn-secondary text-left justify-start h-auto py-4"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              {symptom}
            </button>
          ))}
          <button
            onClick={() => {
              setShowCustomForm(true);
              setSelectedSymptom('');
            }}
            className="btn-secondary text-left justify-start h-auto py-4 border-dashed"
          >
            <Plus className="w-5 h-5 inline mr-2" />
            Custom...
          </button>
        </div>
      </div>

      {/* Add Symptom Form */}
      {(selectedSymptom || showCustomForm) && (
        <form onSubmit={handleSubmit} className="card bg-primary-50 border-2 border-primary-300">
          <h3 className="text-xl font-semibold mb-4">
            Add: {showCustomForm ? 'Custom Symptom' : selectedSymptom}
          </h3>

          {showCustomForm && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Symptom Name
              </label>
              <input
                type="text"
                value={customSymptom}
                onChange={(e) => setCustomSymptom(e.target.value)}
                className="input-field"
                placeholder="Enter symptom name..."
                required
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
            <div className="grid grid-cols-3 gap-3">
              {(['mild', 'moderate', 'severe'] as Severity[]).map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSeverity(sev)}
                  className={`py-3 px-4 rounded-lg border-2 font-medium capitalize transition-all ${
                    severity === sev
                      ? sev === 'mild'
                        ? 'severity-mild border-yellow-400'
                        : sev === 'moderate'
                        ? 'severity-moderate border-orange-400'
                        : 'severity-severe border-red-400'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field"
              rows={3}
              placeholder="Additional details..."
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" className="btn-primary">
              Add Symptom
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedSymptom('');
                setShowCustomForm(false);
                setCustomSymptom('');
                setNotes('');
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Active Symptoms */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Symptoms</h2>
        {activeSymptoms.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No active symptoms recorded.</p>
        ) : (
          <div className="space-y-3">
            {activeSymptoms.map((symptom) => (
              <div
                key={symptom.id}
                className={`p-4 rounded-lg border-2 ${
                  symptom.severity === 'mild'
                    ? 'severity-mild'
                    : symptom.severity === 'moderate'
                    ? 'severity-moderate'
                    : 'severity-severe'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold">{symptom.symptom}</h3>
                      <span className="text-sm font-medium capitalize px-2 py-1 bg-white rounded">
                        {symptom.severity}
                      </span>
                    </div>
                    <p className="text-sm mb-2">
                      {format(symptom.timestamp, 'MMM d, yyyy h:mm a')}
                    </p>
                    {symptom.notes && (
                      <p className="text-sm mt-2 p-2 bg-white rounded">{symptom.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleResolve(symptom.id!)}
                    className="ml-4 btn-primary flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolved Symptoms */}
      {resolvedSymptoms.length > 0 && (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Resolved Symptoms</h2>
          <div className="space-y-3">
            {resolvedSymptoms.map((symptom) => (
              <div key={symptom.id} className="p-4 rounded-lg bg-gray-100 border-2 border-gray-300">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-gray-600">{symptom.symptom}</h3>
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-600">
                      Started: {format(symptom.timestamp, 'MMM d, h:mm a')}
                    </p>
                    <p className="text-sm text-gray-600">
                      Resolved: {format(symptom.resolvedAt!, 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
