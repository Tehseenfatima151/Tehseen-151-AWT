import { createContext, useContext, useMemo, useState } from "react";
import { notifyCartChanged } from "../utils/cartEvents";

const AuthContext = createContext(null);

const getStoredUser = () => {
  const raw = localStorage.getItem("foodify_user");
  return raw ? JSON.parse(raw) : null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser());

  const login = ({ token, user: userData }) => {
    localStorage.setItem("foodify_token", token);
    localStorage.setItem("foodify_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("foodify_token");
    localStorage.removeItem("foodify_user");
    localStorage.removeItem("foodify_cart");
    notifyCartChanged();
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
