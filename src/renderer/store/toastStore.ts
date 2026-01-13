/**
 * 전역 Toast 알림 상태 관리 (Zustand)
 */

import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number; // 자동 사라짐 시간 (ms), 0이면 자동 사라짐 없음
  isExiting?: boolean; // 사라지는 애니메이션 중인지
  filePath?: string; // 클릭 시 열 파일 경로
  onClick?: () => void; // 클릭 핸들러
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  setExiting: (id: string) => void;
  clearAll: () => void;
}

let toastIdCounter = 0;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${++toastIdCounter}-${Date.now()}`;
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 4000, // 기본 4초
      isExiting: false,
    };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  setExiting: (id) => {
    set((state) => ({
      toasts: state.toasts.map((t) => (t.id === id ? { ...t, isExiting: true } : t)),
    }));
  },

  clearAll: () => {
    set({ toasts: [] });
  },
}));

/**
 * Toast 유틸리티 함수들
 */
export const toast = {
  success: (message: string, title?: string, duration?: number) => {
    return useToastStore.getState().addToast({ type: 'success', message, title, duration });
  },
  error: (message: string, title?: string, duration?: number) => {
    // 오류 시 사용자 주의 끌기
    window.api?.system?.flashFrame?.(true); // 작업 표시줄 깜빡임
    window.api?.notification?.show?.('오류', message); // 시스템 알림 (소리 포함)
    // 오류는 기본적으로 자동으로 닫히지 않음 (duration: 0)
    return useToastStore.getState().addToast({ type: 'error', message, title, duration: duration ?? 0 });
  },
  info: (message: string, title?: string, duration?: number) => {
    return useToastStore.getState().addToast({ type: 'info', message, title, duration });
  },
  warning: (message: string, title?: string, duration?: number) => {
    return useToastStore.getState().addToast({ type: 'warning', message, title, duration });
  },
  /**
   * 파일 다운로드 완료 토스트 (클릭 시 파일 열기)
   */
  file: (message: string, filePath: string, title?: string, duration?: number) => {
    return useToastStore.getState().addToast({
      type: 'success',
      message: `${message}\n클릭하여 파일 열기`,
      title,
      duration: duration ?? 8000, // 파일 토스트는 8초 유지
      filePath,
    });
  },
  dismiss: (id: string) => {
    useToastStore.getState().removeToast(id);
  },
  dismissAll: () => {
    useToastStore.getState().clearAll();
  },
};
