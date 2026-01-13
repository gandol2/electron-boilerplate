/**
 * 개발자 모드 상태 관리 (Zustand)
 * F12 키 10회 연타로 활성화/비활성화
 * 상태는 일시적 (앱 재시작 시 초기화)
 */

import { create } from 'zustand';

interface DevModeStore {
  isDevMode: boolean;
  toggleDevMode: () => void;
  enableDevMode: () => void;
  disableDevMode: () => void;
  // Main 프로세스에서 변경된 상태를 동기화 (IPC 호출 없이 로컬 상태만 업데이트)
  syncFromMain: (enabled: boolean) => void;
}

export const useDevModeStore = create<DevModeStore>((set, get) => ({
  isDevMode: false,

  toggleDevMode: () => {
    const newValue = !get().isDevMode;
    set({ isDevMode: newValue });
    // 메인 프로세스에 개발자 모드 상태 알림
    window.api.devMode.setEnabled(newValue);
  },

  enableDevMode: () => {
    set({ isDevMode: true });
    window.api.devMode.setEnabled(true);
  },

  disableDevMode: () => {
    set({ isDevMode: false });
    window.api.devMode.setEnabled(false);
  },

  // Main에서 F12 연타로 변경된 경우: IPC 호출 없이 상태만 동기화
  syncFromMain: (enabled: boolean) => {
    set({ isDevMode: enabled });
  },
}));

/**
 * F12 키 연타 감지 설정
 */
const F12_KEY_COUNT = 10; // 활성화에 필요한 F12 키 횟수
const F12_KEY_TIMEOUT = 5000; // 5초 내에 10회 눌러야 함

/**
 * F12 키 연타 감지 핸들러 생성
 * @param onActivate 활성화 시 콜백
 * @returns keydown 이벤트 핸들러
 */
export function createEscKeyHandler(onActivate: () => void): (e: KeyboardEvent) => void {
  let keyCount = 0;
  let lastKeyTime = 0;

  return (e: KeyboardEvent) => {
    if (e.key !== 'F12') {
      return;
    }

    // 기본 F12 동작 방지 (DevTools 열기 방지)
    e.preventDefault();

    const now = Date.now();

    // 타임아웃 초과 시 카운트 리셋
    if (now - lastKeyTime > F12_KEY_TIMEOUT) {
      keyCount = 0;
    }

    lastKeyTime = now;
    keyCount++;

    // 진행 상황 콘솔 출력 (개발자용)
    if (keyCount >= 5) {
      console.log(`[DevMode] F12 ${keyCount}/${F12_KEY_COUNT}`);
    }

    // 목표 횟수 도달 시 활성화
    if (keyCount >= F12_KEY_COUNT) {
      keyCount = 0;
      onActivate();
    }
  };
}
