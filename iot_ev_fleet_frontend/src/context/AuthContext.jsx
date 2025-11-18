import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * AuthContext provides authentication state (token, user) and actions (login, logout).
 * - Persists token and user in localStorage
 * - Exposes login(email, password) and logout()
 * - Redirects on login/logout to maintain UX flow
 */
const AuthContext = createContext(null);

const STORAGE_KEYS = {
  token: "auth_token",
  user: "auth_user",
};

// PUBLIC_INTERFACE
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // Initialize from localStorage to persist sessions across reloads
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEYS.token) || null);
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Persist on changes
  useEffect(() => {
    if (token) localStorage.setItem(STORAGE_KEYS.token, token);
    else localStorage.removeItem(STORAGE_KEYS.token);
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEYS.user);
  }, [user]);

  /**
   * PUBLIC_INTERFACE
   * login
   * Attempts to authenticate the user. This uses a mock implementation returning a token.
   * Replace the mock section with a real API integration later.
   */
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      // Mock auth: simulate async call delay
      await new Promise((res) => setTimeout(res, 400));
      // Basic mock validation
      if (!email || !password) {
        throw new Error("Email and password are required");
      }
      // Mock token and user profile
      const mockToken = "mock.jwt.token";
      const mockUser = {
        id: "123",
        email,
        name: email.split("@")[0],
      };

      setToken(mockToken);
      setUser(mockUser);
      // navigate to home on success
      navigate("/", { replace: true });
      return { token: mockToken, user: mockUser };
    } catch (e) {
      const message = e?.message || "Login failed";
      setError(message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  /**
   * PUBLIC_INTERFACE
   * logout
   * Clears local auth state and redirects to /login.
   */
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setError(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      loading,
      error,
      login,
      logout,
    }),
    [token, user, loading, error, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// PUBLIC_INTERFACE
export const useAuth = () => {
  /** Hook to access AuthContext safely. */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
