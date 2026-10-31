import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { registerServiceWorker } from './pwa';
import './index.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Đăng ký Service Worker cho PWA Offline (Requirement 2 & 3)
registerServiceWorker({
  onInstalled: () => {
    console.info('Kinh Dịch PWA: Ứng dụng đã sẵn sàng chạy offline!');
  },
  onUpdated: () => {
    console.info('Kinh Dịch PWA: Đã có bản cập nhật mới!');
  },
});
