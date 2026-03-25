import { useEffect, useState, useRef } from 'react';
import axios from './api/axios';

const AuthGate = ({ children }) => {
  const [ready, setReady] = useState(false);
  const didSyncRef = useRef(false);

  useEffect(() => {
    if (didSyncRef.current) return;
    didSyncRef.current = true;

    const sync = async () => {
      try {
        const res = await axios.get('/bring-me');
        sessionStorage.setItem('userData', JSON.stringify(res.data));
      } catch (e) {
        sessionStorage.removeItem('userData');
      } finally {
        setReady(true);
      }
    };
    sync();
  }, []);

  if (!ready) return null;

  return children;
};

export default AuthGate;
