/**
 * Electron Main Process
 * 앱 진입점 및 IPC 핸들러 등록
 */

import { app, BrowserWindow, ipcMain, Menu, shell, dialog, Notification } from 'electron';
import { protocol, net } from 'electron';
import * as path from 'path';
import { pathToFileURL } from 'url';
import {
  saveCredentials,
  getCredentials,
  hasCredentials,
  deleteAllCredentials,
  type Credentials,
} from './services/credentials';
import { initAutoUpdater, checkForUpdates } from './services/updater';
import { loadSettings, saveSettings, type Settings } from './services/storage/settings';

// 커스텀 프로토콜 등록 (CORS 해결)
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
    },
  },
]);

// GPU 캐시 오류 방지
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disable-gpu-program-cache');

let mainWindow: BrowserWindow | null = null;
let isDevModeEnabled = false;

// 개발자 모드 메뉴 생성
function createDevModeMenu(): Menu {
  return Menu.buildFromTemplate([
    {
      label: '파일',
      submenu: [
        { role: 'reload', label: '새로고침' },
        { role: 'forceReload', label: '강제 새로고침' },
        { type: 'separator' },
        { role: 'quit', label: '종료' },
      ],
    },
    {
      label: '개발자',
      submenu: [
        { role: 'toggleDevTools', label: 'DevTools 토글' },
        {
          label: 'DevTools 열기',
          accelerator: 'F12',
          click: () => mainWindow?.webContents.openDevTools(),
        },
      ],
    },
  ]);
}

// F12 연타 감지 변수
let f12PressCount = 0;
let f12PressTimer: NodeJS.Timeout | null = null;
const F12_PRESS_THRESHOLD = 10; // 10회 연타
const F12_PRESS_WINDOW = 5000; // 5초 내

// 윈도우 생성
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    autoHideMenuBar: true,
    backgroundColor: '#ffffff',
    show: false,
  });

  // 윈도우 준비되면 표시
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // URL 로드
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadURL('app://./index.html');
  }

  // F12 키 입력 감지 (개발자 모드 토글)
  mainWindow.webContents.on('before-input-event', (event, input) => {
    // 개발자 모드가 아닐 때는 DevTools 단축키 차단
    if (!isDevModeEnabled) {
      if (
        input.key === 'F12' ||
        (input.control && input.shift && ['I', 'i', 'J', 'j', 'C', 'c'].includes(input.key))
      ) {
        event.preventDefault();
      }
    }

    // F12 연타 감지
    if (input.key === 'F12' && input.type === 'keyDown') {
      f12PressCount++;

      if (f12PressTimer) {
        clearTimeout(f12PressTimer);
      }

      f12PressTimer = setTimeout(() => {
        f12PressCount = 0;
      }, F12_PRESS_WINDOW);

      if (f12PressCount >= F12_PRESS_THRESHOLD) {
        f12PressCount = 0;
        if (f12PressTimer) {
          clearTimeout(f12PressTimer);
        }

        // 개발자 모드 토글
        isDevModeEnabled = !isDevModeEnabled;

        if (isDevModeEnabled) {
          Menu.setApplicationMenu(createDevModeMenu());
        } else {
          Menu.setApplicationMenu(null);
          if (mainWindow?.webContents.isDevToolsOpened()) {
            mainWindow.webContents.closeDevTools();
          }
        }

        // Renderer에 알림
        mainWindow?.webContents.send('devMode:changed', { enabled: isDevModeEnabled });
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 앱 초기화
app.whenReady().then(() => {
  // 프로덕션 모드: app:// 프로토콜 핸들러 등록
  if (!process.env.VITE_DEV_SERVER_URL) {
    protocol.handle('app', (request) => {
      const { pathname } = new URL(request.url);
      const basePath = path.resolve(__dirname, '../renderer');
      const pathToServe = path.resolve(basePath, pathname.slice(1));

      // 경로 보안 검증
      const relativePath = path.relative(basePath, pathToServe);
      const isSafe =
        relativePath && !relativePath.startsWith('..') && !path.isAbsolute(relativePath);
      if (!isSafe) {
        return new Response('bad request', {
          status: 400,
          headers: { 'content-type': 'text/html' },
        });
      }

      return net.fetch(pathToFileURL(pathToServe).toString());
    });
  }

  createWindow();

  // 자동 업데이트 초기화
  if (mainWindow) {
    initAutoUpdater(mainWindow);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ============================================
// IPC 핸들러
// ============================================

// 자격증명 관리
ipcMain.handle('credentials:save', async (_, credentials: Credentials) => {
  try {
    await saveCredentials(credentials);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('credentials:get', async () => {
  try {
    const credentials = await getCredentials();
    return { success: true, data: credentials };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('credentials:has', async () => {
  try {
    const has = await hasCredentials();
    return { success: true, data: has };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('credentials:deleteAll', async () => {
  try {
    await deleteAllCredentials();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// 설정 관리
ipcMain.handle('settings:get', async () => {
  try {
    const settings = await loadSettings();
    return { success: true, data: settings };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('settings:save', async (_, settings: Settings) => {
  try {
    await saveSettings(settings);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// 개발자 모드
ipcMain.handle('devMode:setEnabled', (_, enabled: boolean) => {
  isDevModeEnabled = enabled;

  if (enabled) {
    Menu.setApplicationMenu(createDevModeMenu());
  } else {
    Menu.setApplicationMenu(null);
    if (mainWindow?.webContents.isDevToolsOpened()) {
      mainWindow.webContents.closeDevTools();
    }
  }

  return { success: true };
});

// 시스템 유틸리티
ipcMain.handle('system:openPath', async (_, filePath: string) => {
  try {
    await shell.openPath(filePath);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('system:showNotification', (_, options: { title: string; body: string }) => {
  try {
    const notification = new Notification({
      title: options.title,
      body: options.body,
    });
    notification.show();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('system:flashFrame', () => {
  try {
    mainWindow?.flashFrame(true);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('dialog:showMessageBox', async (_, options) => {
  try {
    const result = await dialog.showMessageBox(mainWindow!, options);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// 앱 정보
ipcMain.handle('app:getVersion', () => {
  return { success: true, data: app.getVersion() };
});

ipcMain.handle('app:quit', () => {
  app.quit();
  return { success: true };
});

// 업데이트 확인
ipcMain.handle('update:check', async () => {
  try {
    const result = await checkForUpdates();
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});
