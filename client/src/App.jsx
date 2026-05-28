import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Soldiers from './pages/Soldiers';
import SoldierForm from './pages/SoldierForm';
import AdminPanel from './pages/AdminPanel';
import Databases from './pages/Databases';
import DatabaseView from './pages/DatabaseView';
import Layout from './components/Layout';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh' }}><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();
  return (
    <>
      <div className="noise-overlay" />
      <Routes>
        <Route path="/login"    element={!user ? <Login />    : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index                        element={<Dashboard />} />
          <Route path="soldiers"              element={<Soldiers />} />
          <Route path="soldiers/new"          element={<SoldierForm />} />
          <Route path="soldiers/:id"          element={<SoldierForm />} />
          <Route path="databases"             element={<Databases />} />
          <Route path="databases/:id"         element={<DatabaseView />} />
          <Route path="admin"                 element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}
