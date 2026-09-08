'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('ro');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    // Проверяем, что сохранённый язык поддерживается, иначе ставим RO
    if (savedLanguage === 'ro' || savedLanguage === 'en') {
      setLanguage(savedLanguage);
    } else {
      setLanguage('ro');
    }
  }, []);

  const changeLanguage = (lang) => {
    if (lang !== 'ro' && lang !== 'en') return; // защита от неверных значений
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}