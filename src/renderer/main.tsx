import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

/**
 * 전역 에러 핸들러 설정
 * 모든 JavaScript 에러를 캐치하여 상세한 정보를 로깅
 */
function setupGlobalErrorHandlers() {
  // JavaScript 에러 핸들러
  window.addEventListener('error', (event) => {
    const errorInfo = {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
      stack: event.error?.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    console.error('[Global Error Handler] JavaScript 에러:', errorInfo);

    // Main 프로세스로 에러 전송 (선택사항)
    if (window.api?.notification) {
      window.api.notification
        .show('JavaScript 오류', `오류 발생: ${event.message}`)
        .catch((err) => console.error('알림 전송 실패:', err));
    }
  });

  // Promise rejection 핸들러
  window.addEventListener('unhandledrejection', (event) => {
    const errorInfo = {
      reason: event.reason,
      promise: event.promise,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      stack: event.reason?.stack,
    };

    console.error('[Global Error Handler] Unhandled Promise Rejection:', errorInfo);

    // Main 프로세스로 에러 전송 (선택사항)
    if (window.api?.notification) {
      const message =
        typeof event.reason === 'string'
          ? event.reason
          : event.reason?.message || '알 수 없는 오류';
      window.api.notification
        .show('Promise 오류', `오류 발생: ${message}`)
        .catch((err) => console.error('알림 전송 실패:', err));
    }
  });

  // Console.error 오버라이드하여 더 상세한 정보 추가
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const errorInfo = {
      args,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      stack: new Error().stack,
    };

    originalConsoleError('[Console Error]', errorInfo);
    originalConsoleError.apply(console, args);
  };
}

// 전역 에러 핸들러 설정
setupGlobalErrorHandlers();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
