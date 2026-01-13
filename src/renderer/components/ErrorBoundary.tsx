/**
 * React Error Boundary 컴포넌트
 * 컴포넌트 트리에서 발생하는 에러를 캐치하여 상세한 정보를 로깅
 */

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 상세한 에러 정보 로깅
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.error('[ErrorBoundary] 컴포넌트 에러 발생:', {
      ...errorDetails,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      componentStack: errorInfo.componentStack,
    });

    // Main 프로세스로 에러 전송 (선택사항)
    if (window.api?.notification) {
      window.api.notification
        .show('애플리케이션 오류', `오류가 발생했습니다: ${error.message}`)
        .catch((err) => console.error('알림 전송 실패:', err));
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-8">
          <div className="w-full max-w-2xl space-y-4 rounded-lg border border-destructive bg-card p-6">
            <h2 className="text-xl font-semibold text-destructive">오류가 발생했습니다</h2>
            <div className="space-y-2 text-sm">
              <p className="font-medium">에러 메시지:</p>
              <pre className="rounded bg-muted p-2 text-xs">
                {this.state.error?.message || '알 수 없는 오류'}
              </pre>
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="mt-4">
                  <summary className="cursor-pointer font-medium">상세 정보 (개발 모드)</summary>
                  <pre className="mt-2 max-h-64 overflow-auto rounded bg-muted p-2 text-xs">
                    {this.state.errorInfo.componentStack}
                  </pre>
                  {this.state.error?.stack && (
                    <pre className="mt-2 max-h-64 overflow-auto rounded bg-muted p-2 text-xs">
                      {this.state.error.stack}
                    </pre>
                  )}
                </details>
              )}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              페이지 새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
