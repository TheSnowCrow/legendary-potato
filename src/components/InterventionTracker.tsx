import React, { useState, useEffect } from 'react';
import { Pill, Stethoscope, Plus } from 'lucide-react';
import { COMMON_MEDICATIONS, COMMON_TREATMENTS, type Intervention, type Effectiveness } from '../db/database';
import { addIntervention, getEpisodeInterventions, updateInterventionEffectiveness } from '../db/helpers';
import { format, formatDistanceToNow } from 'date-fns';

interface Props {
  episodeId: number;
}

export const InterventionTracker: React.FC<Props> = ({ episodeId }) => {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [activeType, setActiveType] = useState<'medication' | 'treatment' | null>(null);
  const [showCustom, setShowCustom] = useState(false);

  // Medication state
  const [medicationName, setMedicationName] = useState('');
  const [customMedication, setCustomMedication] = useState('');
  const [dose, setDose] = useState('');

  // Treatment state
  const [treatmentName, setTreatmentName] = useState('');
  const [customTreatment, setCustomTreatment] = useState('');

  const [notes, setNotes] = useState('');

  const loadInterventions = async () => {
    const data = await getEpisodeInterventions(episodeId);
    setInterventions(data);
  };

  useEffect(() => {
    loadInterventions();
  }, [episodeId]);

  const resetForm = () => {
    setActiveType(null);
    setShowCustom(false);
    setMedicationName('');
    setCustomMedication('');
    setDose('');
    setTreatmentName('');
    setCustomTreatment('');
    setNotes('');
  };

  const handleQuickAdd = (type: 'medication' | 'treatment', name: string) => {
    setActiveType(type);
    setShowCustom(false);
    if (type === 'medication') {
      setMedicationName(name);
    } else {
      setTreatmentName(name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeType) return;

    const intervention: Omit<Intervention, 'id'> = {
      episodeId,
      type: activeType,
      timestamp: new Date(),
      notes: notes.trim() || undefined,
    };

    if (activeType === 'medication') {
      intervention.medicationName = showCustom ? customMedication.trim() : medicationName;
      intervention.dose = dose.trim() || undefined;
    } else {
      intervention.treatmentName = showCustom ? customTreatment.trim() : treatmentName;
    }

    await addIntervention(intervention);
    await loadInterventions();
    resetForm();
  };

  const handleUpdateEffectiveness = async (
    id: number,
    effectiveness: Effectiveness,
    effectivenessNotes?: string
  ) => {
    await updateInterventionEffectiveness(id, effectiveness, effectivenessNotes);
    await loadInterventions();
  };

  const renderForm = () => {
    if (!activeType) return null;

    return (
      <form onSubmit={handleSubmit} className="card bg-primary-50 border-2 border-primary-300">
        <h3 className="text-xl font-semibold mb-4 capitalize">Log {activeType}</h3>

        {activeType === 'medication' && (
          <>
            {showCustom ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medication Name *
                </label>
                <input
                  type="text"
                  value={customMedication}
                  onChange={(e) => setCustomMedication(e.target.value)}
                  className="input-field"
                  placeholder="Enter medication name..."
                  required
                />
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected: <strong>{medicationName}</strong>
                </label>
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dose (e.g., "5ml", "1 tablet", "100mg")
              </label>
              <input
                type="text"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                className="input-field"
                placeholder="Enter dose..."
              />
            </div>
          </>
        )}

        {activeType === 'treatment' && (
          <>
            {showCustom ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Treatment Name *
                </label>
                <input
                  type="text"
                  value={customTreatment}
                  onChange={(e) => setCustomTreatment(e.target.value)}
                  className="input-field"
                  placeholder="Enter treatment name..."
                  required
                />
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected: <strong>{treatmentName}</strong>
                </label>
              </div>
            )}
          </>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input-field"
            rows={2}
            placeholder="Additional details..."
          />
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary">
            Log {activeType}
          </button>
          <button type="button" onClick={resetForm} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    );
  };

  const recentInterventions = interventions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Quick Entry - Medications */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Pill className="w-6 h-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">Medications</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {COMMON_MEDICATIONS.map((med) => (
            <button
              key={med}
              onClick={() => handleQuickAdd('medication', med)}
              className="btn-secondary text-left justify-start h-auto py-3"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              {med}
            </button>
          ))}
          <button
            onClick={() => {
              setActiveType('medication');
              setShowCustom(true);
            }}
            className="btn-secondary text-left justify-start h-auto py-3 border-dashed"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Custom...
          </button>
        </div>
      </div>

      {/* Quick Entry - Treatments */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Stethoscope className="w-6 h-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">Treatments</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {COMMON_TREATMENTS.map((treatment) => (
            <button
              key={treatment}
              onClick={() => handleQuickAdd('treatment', treatment)}
              className="btn-secondary text-left justify-start h-auto py-3"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              {treatment}
            </button>
          ))}
          <button
            onClick={() => {
              setActiveType('treatment');
              setShowCustom(true);
            }}
            className="btn-secondary text-left justify-start h-auto py-3 border-dashed"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Custom...
          </button>
        </div>
      </div>

      {renderForm()}

      {/* Medication Timing Helper */}
      {recentInterventions.some((i) => i.type === 'medication') && (
        <div className="card bg-blue-50 border-2 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            ⏰ Last Medication Times
          </h3>
          <div className="space-y-2">
            {recentInterventions
              .filter((i) => i.type === 'medication')
              .slice(0, 3)
              .map((intervention) => (
                <div key={intervention.id} className="p-3 bg-white rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{intervention.medicationName}</p>
                      {intervention.dose && (
                        <p className="text-sm text-gray-600">{intervention.dose}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-700">
                        {formatDistanceToNow(intervention.timestamp, { addSuffix: true })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(intervention.timestamp, 'h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recent Interventions */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Interventions</h2>
        {interventions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No interventions recorded yet.
          </p>
        ) : (
          <div className="space-y-3">
            {interventions.map((intervention) => (
              <div key={intervention.id} className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {intervention.type === 'medication' ? (
                        <Pill className="w-5 h-5 text-primary-600" />
                      ) : (
                        <Stethoscope className="w-5 h-5 text-primary-600" />
                      )}
                      <h3 className="text-lg font-semibold">
                        {intervention.type === 'medication'
                          ? intervention.medicationName
                          : intervention.treatmentName}
                      </h3>
                    </div>
                    {intervention.dose && (
                      <p className="text-sm text-gray-700 mb-1">Dose: {intervention.dose}</p>
                    )}
                    <p className="text-sm text-gray-600">
                      {format(intervention.timestamp, 'MMM d, yyyy h:mm a')}
                      <span className="ml-2 text-gray-500">
                        ({formatDistanceToNow(intervention.timestamp, { addSuffix: true })})
                      </span>
                    </p>
                    {intervention.notes && (
                      <p className="text-sm mt-2 p-2 bg-white rounded border border-gray-200">
                        {intervention.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Effectiveness Tracking */}
                <div className="border-t border-gray-300 pt-3 mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">How effective was this?</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(['helped', 'no_change', 'made_worse'] as Effectiveness[]).map((eff) => (
                      <button
                        key={eff}
                        onClick={() => handleUpdateEffectiveness(intervention.id!, eff)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          intervention.effectiveness === eff
                            ? eff === 'helped'
                              ? 'bg-green-500 text-white'
                              : eff === 'no_change'
                              ? 'bg-gray-500 text-white'
                              : 'bg-red-500 text-white'
                            : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {eff === 'helped' ? '✓ Helped' : eff === 'no_change' ? '− No Change' : '✗ Made Worse'}
                      </button>
                    ))}
                  </div>
                  {intervention.effectivenessNotes && (
                    <p className="text-sm mt-2 p-2 bg-white rounded border border-gray-200">
                      {intervention.effectivenessNotes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
