import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from './api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false); // AuthGate의 ready 역할을 여기서 수행

  // 1. 유저 정보를 서버에서 가져오는 함수
  const fetchUser = useCallback(async () => {
    try {
      const res = await axios.get('/bring-me');
      setUser(res.data);
      sessionStorage.setItem('userData', JSON.stringify(res.data));
    } catch (error) {
      setUser(null);
      sessionStorage.removeItem('userData');
    }
  }, []);

  // 2. 앱 최초 실행 시 1회 유저 정보 확인 (AuthGate의 useEffect 역할)
  useEffect(() => {
    const initAuth = async () => {
      await fetchUser();
      setReady(true); // 통신이 끝나면 렌더링 준비 완료
    };
    initAuth();
  }, [fetchUser]);

  // 3. 로그인 성공 시 호출할 함수 (로그인 API에서 유저 데이터를 바로 받을 때 사용)
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

  // AuthGate의 return 부분: 준비되기 전엔 아무것도 안 그림
  if (!ready) return null;

  return (
    // fetchUser도 외부에서 쓸 수 있게 넘겨줍니다
    <AuthContext.Provider value={{ user, login, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};