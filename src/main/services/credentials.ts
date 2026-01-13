/**
 * 자격증명 관리 서비스
 * keytar를 사용하여 안전하게 자격증명을 저장/조회
 */

import keytar from 'keytar';

// 🔧 프로젝트별로 변경 필요
const SERVICE_NAME = '{{PROJECT_NAME}}';

export interface Credentials {
  username: string;
  password: string;
  // 추가 필드는 여기에 정의
}

/**
 * 자격증명 저장
 * @param credentials 저장할 자격증명
 */
export async function saveCredentials(credentials: Credentials): Promise<void> {
  const { username, password } = credentials;

  try {
    await keytar.setPassword(SERVICE_NAME, 'username', username);
    await keytar.setPassword(SERVICE_NAME, 'password', password);
  } catch (error) {
    throw new Error(`Failed to save credentials: ${error}`);
  }
}

/**
 * 자격증명 조회
 * @returns 저장된 자격증명 또는 null
 */
export async function getCredentials(): Promise<Credentials | null> {
  try {
    const username = await keytar.getPassword(SERVICE_NAME, 'username');
    const password = await keytar.getPassword(SERVICE_NAME, 'password');

    if (!username || !password) {
      return null;
    }

    return {
      username,
      password,
    };
  } catch (error) {
    console.error('Failed to get credentials:', error);
    return null;
  }
}

/**
 * 자격증명 삭제
 */
export async function deleteCredentials(): Promise<void> {
  try {
    await keytar.deletePassword(SERVICE_NAME, 'username');
    await keytar.deletePassword(SERVICE_NAME, 'password');
  } catch (error) {
    throw new Error(`Failed to delete credentials: ${error}`);
  }
}

/**
 * 자격증명 존재 여부 확인
 * @returns 자격증명이 저장되어 있으면 true
 */
export async function hasCredentials(): Promise<boolean> {
  const credentials = await getCredentials();
  return credentials !== null;
}

/**
 * 특정 항목만 업데이트
 * @param key 업데이트할 키
 * @param value 새 값
 */
export async function updateCredential(key: keyof Credentials, value: string): Promise<void> {
  try {
    await keytar.setPassword(SERVICE_NAME, key, value);
  } catch (error) {
    throw new Error(`Failed to update credential ${key}: ${error}`);
  }
}

/**
 * 모든 keytar 자격증명 삭제
 */
export async function deleteAllCredentials(): Promise<void> {
  try {
    await keytar.deletePassword(SERVICE_NAME, 'username').catch(() => {});
    await keytar.deletePassword(SERVICE_NAME, 'password').catch(() => {});
  } catch (error) {
    throw new Error(`Failed to delete all credentials: ${error}`);
  }
}
