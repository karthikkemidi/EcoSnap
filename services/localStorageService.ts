import { Classification } from '../types';

const HISTORY_KEY = 'ecoSnapHistory';

export const saveHistory = (history: Classification[]): void => {
  try {
    const serializedHistory = JSON.stringify(history);
    localStorage.setItem(HISTORY_KEY, serializedHistory);
  } catch (error) {
    console.error("Error saving history to local storage:", error);
  }
};

export const loadHistory = (): Classification[] => {
  try {
    const serializedHistory = localStorage.getItem(HISTORY_KEY);
    if (serializedHistory === null) {
      return [];
    }
    return JSON.parse(serializedHistory);
  } catch (error) {
    console.error("Error loading history from local storage:", error);
    return [];
  }
};
