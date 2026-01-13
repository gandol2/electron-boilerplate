import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  isDark: false,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
  );

  // 시스템 테마 상태 (system 모드일 때 사용)
  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  );

  // isDark는 theme과 systemTheme에서 계산 (setState 없이)
  const isDark = useMemo(() => {
    if (theme === 'system') {
      return systemTheme === 'dark';
    }
    return theme === 'dark';
  }, [theme, systemTheme]);

  useEffect(() => {
    const root = window.document.documentElement;

    // 테마 전환 애니메이션 시작
    root.classList.add('theme-transitioning');

    // 기존 클래스 제거
    root.classList.remove('light', 'dark');

    let actualTheme: 'light' | 'dark';

    if (theme === 'system') {
      actualTheme = systemTheme;
    } else {
      actualTheme = theme;
    }

    // 새 클래스 추가
    root.classList.add(actualTheme);

    console.log(`[ThemeProvider] Theme applied: ${actualTheme}`);

    // 애니메이션 완료 후 클래스 제거 (280ms 애니메이션 + 여유)
    requestAnimationFrame(() => {
      setTimeout(() => {
        root.classList.remove('theme-transitioning');
      }, 300);
    });
  }, [theme, systemTheme]);

  // 시스템 테마 변경 감지
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const newSystemTheme = mediaQuery.matches ? 'dark' : 'light';
      setSystemTheme(newSystemTheme);
      console.log(`[ThemeProvider] System theme changed: ${newSystemTheme}`);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const value = {
    theme,
    isDark,
    setTheme: (newTheme: Theme) => {
      console.log(`[ThemeProvider] Setting theme: ${newTheme}`);
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
