import React, { useState } from 'react';

interface SettingsState {
  theme: 'light' | 'dark';
  account: string;
  preferences: Record<string, any>;
}
interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  settings: SettingsState;
  onChange: (settings: SettingsState) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ open, onClose, settings, onChange }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  if (!open) return null;

  const handleSave = () => {
    onChange(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-xl">
        <div className="flex justify-between items-center mb-6">
          <span className="font-semibold text-xl text-twitter">Settings</span>
          <button onClick={onClose} className="text-sm px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded">Close</button>
        </div>
        <div className="mb-6">
          <label className="block mb-2 font-medium">Theme</label>
          <select
            value={localSettings.theme}
            onChange={e => setLocalSettings({ ...localSettings, theme: e.target.value as 'light' | 'dark' })}
            className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 w-full"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <div className="mb-6">
          <label className="block mb-2 font-medium">Account</label>
          <input
            type="text"
            value={localSettings.account}
            onChange={e => setLocalSettings({ ...localSettings, account: e.target.value })}
            className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 w-full"
          />
        </div>
        {/* Preferences can be added here */}
        <div className="flex gap-4 justify-end mt-8">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded text-sm font-medium">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-twitter text-white rounded text-sm font-medium">Save</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
