import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Stations from './pages/Stations';
import MyStations from './pages/MyStations';
import StationDetails from './pages/StationDetails';
import ConfigureStation from './pages/ConfigureStation';
import AdminManagement from './pages/AdminManagement';
import Login from './pages/Login';
import Registration from './pages/Registration';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/stations" element={<Stations />} />
                <Route path="/my-stations" element={<MyStations />} />
                <Route path="/stations/:id" element={<StationDetails />} />
                <Route path="/stations/new" element={<ConfigureStation />} />
                <Route path="/stations/:id/edit" element={<ConfigureStation />} />
                <Route path="/admins" element={<AdminManagement />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
