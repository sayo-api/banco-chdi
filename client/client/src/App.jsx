import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Soldiers from './pages/Soldiers';
import SoldierForm from './pages/SoldierForm';
import AdminPanel from './pages/AdminPanel';
import Databases from './pages/Databases';
import DatabaseView from './pages/DatabaseView';
import Layout from './components/Layout';

export default function App() {
  const { user } = useAuth();
  return (
    <>
      <div className="noise-overlay" />
      <Routes>
        <Route path="/login"    element={!user ? <Login />    : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index                        element={<ProtectedRoute pagePermission="dashboard"><Dashboard /></ProtectedRoute>} />
          <Route path="soldiers"              element={<ProtectedRoute pagePermission="soldiers"><Soldiers /></ProtectedRoute>} />
          <Route path="soldiers/new"          element={<ProtectedRoute pagePermission="soldiers"><SoldierForm /></ProtectedRoute>} />
          <Route path="soldiers/:id"          element={<ProtectedRoute pagePermission="soldiers"><SoldierForm /></ProtectedRoute>} />
          <Route path="databases"             element={<ProtectedRoute pagePermission="databases"><Databases /></ProtectedRoute>} />
          <Route path="databases/:id"         element={<ProtectedRoute pagePermission="databases"><DatabaseView /></ProtectedRoute>} />
          <Route path="admin"                 element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}
