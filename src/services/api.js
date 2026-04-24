import axios from "axios";
import * as SecureStore from "expo-secure-store";

// ⚠️ IMPORTANT: Replace with your PC IP (NOT localhost on mobile)
const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.18.13:5000/api";

// -------------------------
// AXIOS INSTANCE
// -------------------------
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// -------------------------
// AUTH TOKEN INTERCEPTOR
// -------------------------
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log("Token fetch error:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// -------------------------
// AUTH APIs
// -------------------------
export const loginUser = async (email, password) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
};

export const registerUser = async (name, email, password) => {
  const res = await api.post("/auth/signup", { name, email, password });
  return res.data;
};

export const googleAuth = async (idToken) => {
  const res = await api.post("/auth/social/google", { idToken });
  return res.data;
};

export const facebookAuth = async (accessToken) => {
  const res = await api.post("/auth/social/facebook", { accessToken });
  return res.data;
};

export const getProfile = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

export const updateProfile = async (profileData) => {
  const res = await api.put("/auth/profile", profileData);
  return res.data;
};

// -------------------------
// 🔥 SKIN ANALYSIS (FINAL)
// -------------------------
export const analyzeSkinImage = async (imageUri) => {
  try {
    const formData = new FormData();

    formData.append("image", {
      uri: imageUri,
      type: "image/jpeg",
      name: "skin.jpg",
    });

    const res = await axios.post(
      `${API_URL}/analyze-skin`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      }
    );

    return res.data;

  } catch (error) {
    console.error("Skin analysis error:", error?.response || error);
    throw error;
  }
};

export default api;