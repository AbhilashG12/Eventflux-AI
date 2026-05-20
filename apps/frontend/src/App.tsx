import { Suspense } from 'react'; // 🔥 Import Suspense
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './core/router/ProtectedRoute';
import { LoginPage } from './modules/auth/pages/LoginPage';
import { RegisterPage } from './modules/auth/pages/RegisterPage';
import { MainWorkspace, GlobalLoader } from './modules/workspace/MainWorkspace';
import { GlobalErrorCard } from './core/components/GlobalErrorCard';
import { GlobalSuccessCard } from './core/components/GlobalSuccessCard';
import { InvitePage } from './modules/auth/pages/InvitePage';

const App = () => {
  return (
    <>
      <GlobalErrorCard />
      <GlobalSuccessCard />
      <BrowserRouter>
        <Suspense fallback={<GlobalLoader />}>
          <Routes>

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/invite/:token" element={<InvitePage />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<MainWorkspace />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
};

export default App;