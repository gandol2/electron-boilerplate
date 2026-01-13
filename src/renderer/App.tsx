/**
 * 애플리케이션 메인 컴포넌트
 * 로딩 → 자격증명 확인 → 메인 화면 플로우 관리
 */

import { useEffect, useState, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TooltipProvider } from './components/ui/tooltip';
import { ToastContainer } from './components/ToastContainer';
import { AppVersion } from './components/AppVersion';
import { LoadingScreen } from './components/LoadingScreen';
import { toast } from './store/toastStore';
import { useDevModeStore } from './store/devModeStore';

// Pages
import SetupPage from './pages/Setup';
import DashboardPage from './pages/Dashboard';
import SettingsPage from './pages/Settings';

/**
 * 페이지 전환 애니메이션 처리
 */
function AnimatedRoutes({ hasCredentials }: { hasCredentials: boolean }) {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;
      const root = window.document.documentElement;
      root.classList.add('page-transitioning');
      const timer = setTimeout(() => {
        root.classList.remove('page-transitioning');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={hasCredentials ? '/dashboard' : '/setup'} replace />}
      />
      <Route path="/setup" element={<SetupPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
}

type AppState = 'loading' | 'ready';

function App() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [hasCredentials, setHasCredentials] = useState<boolean | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 업데이트 확인
        if (window.api?.update?.check) {
          const updateResult = await window.api.update.check();
          if (updateResult.success && updateResult.data?.available) {
            toast.info(
              `새 버전 v${updateResult.data.version}을 다운로드합니다.`,
              '업데이트 발견',
              5000,
            );
          }
        }

        // 자격증명 확인
        let result = false;
        if (window.api?.credentials?.has) {
          const response = await window.api.credentials.has();
          result = response.success && response.data === true;
        }
        setHasCredentials(result);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setHasCredentials(false);
      } finally {
        setAppState('ready');
      }
    };

    initializeApp();
  }, []);

  // 업데이트 준비 완료 리스너
  useEffect(() => {
    if (window.api?.update?.onReady) {
      const cleanup = window.api.update.onReady((data) => {
        toast.info(
          `앱을 종료하면 새 버전이 자동으로 설치됩니다.`,
          `v${data.version} 업데이트 준비 완료`,
          0,
        );
      });
      return cleanup;
    }
  }, []);

  // 개발자 모드 변경 리스너
  useEffect(() => {
    if (window.api?.devMode?.onChanged) {
      const cleanup = window.api.devMode.onChanged((data) => {
        useDevModeStore.getState().syncFromMain(data.enabled);
        toast.info(
          data.enabled
            ? '개발자 모드가 활성화되었습니다.'
            : '개발자 모드가 비활성화되었습니다.',
          '개발자 모드',
          3000,
        );
      });
      return cleanup;
    }
  }, []);

  if (appState === 'loading') {
    return (
      <ErrorBoundary>
        <ThemeProvider defaultTheme="light" storageKey="app-theme">
          <LoadingScreen message="앱 초기화 중" />
          <AppVersion />
        </ThemeProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" storageKey="app-theme">
        <TooltipProvider>
          <HashRouter>
            <AnimatedRoutes hasCredentials={hasCredentials ?? false} />
          </HashRouter>
          <ToastContainer />
          <AppVersion />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
