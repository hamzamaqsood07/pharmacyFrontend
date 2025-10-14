import  { useContext } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeContext } from '../contexts/ThemeContext';

const ThemedToastContainer = () => {
  const { themeColors } = useContext(ThemeContext);

  const toastStyles = {
    '--toastify-color-light': '#fff',
    '--toastify-color-dark': '#121212',
    '--toastify-color-info': themeColors?.primaryColor || '#1976d2',
    '--toastify-color-success': themeColors?.primaryColor || '#1976d2',
    '--toastify-color-error': themeColors?.secondaryColor || '#dc004e',
    '--toastify-color-transparent': 'rgba(255, 255, 255, 0.7)',
    '--toastify-icon-color-info': themeColors?.primaryColor || '#1976d2',
    '--toastify-icon-color-success': themeColors?.primaryColor || '#1976d2',
    '--toastify-icon-color-error': themeColors?.secondaryColor || '#dc004e',
    '--toastify-toast-width': '320px',
    '--toastify-toast-background': '#fff',
    '--toastify-toast-min-height': '64px',
    '--toastify-toast-max-height': '800px',
    '--toastify-font-family': 'sans-serif',
    '--toastify-z-index': '9999',
    '--toastify-text-color-light': '#757575',
    '--toastify-text-color-dark': '#fff',
    '--toastify-text-color-info': '#fff',
    '--toastify-text-color-success': '#fff',
    '--toastify-text-color-warning': '#fff',
    '--toastify-text-color-error': '#fff',
    '--toastify-spinner-color': themeColors?.primaryColor || '#1976d2',
    '--toastify-spinner-color-empty-area': '#e0e0e0',
    '--toastify-color-progress-light': themeColors?.primaryColor || '#1976d2',
    '--toastify-color-progress-dark': '#bb86fc',
    '--toastify-color-progress-info': themeColors?.primaryColor || '#1976d2',
    '--toastify-color-progress-success': themeColors?.primaryColor || '#1976d2',
    '--toastify-color-progress-error': themeColors?.secondaryColor || '#dc004e',
  };

  return (
    <div style={toastStyles}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastStyle={{
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
        progressStyle={{
          background: `linear-gradient(to right, ${themeColors?.primaryColor || '#1976d2'}, ${themeColors?.secondaryColor || '#9c27b0'})`,
        }}
      />
    </div>
  );
};

export default ThemedToastContainer;
