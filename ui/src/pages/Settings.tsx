import React, { useState } from 'react';
import SettingsModal from '../components/SettingsModal';

const Settings: React.FC = () => {
  const [open, setOpen] = useState(true);
  const [settings, setSettings] = useState({ theme: 'light', account: '', preferences: {} });

  const handleChange = (newSettings: typeof settings) => {
    setSettings(newSettings);
    // Optionally persist settings to backend or localStorage
  };

  return (
    <SettingsModal
      open={open}
      onClose={() => setOpen(false)}
      settings={settings}
      onChange={handleChange}
    />
  );
};

export default Settings;
