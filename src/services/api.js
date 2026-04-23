import axios from "axios";
import * as SecureStore from "expo-secure-store";

// IMPORTANT: Replace with your computer's local IP address when running on a physical device or Expo Go!
// e.g. http://192.168.x.x:5000
// DO NOT USE localhost if you are testing on a real phone!
const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.18.13:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercept requests to attach the auth token automatically
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log("Error fetching token for interceptor", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const loginUser = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const registerUser = async (name, email, password) => {
  const response = await api.post("/auth/signup", { name, email, password });
  return response.data;
};

export const googleAuth = async (idToken) => {
  const response = await api.post("/auth/social/google", { idToken });
  return response.data;
};

export const facebookAuth = async (accessToken) => {
  const response = await api.post("/auth/social/facebook", { accessToken });
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.put("/auth/profile", profileData);
  return response.data;
};

export const analyzeSkinImage = async (imageUri) => {
  try {
    // Create FormData to send image file
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "skin_analysis.jpg",
    });

    // Use axios directly to send FormData (with proper headers)
    const response = await axios.post(
      `${process.env.EXPO_PUBLIC_ML_API_URL || "http://192.168.18.13:8000"}/analyze-skin`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30 second timeout
      },
    );

    // Normalize severities to 1-10 if necessary
    const payload = response.data;
    if (payload && payload.success && Array.isArray(payload.data?.conditions)) {
      const conditions = payload.data.conditions.map((c) => ({ ...c }));
      const maxSeverity = Math.max(
        ...conditions.map((c) => c.severity || 0),
        0,
      );
      // If maxSeverity is 0, leave as-is. If <=10, assume already on 1-10 scale.
      let normalized = conditions;
      if (maxSeverity > 10) {
        const factor = 10 / maxSeverity;
        normalized = conditions.map((c) => ({
          ...c,
          severity: Math.max(1, Math.round((c.severity || 0) * factor)),
        }));
      } else if (maxSeverity > 0 && maxSeverity < 6) {
        // scale up small ranges to improve UX (e.g., 1-4 -> 1-10)
        const factor = 10 / Math.max(maxSeverity, 1);
        normalized = conditions.map((c) => ({
          ...c,
          severity: Math.max(1, Math.round((c.severity || 0) * factor)),
        }));
      }

      payload.data.conditions = normalized;
    }

    return payload;
  } catch (error) {
    console.error("Error analyzing skin image:", error);
    throw error;
  }
};

export default api;
