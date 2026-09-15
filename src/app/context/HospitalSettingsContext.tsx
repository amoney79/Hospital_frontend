import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { DEFAULT_HOSPITAL_SETTINGS, HospitalSettings, settingsApi } from '../services/api';

interface HospitalSettingsContextValue {
  settings: HospitalSettings;
  loading: boolean;
  saveSettings(settings: HospitalSettings): Promise<void>;
}

const HospitalSettingsContext = createContext<HospitalSettingsContextValue | null>(null);

export function HospitalSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(DEFAULT_HOSPITAL_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    settingsApi.get().then(setSettings).finally(() => setLoading(false));
  }, []);

  const saveSettings = async (nextSettings: HospitalSettings) => {
    const saved = await settingsApi.update(nextSettings);
    setSettings(saved);
  };

  return (
    <HospitalSettingsContext.Provider value={{ settings, loading, saveSettings }}>
      {children}
    </HospitalSettingsContext.Provider>
  );
}

export function useHospitalSettings() {
  const context = useContext(HospitalSettingsContext);
  if (!context) throw new Error('useHospitalSettings must be used within HospitalSettingsProvider');
  return context;
}