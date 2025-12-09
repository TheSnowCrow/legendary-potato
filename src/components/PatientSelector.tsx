import React, { useState } from 'react';
import { UserPlus, Users } from 'lucide-react';
import { createPatient } from '../db/helpers';
import { useApp } from '../context/AppContext';
import { type Patient } from '../db/database';

const EMOJI_OPTIONS = ['👶', '🧒', '👧', '👦', '🧑', '😊', '🌟', '🦄', '🐻', '🐶', '🐱', '🦁'];

export const PatientSelector: React.FC = () => {
  const { patients, refreshPatients, setSelectedPatient } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIdentifier, setNewIdentifier] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('👶');

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdentifier.trim()) return;

    await createPatient(newIdentifier.trim(), selectedEmoji);
    await refreshPatients();
    setNewIdentifier('');
    setShowAddForm(false);
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Select Patient</h1>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Add Patient
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleCreatePatient} className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-primary-200">
            <h3 className="text-lg font-semibold mb-4">Add New Patient</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Identifier (e.g., "Child 1", "My Toddler")
              </label>
              <input
                type="text"
                value={newIdentifier}
                onChange={(e) => setNewIdentifier(e.target.value)}
                className="input-field"
                placeholder="Enter identifier..."
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose an Emoji
              </label>
              <div className="grid grid-cols-6 gap-2">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`text-4xl p-3 rounded-lg border-2 transition-all ${
                      selectedEmoji === emoji
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                Create Patient
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patients.length === 0 && !showAddForm && (
            <div className="col-span-2 text-center py-12 text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No patients added yet.</p>
              <p className="text-sm">Click "Add Patient" to get started.</p>
            </div>
          )}

          {patients.map((patient) => (
            <button
              key={patient.id}
              onClick={() => handleSelectPatient(patient)}
              className="card hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-400 text-left"
            >
              <div className="flex items-center gap-4">
                <div className="text-6xl">{patient.emoji}</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {patient.identifier}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Added {new Date(patient.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Privacy Note:</strong> This app does not collect any personal identifying
            information. All data is stored locally in your browser and never sent to any server.
          </p>
        </div>
      </div>
    </div>
  );
};
