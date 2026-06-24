import React from 'react';

const SettingsPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="grid gap-4">
        <div className="border rounded p-4">Language & Theme</div>
        <div className="border rounded p-4">Notifications</div>
        <div className="border rounded p-4">Security Settings</div>
      </div>
    </div>
  );
};

export default SettingsPage;
