import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './core/router/ProtectedRoute';
import { LoginPage } from './modules/auth/pages/LoginPage';
import { RegisterPage } from './modules/auth/pages/RegisterPage';
import { MainWorkspace } from './modules/workspace/MainWorkspace';
import { GlobalErrorCard } from './core/components/GlobalErrorCard';
import { GlobalSuccessCard } from './core/components/GlobalSuccessCard';
import { InvitePage } from './modules/auth/pages/InvitePage';


const App = () => {
  return (
    <>
      <GlobalErrorCard />
      <GlobalSuccessCard />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/invite/:token" element={<InvitePage />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainWorkspace />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;