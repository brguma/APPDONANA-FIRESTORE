import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { enablePWA } from './firebase/config';

// Registra Service Worker para PWA
enablePWA();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 📊 Performance monitoring
if (process.env.NODE_ENV === 'production') {
  // Registra métricas de performance
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(console.log);
    getFID(console.log);
    getFCP(console.log);
    getLCP(console.log);
    getTTFB(console.log);
  });
}