import { api } from "./apiClient";

/**
 * PUBLIC_INTERFACE
 * Auth service abstraction. Currently returns a mock token.
 * Replace login() implementation with a real POST when backend is ready.
 */
export const authService = {
  // Example real call (commented):
  // login: (email, password) => api.post("/auth/login", { email, password }),
  login: async (email, password) => {
    // Mock to demonstrate flow without backend
    await new Promise((res) => setTimeout(res, 300));
    if (!email || !password) {
      const err = new Error("Email and password are required");
      err.status = 400;
      throw err;
    }
    return {
      token: "mock.jwt.token",
      user: { id: "123", email, name: email.split("@")[0] },
    };
  },
  me: async (token) => {
    // Would call: return api.get("/auth/me");
    await new Promise((res) => setTimeout(res, 150));
    if (!token) return null;
    return { id: "123", email: "user@example.com", name: "user" };
  },
};
