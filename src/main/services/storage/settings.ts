/**
 * 애플리케이션 설정 로컬 스토리지 서비스
 * settings.json 파일 관리
 */

import { app } from 'electron';
import * as fs from 'fs/promises';
import * as path from 'path';

// 소진내역 저장 형식
export type HistoryExportFormat = 'daily' | 'monthly' | 'json';

export interface Settings {
  dark: boolean;
  apiDelay?: number; // API 순차 호출 간격 (ms)
  lowBudgetThreshold?: number; // 저예산 기준 (원)
  exportPath?: string; // Export 파일 저장 경로
  historyExportFormat?: HistoryExportFormat; // 소진내역 저장 형식 (일별/월별/JSON)
}

const STORAGE_FILE = 'settings.json';
const DEFAULT_SETTINGS: Settings = {
  dark: false,
  apiDelay: 500,
  lowBudgetThreshold: 50000,
  historyExportFormat: 'monthly',
};

/**
 * 스토리지 파일 경로 가져오기
 */
function getStoragePath(): string {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, STORAGE_FILE);
}

/**
 * 설정 파일 초기화
 */
async function initializeStorage(): Promise<void> {
  const filePath = getStoragePath();

  try {
    await fs.access(filePath);
  } catch {
    // 파일이 없으면 기본값으로 초기화
    await fs.writeFile(filePath, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf-8');
  }
}

/**
 * 기본 내보내기 경로 가져오기 (다운로드 폴더)
 */
export function getDefaultExportPath(): string {
  return app.getPath('downloads');
}

/**
 * 설정 로드
 * @returns 설정 객체
 */
export async function loadSettings(): Promise<Settings> {
  await initializeStorage();

  try {
    const filePath = getStoragePath();
    const data = await fs.readFile(filePath, 'utf-8');
    const settings = JSON.parse(data);

    // 기본값과 병합 (새로운 설정 항목 대응)
    const merged = { ...DEFAULT_SETTINGS, ...settings };

    // exportPath가 없으면 다운로드 폴더를 기본값으로 사용
    if (!merged.exportPath) {
      merged.exportPath = getDefaultExportPath();
    }

    return merged;
  } catch (error) {
    console.error('Failed to load settings:', error);
    return { ...DEFAULT_SETTINGS, exportPath: getDefaultExportPath() };
  }
}

/**
 * 설정 저장
 * @param settings 저장할 설정
 */
export async function saveSettings(settings: Settings): Promise<void> {
  try {
    const filePath = getStoragePath();
    await fs.writeFile(filePath, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (error) {
    throw new Error(`Failed to save settings: ${error}`);
  }
}

/**
 * 특정 설정 항목 업데이트
 * @param key 설정 키
 * @param value 설정 값
 */
export async function updateSetting<K extends keyof Settings>(
  key: K,
  value: Settings[K],
): Promise<void> {
  const settings = await loadSettings();
  settings[key] = value;
  await saveSettings(settings);
}

/**
 * 설정 초기화
 */
export async function resetSettings(): Promise<void> {
  await saveSettings(DEFAULT_SETTINGS);
}

/**
 * 특정 설정 값 조회
 * @param key 설정 키
 * @returns 설정 값
 */
export async function getSetting<K extends keyof Settings>(key: K): Promise<Settings[K]> {
  const settings = await loadSettings();
  return settings[key];
}
