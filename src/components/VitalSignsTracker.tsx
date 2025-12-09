import React, { useState, useEffect } from 'react';
import { Thermometer, Wind, Droplets, Utensils, Moon } from 'lucide-react';
import { type VitalSign, type TemperatureUnit, type TemperatureMethod, type Severity } from '../db/database';
import { addVitalSign, getEpisodeVitals } from '../db/helpers';
import { format } from 'date-fns';

interface Props {
  episodeId: number;
}

type VitalType = 'temperature' | 'breathing' | 'hydration' | 'food' | 'sleep';

export const VitalSignsTracker: React.FC<Props> = ({ episodeId }) => {
  const [vitals, setVitals] = useState<VitalSign[]>([]);
  const [activeType, setActiveType] = useState<VitalType | null>(null);

  // Temperature state
  const [temperature, setTemperature] = useState('');
  const [tempUnit, setTempUnit] = useState<TemperatureUnit>('F');
  const [tempMethod, setTempMethod] = useState<TemperatureMethod>('temporal');

  // Breathing state
  const [breathingRate, setBreathingRate] = useState('');
  const [breathingDifficulty, setBreathingDifficulty] = useState<Severity>('mild');

  // Hydration state
  const [wetDiapers, setWetDiapers] = useState('');
  const [fluidIntake, setFluidIntake] = useState('');

  // Food state
  const [foodIntake, setFoodIntake] = useState<'normal' | 'reduced' | 'refusing'>('normal');

  // Sleep state
  const [sleepDuration, setSleepDuration] = useState('');
  const [sleepQuality, setSleepQuality] = useState<'good' | 'fair' | 'poor'>('good');

  // Common notes
  const [notes, setNotes] = useState('');

  const loadVitals = async () => {
    const data = await getEpisodeVitals(episodeId);
    setVitals(data);
  };

  useEffect(() => {
    loadVitals();
  }, [episodeId]);

  const resetForm = () => {
    setActiveType(null);
    setTemperature('');
    setBreathingRate('');
    setWetDiapers('');
    setFluidIntake('');
    setSleepDuration('');
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeType) return;

    const baseVital = {
      episodeId,
      type: activeType,
      timestamp: new Date(),
      notes: notes.trim() || undefined,
    };

    let vital: Omit<VitalSign, 'id'>;

    switch (activeType) {
      case 'temperature':
        vital = {
          ...baseVital,
          temperature: parseFloat(temperature),
          temperatureUnit: tempUnit,
          temperatureMethod: tempMethod,
        };
        break;
      case 'breathing':
        vital = {
          ...baseVital,
          breathingRate: breathingRate ? parseInt(breathingRate) : undefined,
          breathingDifficulty,
        };
        break;
      case 'hydration':
        vital = {
          ...baseVital,
          wetDiapers: wetDiapers ? parseInt(wetDiapers) : undefined,
          fluidIntake: fluidIntake || undefined,
        };
        break;
      case 'food':
        vital = {
          ...baseVital,
          foodIntake,
        };
        break;
      case 'sleep':
        vital = {
          ...baseVital,
          sleepDuration: sleepDuration ? parseFloat(sleepDuration) : undefined,
          sleepQuality,
        };
        break;
    }

    await addVitalSign(vital);
    await loadVitals();
    resetForm();
  };

  const renderForm = () => {
    if (!activeType) return null;

    return (
      <form onSubmit={handleSubmit} className="card bg-primary-50 border-2 border-primary-300">
        <h3 className="text-xl font-semibold mb-4 capitalize">Log {activeType}</h3>

        {activeType === 'temperature' && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperature *
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="input-field flex-1"
                  placeholder="98.6"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTempUnit('F')}
                    className={`px-6 py-3 rounded-lg font-medium ${
                      tempUnit === 'F' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'
                    }`}
                  >
                    °F
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempUnit('C')}
                    className={`px-6 py-3 rounded-lg font-medium ${
                      tempUnit === 'C' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'
                    }`}
                  >
                    °C
                  </button>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Method</label>
              <select
                value={tempMethod}
                onChange={(e) => setTempMethod(e.target.value as TemperatureMethod)}
                className="input-field"
              >
                <option value="temporal">Temporal (Forehead)</option>
                <option value="oral">Oral</option>
                <option value="rectal">Rectal</option>
                <option value="axillary">Axillary (Armpit)</option>
              </select>
            </div>
          </>
        )}

        {activeType === 'breathing' && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Breathing Rate (breaths/min)
              </label>
              <input
                type="number"
                value={breathingRate}
                onChange={(e) => setBreathingRate(e.target.value)}
                className="input-field"
                placeholder="e.g., 20"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Breathing Difficulty
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['mild', 'moderate', 'severe'] as Severity[]).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setBreathingDifficulty(diff)}
                    className={`py-3 px-4 rounded-lg border-2 font-medium capitalize ${
                      breathingDifficulty === diff
                        ? diff === 'mild'
                          ? 'severity-mild border-yellow-400'
                          : diff === 'moderate'
                          ? 'severity-moderate border-orange-400'
                          : 'severity-severe border-red-400'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {activeType === 'hydration' && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wet Diapers (last 24h)
              </label>
              <input
                type="number"
                value={wetDiapers}
                onChange={(e) => setWetDiapers(e.target.value)}
                className="input-field"
                placeholder="e.g., 6"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fluid Intake Estimate
              </label>
              <input
                type="text"
                value={fluidIntake}
                onChange={(e) => setFluidIntake(e.target.value)}
                className="input-field"
                placeholder="e.g., 16 oz, normal, reduced"
              />
            </div>
          </>
        )}

        {activeType === 'food' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Food Intake</label>
            <div className="grid grid-cols-3 gap-3">
              {(['normal', 'reduced', 'refusing'] as const).map((intake) => (
                <button
                  key={intake}
                  type="button"
                  onClick={() => setFoodIntake(intake)}
                  className={`py-3 px-4 rounded-lg border-2 font-medium capitalize ${
                    foodIntake === intake
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {intake}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeType === 'sleep' && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sleep Duration (hours)
              </label>
              <input
                type="number"
                step="0.5"
                value={sleepDuration}
                onChange={(e) => setSleepDuration(e.target.value)}
                className="input-field"
                placeholder="e.g., 8"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sleep Quality</label>
              <div className="grid grid-cols-3 gap-3">
                {(['good', 'fair', 'poor'] as const).map((quality) => (
                  <button
                    key={quality}
                    type="button"
                    onClick={() => setSleepQuality(quality)}
                    className={`py-3 px-4 rounded-lg border-2 font-medium capitalize ${
                      sleepQuality === quality
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    {quality}
                  </button>
                ))}
              </div>
            </div>
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

  const groupedVitals = vitals.reduce((acc, vital) => {
    if (!acc[vital.type]) acc[vital.type] = [];
    acc[vital.type].push(vital);
    return acc;
  }, {} as Record<string, VitalSign[]>);

  return (
    <div className="space-y-6">
      {/* Quick Entry Buttons */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Log Vital Signs</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            onClick={() => setActiveType('temperature')}
            className="btn-secondary flex flex-col items-center justify-center h-24 gap-2"
          >
            <Thermometer className="w-8 h-8 text-red-500" />
            <span className="font-medium">Temperature</span>
          </button>
          <button
            onClick={() => setActiveType('breathing')}
            className="btn-secondary flex flex-col items-center justify-center h-24 gap-2"
          >
            <Wind className="w-8 h-8 text-blue-500" />
            <span className="font-medium">Breathing</span>
          </button>
          <button
            onClick={() => setActiveType('hydration')}
            className="btn-secondary flex flex-col items-center justify-center h-24 gap-2"
          >
            <Droplets className="w-8 h-8 text-cyan-500" />
            <span className="font-medium">Hydration</span>
          </button>
          <button
            onClick={() => setActiveType('food')}
            className="btn-secondary flex flex-col items-center justify-center h-24 gap-2"
          >
            <Utensils className="w-8 h-8 text-green-500" />
            <span className="font-medium">Food Intake</span>
          </button>
          <button
            onClick={() => setActiveType('sleep')}
            className="btn-secondary flex flex-col items-center justify-center h-24 gap-2"
          >
            <Moon className="w-8 h-8 text-indigo-500" />
            <span className="font-medium">Sleep</span>
          </button>
        </div>
      </div>

      {renderForm()}

      {/* Recent Vitals */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Vital Signs</h2>
        {vitals.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No vital signs recorded yet.</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedVitals).map(([type, typeVitals]) => (
              <div key={type}>
                <h3 className="text-lg font-semibold text-gray-700 mb-3 capitalize">{type}</h3>
                <div className="space-y-2">
                  {typeVitals.slice(0, 5).map((vital) => (
                    <div key={vital.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 mb-1">
                            {format(vital.timestamp, 'MMM d, yyyy h:mm a')}
                          </p>
                          <div className="text-sm">
                            {vital.type === 'temperature' && (
                              <p className="font-medium text-lg">
                                {vital.temperature}°{vital.temperatureUnit} ({vital.temperatureMethod})
                              </p>
                            )}
                            {vital.type === 'breathing' && (
                              <>
                                {vital.breathingRate && <p>Rate: {vital.breathingRate}/min</p>}
                                {vital.breathingDifficulty && (
                                  <p>Difficulty: {vital.breathingDifficulty}</p>
                                )}
                              </>
                            )}
                            {vital.type === 'hydration' && (
                              <>
                                {vital.wetDiapers !== undefined && (
                                  <p>Wet diapers: {vital.wetDiapers}</p>
                                )}
                                {vital.fluidIntake && <p>Fluids: {vital.fluidIntake}</p>}
                              </>
                            )}
                            {vital.type === 'food' && <p>Intake: {vital.foodIntake}</p>}
                            {vital.type === 'sleep' && (
                              <>
                                {vital.sleepDuration && <p>Duration: {vital.sleepDuration}h</p>}
                                {vital.sleepQuality && <p>Quality: {vital.sleepQuality}</p>}
                              </>
                            )}
                            {vital.notes && (
                              <p className="mt-1 text-gray-600 italic">{vital.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
