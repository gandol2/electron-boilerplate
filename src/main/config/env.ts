/**
 * 환경 변수 관리
 * 빌드 타임 상수로 관리됨
 */

/**
 * GH_TOKEN - GitHub 비공개 저장소 자동 업데이트 토큰
 * 빌드 시 환경 변수에서 주입되며, 런타임에 변경 불가
 */
export const GH_TOKEN: string = process.env.GH_TOKEN || '';

/**
 * 프로젝트별 환경 변수는 여기에 추가하세요
 *
 * 예:
 * export const API_KEY: string = process.env.API_KEY || '';
 * export const DATABASE_URL: string = process.env.DATABASE_URL || '';
 */
