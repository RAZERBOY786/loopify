// constants/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVS_KEY = '@liked_songs';

export const getFavs = async (): Promise<string[]> => {
  try {
    const favs = await AsyncStorage.getItem(FAVS_KEY);
    return favs ? JSON.parse(favs) : [];
  } catch (e) {
    console.error('Failed to load favorites', e);
    return [];
  }
};

export const setFavs = async (favs: string[]) => {
  try {
    await AsyncStorage.setItem(FAVS_KEY, JSON.stringify(favs));
  } catch (e) {
    console.error('Failed to save favorites', e);
  }
};

// General storage helpers used for caching
export const setItem = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.error(`Failed to set ${key}`, e);
  }
};

export const getItem = async (key: string): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (e) {
    console.error(`Failed to get ${key}`, e);
    return null;
  }
};

export const removeItem = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error(`Failed to remove ${key}`, e);
  }
};