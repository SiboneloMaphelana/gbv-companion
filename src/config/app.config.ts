export const APP_CONFIG = {
  // App information
  appName: 'GBV Legal Rights Companion',
  version: '1.0.0',
  
  // Storage keys
  storageKeys: {
    journalEntries: 'journal_entries',
    emergencyContacts: 'emergency_contacts',
    userPreferences: 'user_preferences',
  },

  // Security settings
  security: {
    encryptionEnabled: true,
    autoLockTimeout: 300000, // 5 minutes in milliseconds
    maxLoginAttempts: 3,
    passwordMinLength: 6,
  },

  // Emergency numbers
  emergencyNumbers: {
    police: '10111',
    domesticViolence: '0800 150 150', 
    suicide: '0800 567 567', 
  },

  api: {
    baseUrl: 'https://api.example.com',
    timeout: 10000,
  },

  // Feature flags
  features: {
    voiceJournal: true,
    locationServices: true,
    emergencyContacts: true,
    legalResources: true,
  },

  theme: {
    primary: '#6200ee',
    accent: '#03dac4',
    background: '#f6f6f6',
    surface: '#ffffff',
    error: '#B00020',
    text: '#000000',
    success: '#4CAF50',
    warning: '#FFC107',
    info: '#2196F3',
  },
}; 