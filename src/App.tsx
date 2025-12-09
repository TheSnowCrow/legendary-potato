import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { PatientSelector } from './components/PatientSelector';
import { EpisodeDashboard } from './components/EpisodeDashboard';
import { AlertTriangle } from 'lucide-react';

const AppContent: React.FC = () => {
  const { selectedPatient } = useApp();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🏥</div>
              <div>
                <h1 className="text-2xl font-bold text-primary-600">Pediatric Symptom Tracker</h1>
                <p className="text-sm text-gray-600">Track illness progression • Generate medical summaries</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Disclaimer Banner */}
      <div className="bg-yellow-100 border-b-2 border-yellow-300">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-700 flex-shrink-0" />
            <p className="text-sm text-yellow-800">
              <strong>Medical Disclaimer:</strong> This app is for tracking purposes only and does not provide medical advice.
              Always consult healthcare providers for medical decisions. No personal health information (PHI) is collected.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="py-6">
        {!selectedPatient ? <PatientSelector /> : <EpisodeDashboard />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              🔒 <strong>Privacy First:</strong> All data is stored locally in your browser. Nothing is sent to any server.
            </p>
            <p className="text-xs text-gray-500">
              Open source • MIT License • No PHI collected • HIPAA considerations built-in
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
