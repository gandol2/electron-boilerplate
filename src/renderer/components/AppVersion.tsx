import { useEffect, useState } from 'react';

/**
 * 앱 버전을 우측 하단에 고정 표시하는 컴포넌트
 */
export function AppVersion() {
  const [version, setVersion] = useState<string>('');

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const result = await window.api.app.getVersion();
        if (result.success && result.data) {
          setVersion(result.data);
        }
      } catch (error) {
        console.error('버전 정보를 가져오는데 실패했습니다:', error);
      }
    };

    fetchVersion();
  }, []);

  if (!version) return null;

  return (
    <div
      data-name="app-version"
      data-note="앱 버전 표시"
      className="fixed bottom-2 right-3 text-xs text-muted-foreground/50 select-none pointer-events-none z-50"
    >
      v{version}
    </div>
  );
}
