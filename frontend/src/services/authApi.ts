
import api from "./apiConfig";

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post("/login", { email, password });
    return response.data;
  },
  register: async (email: string, password: string, role: string) => {
    const response = await api.post("/register", { email, password, role });
    return response.data;
  },
  verify: async () => {
    const response = await api.get("/verify");
    return response.data;
  },
};
