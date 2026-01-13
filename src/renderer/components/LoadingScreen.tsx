/**
 * 로딩 화면 컴포넌트
 * 앱 초기화, 데이터 로딩 등에서 재사용 가능
 */

import { Logo } from './Logo';
import { cn } from '@/utils';

interface LoadingScreenProps {
  /** 로딩 메시지 (예: "자격증명 확인 중", "계정 목록 불러오는 중") */
  message?: string;
  /** 로고 표시 여부 (기본: true) */
  showLogo?: boolean;
  /** 전체 화면 여부 (기본: true) */
  fullScreen?: boolean;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 로딩 화면 컴포넌트
 * - 브랜드 로고 (아래에서 올라오는 애니메이션)
 * - 로딩 메시지 + 점 애니메이션
 * - 재사용 가능한 구조
 */
export function LoadingScreen({
  message = '로딩 중',
  showLogo = true,
  fullScreen = true,
  className,
}: LoadingScreenProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center bg-background',
        fullScreen && 'h-screen w-screen',
        className,
      )}
      data-name="loading-screen"
      data-note="로딩 화면"
    >
      {/* 로고 - 아래에서 올라오는 애니메이션 */}
      {showLogo && (
        <div className="animate-slide-up-fade mb-8">
          <Logo className="h-10 w-auto" />
        </div>
      )}

      {/* 로딩 메시지 + 점 애니메이션 */}
      <div className="flex items-center gap-1 text-muted-foreground">
        <span className="animate-fade-in text-sm">{message}</span>
        <span className="flex gap-0.5">
          <span className="animate-bounce-dot-1 text-brand-primary">.</span>
          <span className="animate-bounce-dot-2 text-brand-primary">.</span>
          <span className="animate-bounce-dot-3 text-brand-primary">.</span>
        </span>
      </div>

      {/* 프로그레스 바 (심플한 무한 애니메이션) */}
      <div className="mt-6 h-1 w-48 overflow-hidden rounded-full bg-muted">
        <div className="animate-progress-indeterminate h-full w-1/3 rounded-full bg-gradient-to-r from-brand-primary to-brand-accent" />
      </div>
    </div>
  );
}

/**
 * 인라인 로딩 스피너 (작은 영역에서 사용)
 */
export function LoadingSpinner({
  message,
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn('flex items-center justify-center gap-2', className)}
      data-name="loading-spinner"
      data-note="인라인 로딩 스피너"
    >
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-brand-primary" />
      {message && <span className="text-sm text-muted-foreground">{message}</span>}
    </div>
  );
}
