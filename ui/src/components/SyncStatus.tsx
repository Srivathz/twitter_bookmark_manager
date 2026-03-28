import React from 'react';

interface SyncStatusProps {
  lastSync: Date;
  syncing: boolean;
  onSync: () => void;
}

const SyncStatus: React.FC<SyncStatusProps> = ({ lastSync, syncing, onSync }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">Last Sync: {lastSync.toLocaleString()}</span>
      <button onClick={onSync} className="px-3 py-1 bg-twitter text-white rounded">
        {syncing ? 'Syncing...' : 'Sync Now'}
      </button>
    </div>
  );
};

export default SyncStatus;
