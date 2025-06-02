import React, { createContext, useContext } from 'react';
import { DefaultTheme } from 'react-native-paper';

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  card: string;
  text: string;
  error: string;
}

interface ThemeContextType {
  colors: ThemeColors;
}

const defaultTheme: ThemeContextType = {
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',
    secondary: '#03dac4',
    background: '#f6f6f6',
    card: '#ffffff',
    text: '#000000',
    error: '#B00020',
  },
};

const ThemeContext = createContext<ThemeContextType>(defaultTheme);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeContext.Provider value={defaultTheme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 