import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/students/me');
          setUser(res.data);
        } catch (err) {
          console.error(err);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      toast.success('Welcome back!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const signup = async (data) => {
    try {
      const res = await api.post('/auth/signup', data);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      toast.success('Account created successfully!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out');
  };

  const updateUser = (data) => {
    setUser({ ...user, ...data });
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
