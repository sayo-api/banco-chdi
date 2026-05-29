import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false, pagePermission = null }) {
  const { user, permissions, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh'
      }}>
        <div className="spinner" />
      </div>
    );
  }

  // Não autenticado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Apenas admins
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Verificar permissão de página (admins tem acesso a tudo)
  if (pagePermission && user.role !== 'admin' && !permissions?.[pagePermission]) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '20px',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div style={{
          fontSize: '3rem',
          marginBottom: '20px'
        }}>🔒</div>
        <h1 style={{
          fontFamily: "'Cinzel', serif",
          fontSize: '1.5rem',
          color: 'var(--gold)',
          marginBottom: '10px'
        }}>Acesso Restrito</h1>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '1rem',
          marginBottom: '20px'
        }}>
          Você não tem permissão para acessar esta página.
        </p>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '0.9rem'
        }}>
          Contacte o administrador para solicitar acesso.
        </p>
      </div>
    );
  }

  return children;
}
