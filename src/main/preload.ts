/**
 * Preload Script
 * Context Bridge를 통해 Renderer에 안전하게 API 노출
 */

import { contextBridge, ipcRenderer } from 'electron';

// Renderer에 노출할 API
contextBridge.exposeInMainWorld('api', {
  // 자격증명 관리
  credentials: {
    save: (credentials: any) => ipcRenderer.invoke('credentials:save', credentials),
    get: () => ipcRenderer.invoke('credentials:get'),
    has: () => ipcRenderer.invoke('credentials:has'),
    deleteAll: () => ipcRenderer.invoke('credentials:deleteAll'),
  },

  // 설정 관리
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    save: (settings: any) => ipcRenderer.invoke('settings:save'),
  },

  // 개발자 모드
  devMode: {
    setEnabled: (enabled: boolean) => ipcRenderer.invoke('devMode:setEnabled', enabled),
    onChanged: (callback: (data: { enabled: boolean }) => void) => {
      const subscription = (_: any, data: { enabled: boolean }) => callback(data);
      ipcRenderer.on('devMode:changed', subscription);
      return () => ipcRenderer.removeListener('devMode:changed', subscription);
    },
  },

  // 시스템 유틸리티
  system: {
    openPath: (filePath: string) => ipcRenderer.invoke('system:openPath', filePath),
    showNotification: (options: { title: string; body: string }) =>
      ipcRenderer.invoke('system:showNotification', options),
    flashFrame: () => ipcRenderer.invoke('system:flashFrame'),
  },

  // 다이얼로그
  dialog: {
    showMessageBox: (options: any) => ipcRenderer.invoke('dialog:showMessageBox', options),
  },

  // 앱 정보
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    quit: () => ipcRenderer.invoke('app:quit'),
  },

  // 업데이트
  update: {
    check: () => ipcRenderer.invoke('update:check'),
    onReady: (callback: (data: { version: string }) => void) => {
      const subscription = (_: any, data: { version: string }) => callback(data);
      ipcRenderer.on('update:ready', subscription);
      return () => ipcRenderer.removeListener('update:ready', subscription);
    },
    onDebug: (callback: (data: { message: string; data?: any }) => void) => {
      const subscription = (_: any, data: { message: string; data?: any }) => callback(data);
      ipcRenderer.on('update:debug', subscription);
      return () => ipcRenderer.removeListener('update:debug', subscription);
    },
  },
});
