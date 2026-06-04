import { Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ProtectedRoute } from './core/router/ProtectedRoute';
import { LoginPage } from './modules/auth/pages/LoginPage';
import { RegisterPage } from './modules/auth/pages/RegisterPage';
import { MainWorkspace, GlobalLoader } from './modules/workspace/MainWorkspace';
import { GlobalErrorCard } from './core/components/GlobalErrorCard';
import { GlobalSuccessCard } from './core/components/GlobalSuccessCard';
import { InvitePage } from './modules/auth/pages/InvitePage';
import { AppLoader } from './components/AppLoader'; 

const App = () => {
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <GlobalErrorCard />
      <GlobalSuccessCard />
      
      <AnimatePresence mode="wait">
        {isBooting ? (
          <motion.div 
            key="loader" 
            exit={{ opacity: 0, filter: "blur(10px)", scale: 1.1 }} 
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 z-100"
          >
            <AppLoader />
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default App;