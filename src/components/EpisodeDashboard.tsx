import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, FileText, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { createIllnessEpisode } from '../db/helpers';
import { SymptomTracker } from './SymptomTracker';
import { VitalSignsTracker } from './VitalSignsTracker';
import { InterventionTracker } from './InterventionTracker';
import { Timeline } from './Timeline';
import { MedicalSummary } from './MedicalSummary';

type TabType = 'symptoms' | 'vitals' | 'interventions' | 'timeline' | 'summary';

export const EpisodeDashboard: React.FC = () => {
  const {
    selectedPatient,
    setSelectedPatient,
    selectedEpisode,
    setSelectedEpisode,
    activeEpisodes,
    refreshEpisodes,
  } = useApp();

  const [showNewEpisodeForm, setShowNewEpisodeForm] = useState(false);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('symptoms');

  useEffect(() => {
    if (activeEpisodes.length === 1 && !selectedEpisode) {
      setSelectedEpisode(activeEpisodes[0]);
    }
  }, [activeEpisodes, selectedEpisode, setSelectedEpisode]);

  const handleCreateEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient?.id || !chiefComplaint.trim()) return;

    const episodeId = await createIllnessEpisode(selectedPatient.id, chiefComplaint.trim());
    await refreshEpisodes();
    setChiefComplaint('');
    setShowNewEpisodeForm(false);

    const newEpisode = activeEpisodes.find((ep) => ep.id === episodeId);
    if (newEpisode) {
      setSelectedEpisode(newEpisode);
    }
  };

  const handleBack = () => {
    setSelectedPatient(null);
    setSelectedEpisode(null);
  };

  if (!selectedPatient) return null;

  if (!selectedEpisode) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="card">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Patient Selection
          </button>

          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{selectedPatient.emoji}</span>
                <h1 className="text-3xl font-bold text-gray-900">{selectedPatient.identifier}</h1>
              </div>
              <p className="text-gray-600">Select or create an illness episode</p>
            </div>
            <button
              onClick={() => setShowNewEpisodeForm(!showNewEpisodeForm)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Episode
            </button>
          </div>

          {showNewEpisodeForm && (
            <form onSubmit={handleCreateEpisode} className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-primary-200">
              <h3 className="text-lg font-semibold mb-4">Start New Illness Episode</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chief Complaint / Main Symptom
                </label>
                <input
                  type="text"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="input-field"
                  placeholder="e.g., Fever and cough, Vomiting, Ear infection..."
                  required
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary">
                  Start Episode
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewEpisodeForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {activeEpisodes.length === 0 && !showNewEpisodeForm && (
              <div className="text-center py-12 text-gray-500">
                <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No active illness episodes.</p>
                <p className="text-sm">Click "New Episode" when your child becomes ill.</p>
              </div>
            )}

            {activeEpisodes.map((episode) => (
              <button
                key={episode.id}
                onClick={() => setSelectedEpisode(episode)}
                className="w-full card hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-400 text-left"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {episode.chiefComplaint}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Started: {new Date(episode.startDate).toLocaleString()}
                    </p>
                    <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Active
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'symptoms' as TabType, label: 'Symptoms', icon: Activity },
    { id: 'vitals' as TabType, label: 'Vitals', icon: Activity },
    { id: 'interventions' as TabType, label: 'Interventions', icon: Activity },
    { id: 'timeline' as TabType, label: 'Timeline', icon: Activity },
    { id: 'summary' as TabType, label: 'Summary', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => setSelectedEpisode(null)}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-3"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Episodes
          </button>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{selectedPatient.emoji}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedEpisode.chiefComplaint}</h1>
              <p className="text-sm text-gray-600">
                {selectedPatient.identifier} • Started {new Date(selectedEpisode.startDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {activeTab === 'symptoms' && <SymptomTracker episodeId={selectedEpisode.id!} />}
        {activeTab === 'vitals' && <VitalSignsTracker episodeId={selectedEpisode.id!} />}
        {activeTab === 'interventions' && <InterventionTracker episodeId={selectedEpisode.id!} />}
        {activeTab === 'timeline' && <Timeline episodeId={selectedEpisode.id!} />}
        {activeTab === 'summary' && <MedicalSummary episodeId={selectedEpisode.id!} />}
      </div>
    </div>
  );
};
