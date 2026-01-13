/**
 * Preload API 타입 정의
 * window.api 객체의 타입을 정의합니다.
 */

// IPC 응답 표준 포맷
export interface IpcResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// 자격증명 타입 (프로젝트별로 수정)
export interface Credentials {
  username: string;
  password: string;
}

// 설정 타입 (프로젝트별로 수정)
export interface Settings {
  theme?: 'light' | 'dark' | 'system';
  // 추가 설정 필드
}

// Preload API 인터페이스
export interface PreloadAPI {
  credentials: {
    save: (credentials: Credentials) => Promise<IpcResult>;
    get: () => Promise<IpcResult<Credentials | null>>;
    has: () => Promise<IpcResult<boolean>>;
    deleteAll: () => Promise<IpcResult>;
  };

  settings: {
    get: () => Promise<IpcResult<Settings>>;
    save: (settings: Settings) => Promise<IpcResult>;
  };

  devMode: {
    setEnabled: (enabled: boolean) => Promise<IpcResult>;
    onChanged: (callback: (data: { enabled: boolean }) => void) => () => void;
  };

  system: {
    openPath: (filePath: string) => Promise<IpcResult>;
    showNotification: (options: { title: string; body: string }) => Promise<IpcResult>;
    flashFrame: () => Promise<IpcResult>;
  };

  dialog: {
    showMessageBox: (options: any) => Promise<IpcResult<any>>;
  };

  app: {
    getVersion: () => Promise<IpcResult<string>>;
    quit: () => Promise<IpcResult>;
  };

  update: {
    check: () => Promise<IpcResult<{ available: boolean; version?: string; error?: string }>>;
    onReady: (callback: (data: { version: string }) => void) => () => void;
    onDebug: (callback: (data: { message: string; data?: any }) => void) => () => void;
  };
}

// Window 객체 확장
declare global {
  interface Window {
    api: PreloadAPI;
  }
}

export {};
