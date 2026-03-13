import { useState, useEffect } from 'react';

type Theme = 'light';

export function useTheme() {
  // Força o tema 'light'
  const [theme] = useState<Theme>('light');

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    localStorage.setItem('theme', 'light');
  }, []);

  // Toggle não faz nada agora, pois só existe o modo light
  const toggleTheme = () => {};

  return {
    theme,
    toggleTheme,
    isDark: false
  };
} 