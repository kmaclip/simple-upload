import React, { createContext, useContext, useState, useEffect } from 'react';

export const themes = {
  light: {
    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#333333',
    textSecondary: '#6c757d',
    primary: '#007bff',
    secondary: '#6c757d',
    error: '#dc3545',
    success: '#28a745',
    border: '#dee2e6',
    buttonText: '#ffffff',
    cardBackground: '#ffffff',
    modalBackground: 'rgba(0, 0, 0, 0.5)',
    modalSurface: '#ffffff'
  },
  dark: {
    background: '#121212',
    surface: '#1e1e1e',
    text: '#ffffff',
    textSecondary: '#9ea7aa',
    primary: '#4dabf7',
    secondary: '#9ea7aa',
    error: '#ff6b6b',
    success: '#51cf66',
    border: '#2d2d2d',
    buttonText: '#ffffff',
    cardBackground: '#1e1e1e',
    modalBackground: 'rgba(0, 0, 0, 0.8)',
    modalSurface: '#2d2d2d'
  }
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : 
           window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    // Update body styles
    document.body.style.backgroundColor = isDarkMode ? 
      themes.dark.background : themes.light.background;
    document.body.style.color = isDarkMode ? 
      themes.dark.text : themes.light.text;
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const theme = isDarkMode ? themes.dark : themes.light;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};