/**
 * 애플리케이션 공통 헤더 컴포넌트
 * 모든 페이지에서 사용되며, 경로별로 다른 내용을 표시할 수 있습니다.
 */

import { ReactNode } from 'react';
import { HeaderActions } from './HeaderActions';

interface AppHeaderProps {
  /**
   * 헤더 중간 영역에 표시할 커스텀 내용
   * 예: Filters, 제목, 검색바 등
   */
  children?: ReactNode;

  /**
   * 헤더 좌측에 표시할 로고 컴포넌트
   * 예: <GenericLogo projectName="My App" />
   */
  logo?: ReactNode;

  /**
   * HeaderActions 표시 여부 (기본값: true)
   */
  showActions?: boolean;

  /**
   * 홈 버튼 표시 여부 (기본값: false)
   */
  showHome?: boolean;

  /**
   * 설정 버튼 표시 여부 (기본값: false)
   */
  showSettings?: boolean;

  /**
   * 다크모드 버튼 표시 여부 (기본값: true)
   */
  showTheme?: boolean;

  /**
   * 추가 CSS 클래스
   */
  className?: string;
}

export function AppHeader({
  children,
  logo,
  showActions = true,
  showHome = false,
  showSettings = false,
  showTheme = true,
  className = '',
}: AppHeaderProps) {
  return (
    <header
      className={`mb-5 sticky top-0 z-10 shrink-0 h-18  bg-background/95 p-3 backdrop-blur supports-backdrop-filter:bg-background/60 ${className}`}
    >
      {/* 좌측: Logo - absolute 좌측 상단 */}
      {logo && (
        <div className="absolute left-5 top-5 flex items-center">
          {logo}
        </div>
      )}

      {/* 중간: 커스텀 내용 (Filters, 제목 등) */}
      {children && <div className="flex items-center justify-center min-h-10">{children}</div>}

      {/* 우측: 액션 버튼 - absolute 우측 상단 */}
      {showActions && (
        <HeaderActions
          className="absolute right-3 top-3"
          showHome={showHome}
          showSettings={showSettings}
          showTheme={showTheme}
        />
      )}
    </header>
  );
}
