import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type Patient, type IllnessEpisode } from '../db/database';
import { getActivePatients, getActiveEpisodes } from '../db/helpers';

interface AppContextType {
  selectedPatient: Patient | null;
  setSelectedPatient: (patient: Patient | null) => void;
  selectedEpisode: IllnessEpisode | null;
  setSelectedEpisode: (episode: IllnessEpisode | null) => void;
  patients: Patient[];
  refreshPatients: () => Promise<void>;
  activeEpisodes: IllnessEpisode[];
  refreshEpisodes: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<IllnessEpisode | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activeEpisodes, setActiveEpisodes] = useState<IllnessEpisode[]>([]);

  const refreshPatients = async () => {
    const pts = await getActivePatients();
    setPatients(pts);
  };

  const refreshEpisodes = async () => {
    if (selectedPatient?.id) {
      const episodes = await getActiveEpisodes(selectedPatient.id);
      setActiveEpisodes(episodes);
    } else {
      setActiveEpisodes([]);
    }
  };

  useEffect(() => {
    refreshPatients();
  }, []);

  useEffect(() => {
    refreshEpisodes();
  }, [selectedPatient]);

  return (
    <AppContext.Provider
      value={{
        selectedPatient,
        setSelectedPatient,
        selectedEpisode,
        setSelectedEpisode,
        patients,
        refreshPatients,
        activeEpisodes,
        refreshEpisodes,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
