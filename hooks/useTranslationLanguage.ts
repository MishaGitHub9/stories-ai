import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { TranslationLanguage } from '../services/translation';

const TRANSLATION_LANGUAGE_KEY = 'selected_translation_language';

export function useTranslationLanguage() {
  const [selectedLanguage, setSelectedLanguage] = useState<TranslationLanguage>('ukrainian');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved language on app start
  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(TRANSLATION_LANGUAGE_KEY);
      if (savedLanguage && ['ukrainian', 'german', 'polish', 'french', 'spanish'].includes(savedLanguage)) {
        setSelectedLanguage(savedLanguage as TranslationLanguage);
      }
    } catch (error) {
      console.log('Error loading saved language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateLanguage = async (language: TranslationLanguage) => {
    try {
      await AsyncStorage.setItem(TRANSLATION_LANGUAGE_KEY, language);
      setSelectedLanguage(language);
    } catch (error) {
      console.log('Error saving language:', error);
    }
  };

  return {
    selectedLanguage,
    updateLanguage,
    isLoading
  };
} 