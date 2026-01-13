/**
 * 헤더 액션 버튼 컴포넌트
 * 모든 페이지에서 재사용 가능한 설정 및 테마 토글 버튼
 */

import { Settings, Sun, Moon, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { useTheme } from './ThemeProvider';

interface HeaderActionsProps {
  className?: string;
  /** 홈 버튼 표시 여부 (기본값: false) */
  showHome?: boolean;
  /** 설정 버튼 표시 여부 (기본값: false) */
  showSettings?: boolean;
  /** 다크모드 버튼 표시 여부 (기본값: true) */
  showTheme?: boolean;
}

export function HeaderActions({
  className = '',
  showHome = false,
  showSettings = false,
  showTheme = true,
}: HeaderActionsProps) {
  const navigate = useNavigate();
  const { isDark, setTheme } = useTheme();

  const handleHomeClick = () => {
    navigate('/dashboard');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleToggleDarkMode = () => {
    if (isDark) {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showHome && (
        <Button variant="ghost" size="iconSm" onClick={handleHomeClick}>
          <Home strokeWidth={1} />
        </Button>
      )}

      {showSettings && (
        <Button variant="ghost" size="iconSm" onClick={handleSettingsClick}>
          <Settings strokeWidth={1} />
        </Button>
      )}

      {showTheme && (
        <Button variant="ghost" size="iconSm" onClick={handleToggleDarkMode}>
          {isDark ? <Sun strokeWidth={1} /> : <Moon strokeWidth={1} />}
        </Button>
      )}
    </div>
  );
}
