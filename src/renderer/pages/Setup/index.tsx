/**
 * Setup 페이지
 * 초기 설정 화면
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/store/toastStore';
import { GenericLogo } from '@/components/GenericLogo';

export default function SetupPage() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await window.api.credentials.save(credentials);
      if (result.success) {
        toast.success('설정이 저장되었습니다.');
        navigate('/dashboard');
      } else {
        toast.error(result.error || '저장 실패');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-6">
        {/* 로고 */}
        <div className="flex justify-center">
          <GenericLogo projectName="Electron App" />
        </div>

        {/* 제목 */}
        <div className="text-center">
          <h1 className="text-2xl font-bold">초기 설정</h1>
          <p className="text-muted-foreground mt-2">
            앱을 사용하기 위한 초기 설정을 진행합니다.
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">사용자명</Label>
            <Input
              id="username"
              type="text"
              placeholder="사용자명을 입력하세요"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? '저장 중...' : '저장하고 시작하기'}
          </Button>
        </form>

        {/* 도움말 */}
        <div className="text-center text-sm text-muted-foreground">
          <p>설정은 시스템 자격 증명 관리자에 안전하게 저장됩니다.</p>
        </div>
      </div>
    </div>
  );
}
