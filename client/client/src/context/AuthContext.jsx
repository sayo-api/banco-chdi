import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('chdi_user')); } catch { return null; }
  });
  const [permissions, setPermissions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('chdi_permissions')); } catch { return {}; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('chdi_token');
    if (token) {
      api.get('/auth/me')
        .then(res => {
          setUser(res.data);
          // Carregar permissões
          return api.get(`/permissions/user/${res.data._id}`);
        })
        .then(res => {
          const perms = res.data.pages || {};
          setPermissions(perms);
          localStorage.setItem('chdi_permissions', JSON.stringify(perms));
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('chdi_token', token);
    localStorage.setItem('chdi_user', JSON.stringify(userData));
    setUser(userData);
    
    // Carregar permissões após login
    api.get(`/permissions/user/${userData.id}`)
      .then(res => {
        const perms = res.data.pages || {};
        setPermissions(perms);
        localStorage.setItem('chdi_permissions', JSON.stringify(perms));
      })
      .catch(err => console.error('Erro ao carregar permissões:', err));
  };

  const logout = () => {
    localStorage.removeItem('chdi_token');
    localStorage.removeItem('chdi_user');
    localStorage.removeItem('chdi_permissions');
    setUser(null);
    setPermissions({});
  };

  return (
    <AuthContext.Provider value={{ user, permissions, login, logout, loading, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
