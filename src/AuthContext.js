import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import axios from './api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userDataString = sessionStorage.getItem('userData');
    if (userDataString) {
      setUser(JSON.parse(userDataString));
    }
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
    sessionStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('auth:updated', String(Date.now()));
  }, []);

  const logout = useCallback(async () => {
    try {
      await axios.post('/logout');
    } catch (error) {
      console.error('서버 로그아웃 요청 실패:', error);
    } finally {
      setUser(null);
      sessionStorage.removeItem('userData');
      localStorage.setItem('auth:updated', String(Date.now()));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
