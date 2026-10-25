import React from 'react';
import { useTranslation } from 'react-i18next';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  return (
    <AuthProvider>
      <NotificationProvider>
        <AppRoutes />
        <ToastContainer
          position={isRtl ? 'top-left' : 'top-right'}
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={isRtl}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
