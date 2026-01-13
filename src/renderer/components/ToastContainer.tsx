/**
 * 전역 Toast 알림 컨테이너
 * 우측 상단에 알림을 스택으로 표시
 */

import { useEffect } from 'react';
import { X, CheckCircle2, XCircle, Info, AlertTriangle, FileText } from 'lucide-react';
import { cn } from '@/utils';
import { useToastStore, type Toast, type ToastType } from '../store/toastStore';

const ANIMATION_DURATION = 300; // 애니메이션 시간 (ms)

/**
 * 개별 Toast 아이템 컴포넌트
 */
function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast, setExiting } = useToastStore();

  const handleDismiss = () => {
    setExiting(toast.id);
  };

  // 파일 열기 핸들러
  const handleClick = async () => {
    if (toast.filePath) {
      try {
        await window.api.system.openFile(toast.filePath);
        handleDismiss(); // 파일 열면 토스트 닫기
      } catch (error) {
        console.error('파일 열기 실패:', error);
      }
    } else if (toast.onClick) {
      toast.onClick();
    }
  };

  const isClickable = !!toast.filePath || !!toast.onClick;

  // 자동 사라짐 타이머
  useEffect(() => {
    if (toast.duration && toast.duration > 0 && !toast.isExiting) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, toast.isExiting, handleDismiss]);

  // 사라지는 애니메이션 후 제거
  useEffect(() => {
    if (toast.isExiting) {
      const timer = setTimeout(() => {
        removeToast(toast.id);
      }, ANIMATION_DURATION);

      return () => clearTimeout(timer);
    }
  }, [toast.isExiting, toast.id, removeToast]);

  const getIcon = (type: ToastType) => {
    // 파일 토스트인 경우 파일 아이콘 표시
    if (toast.filePath) {
      return <FileText className="h-5 w-5 text-green-500" />;
    }
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBorderColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500';
      case 'error':
        return 'border-l-destructive';
      case 'warning':
        return 'border-l-yellow-500';
      case 'info':
      default:
        return 'border-l-blue-500';
    }
  };

  return (
    <div
      className={cn(
        'pointer-events-auto w-80 rounded-lg border border-border bg-background shadow-lg',
        'border-l-4 transition-all duration-300 ease-in-out',
        getBorderColor(toast.type),
        toast.isExiting
          ? 'translate-x-full opacity-0' // 우측으로 슬라이드 아웃
          : 'translate-x-0 opacity-100 animate-in slide-in-from-right-full',
        isClickable && 'cursor-pointer',
      )}
      onClick={isClickable ? handleClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex-shrink-0 mt-0.5">{getIcon(toast.type)}</div>
        <div className="flex-1 min-w-0">
          {toast.title && (
            <p className="text-sm font-semibold text-foreground mb-1">{toast.title}</p>
          )}
          <p className="text-sm text-muted-foreground break-words whitespace-pre-line">{toast.message}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation(); // 부모 클릭 이벤트 전파 방지
            handleDismiss();
          }}
          className="flex-shrink-0 rounded-md p-1 hover:bg-accent transition-colors"
          aria-label="닫기"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

/**
 * Toast 컨테이너 - App 최상위에 렌더링
 */
export function ToastContainer() {
  const { toasts } = useToastStore();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed top-16 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-label="알림"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
