import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '@/pages/Landing';
import AuthPage from '@/components/shared/AuthForm';
import TeacherDashboard from '@/pages/teacher/Dashboard';
import TeacherUpload from '@/pages/teacher/Upload';
import TeacherContent from '@/pages/teacher/Content';
import PrincipalDashboard from '@/pages/principal/Dashboard';
import PrincipalPending from '@/pages/principal/Pending';
import PrincipalAllContent from '@/pages/principal/AllContent';
import LiveBroadcast from '@/pages/live/LiveBroadcast';
import RootRedirect from '@/components/shared/RootRedirect';

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      
      {/* Teacher Routes */}
      <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
      <Route path="/teacher/upload" element={<TeacherUpload />} />
      <Route path="/teacher/content" element={<TeacherContent />} />
      
      {/* Principal Routes */}
      <Route path="/principal/dashboard" element={<PrincipalDashboard />} />
      <Route path="/principal/pending" element={<PrincipalPending />} />
      <Route path="/principal/content" element={<PrincipalAllContent />} />
      
      {/* Public Routes */}
      <Route path="/live/:teacherId" element={<LiveBroadcast />} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
