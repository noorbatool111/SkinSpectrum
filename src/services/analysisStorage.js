import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@skinspectrum_analysis_history";

export const saveAnalysis = async (analysis) => {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    // prepend
    list.unshift({ ...analysis, savedAt: new Date().toISOString() });
    await AsyncStorage.setItem(KEY, JSON.stringify(list));
    return true;
  } catch (e) {
    console.error("Failed to save analysis locally", e);
    return false;
  }
};

export const getAnalyses = async () => {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to read analyses", e);
    return [];
  }
};

export const clearAnalyses = async () => {
  try {
    await AsyncStorage.removeItem(KEY);
    return true;
  } catch (e) {
    console.error("Failed to clear analyses", e);
    return false;
  }
};

export default { saveAnalysis, getAnalyses, clearAnalyses };
