import { useState, useEffect } from 'react';

/**
 * A hook for persisting state to localStorage
 * @param key The localStorage key
 * @param initialValue Initial state value
 * @returns State and setState function
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Get from localStorage on init
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });
  
  // Update localStorage when the state changes
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);
  
  return [storedValue, setStoredValue];
}

/**
 * Hook to auto-save content to localStorage periodically
 * @param key The localStorage key
 * @param value The value to save
 * @param delay Autosave delay in milliseconds
 */
export function useAutoSave<T>(key: string, value: T, delay: number = 2000): void {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    
    const timer = setTimeout(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn(`Error auto-saving to localStorage key "${key}":`, error);
      }
    }, delay);
    
    // Clear timeout if value changes before delay period
    return () => clearTimeout(timer);
  }, [key, value, delay]);
}

/**
 * Get a value from localStorage
 * @param key The localStorage key
 * @param defaultValue Default value if key doesn't exist
 * @returns The stored value or defaultValue
 */
export function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Save a value to localStorage
 * @param key The localStorage key
 * @param value The value to save
 * @returns Success status
 */
export function saveToLocalStorage<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Error setting localStorage key "${key}":`, error);
    return false;
  }
}