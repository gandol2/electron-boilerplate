/**
 * 자동 업데이트 서비스
 * GitHub 비공개 저장소에서 업데이트를 확인하고 설치
 */
import pkg from 'electron-updater';
const { autoUpdater } = pkg;
import { app, BrowserWindow } from 'electron';
import { GH_TOKEN } from '../config/env';

// 로그 설정
autoUpdater.logger = console;

// 업데이트 체크 주기 (10분)
const UPDATE_CHECK_INTERVAL = 10 * 60 * 1000;

/**
 * 자동 업데이트 초기화
 * 앱 시작 시 호출
 */
export function initAutoUpdater(mainWindow: BrowserWindow): void {
  // 렌더러에 디버그 메시지 전송 헬퍼
  const sendDebug = (message: string, data?: any) => {
    console.log(message, data || '');
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update:debug', { message, data });
    }
  };

  // 개발 모드에서는 업데이트 체크 비활성화
  if (process.env.VITE_DEV_SERVER_URL) {
    sendDebug('[AutoUpdater] 개발 모드에서는 업데이트 체크를 건너뜁니다.');
    return;
  }

  // GH_TOKEN이 없으면 업데이트 비활성화
  if (!GH_TOKEN) {
    sendDebug('[AutoUpdater] GH_TOKEN이 없어 자동 업데이트가 비활성화됩니다.');
    return;
  }

  sendDebug('[AutoUpdater] 초기화 시작', { hasToken: !!GH_TOKEN, tokenLength: GH_TOKEN?.length });

  // 🔧 프로젝트별로 변경 필요
  // GitHub 비공개 저장소 설정
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: '{{GITHUB_OWNER}}',
    repo: '{{GITHUB_REPO}}',
    private: true,
    token: GH_TOKEN,
  });

  // 자동 다운로드 활성화 (업데이트 강제)
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowPrerelease = false;

  // 이벤트 핸들러 등록
  autoUpdater.on('checking-for-update', () => {
    sendDebug('[AutoUpdater] 업데이트 확인 중...');
  });

  autoUpdater.on('update-available', (info) => {
    sendDebug('[AutoUpdater] 새 업데이트 발견, 백그라운드 다운로드 시작', { version: info.version });
  });

  autoUpdater.on('update-not-available', () => {
    sendDebug('[AutoUpdater] 현재 최신 버전입니다.');
  });

  autoUpdater.on('download-progress', (progress) => {
    console.log(`[AutoUpdater] 다운로드 진행: ${progress.percent.toFixed(1)}%`);

    if (mainWindow && !mainWindow.isDestroyed()) {
      // 작업 표시줄에 진행률 표시 (Windows)
      mainWindow.setProgressBar(progress.percent / 100);

      // 메인 윈도우에 진행 상황 전송
      mainWindow.webContents.send('update:downloadProgress', {
        percent: progress.percent,
        transferred: progress.transferred,
        total: progress.total,
      });
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('[AutoUpdater] 업데이트 다운로드 완료:', info.version);

    // 작업 표시줄 진행률 초기화
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setProgressBar(-1);

      // 렌더러에 업데이트 준비 완료 알림
      mainWindow.webContents.send('update:ready', {
        version: info.version,
      });
    }
  });

  autoUpdater.on('error', (error) => {
    sendDebug('[AutoUpdater] 오류 발생', { error: error.message || String(error) });

    // 작업 표시줄 진행률 초기화
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setProgressBar(-1);
    }
  });

  // 업데이트 체크 함수
  const performUpdateCheck = () => {
    sendDebug('[AutoUpdater] 업데이트 확인 시작...');
    autoUpdater.checkForUpdates().catch((err) => {
      sendDebug('[AutoUpdater] 업데이트 확인 실패', { error: err.message || String(err) });
    });
  };

  // 앱 시작 직후 업데이트 확인
  sendDebug('[AutoUpdater] 500ms 후 업데이트 체크 예약됨');
  setTimeout(performUpdateCheck, 500);

  // 주기적 업데이트 확인
  setInterval(() => {
    sendDebug('[AutoUpdater] 주기적 업데이트 확인...');
    performUpdateCheck();
  }, UPDATE_CHECK_INTERVAL);
}

/**
 * 수동 업데이트 확인
 * 설정 페이지 등에서 호출
 */
export async function checkForUpdates(): Promise<{
  available: boolean;
  version?: string;
  error?: string;
}> {
  if (!GH_TOKEN) {
    return { available: false, error: 'GH_TOKEN이 설정되지 않았습니다.' };
  }

  try {
    const result = await autoUpdater.checkForUpdates();
    if (result && result.updateInfo) {
      const currentVersion = app.getVersion();
      const latestVersion = result.updateInfo.version;

      if (latestVersion !== currentVersion) {
        return { available: true, version: latestVersion };
      }
    }
    return { available: false };
  } catch (error: any) {
    return { available: false, error: error.message };
  }
}
