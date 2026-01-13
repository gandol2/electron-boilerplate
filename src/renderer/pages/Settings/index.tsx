/**
 * Settings 페이지
 * 앱 설정 관리
 */

import { AppHeader } from '@/components/AppHeader';
import { GenericLogo } from '@/components/GenericLogo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useDevModeStore } from '@/store/devModeStore';
import { toast } from '@/store/toastStore';

// 개발자 설정 컴포넌트 (간단 버전)
function DevSettings() {
  const handleOpenAppData = async () => {
    try {
      const result = await window.api.app.getVersion();
      if (result.success) {
        toast.info(`앱 버전: v${result.data}`);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteAllCredentials = async () => {
    try {
      const result = await window.api.credentials.deleteAll();
      if (result.success) {
        toast.success('모든 자격증명이 삭제되었습니다.');
      } else {
        toast.error(result.error || '삭제 실패');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">개발자 도구</h3>
        <div className="space-y-2">
          <Button variant="outline" onClick={handleOpenAppData}>
            앱 버전 확인
          </Button>
          <Button variant="destructive" onClick={handleDeleteAllCredentials}>
            모든 자격증명 삭제
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const isDevMode = useDevModeStore((state) => state.isDevMode);

  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader logo={<GenericLogo projectName="Electron App" />} showHome={true} showSettings={false} />

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">설정</h1>

          <Tabs defaultValue="app" className="space-y-6">
            <TabsList>
              <TabsTrigger value="app">앱 설정</TabsTrigger>
              {isDevMode && <TabsTrigger value="dev">개발자</TabsTrigger>}
            </TabsList>

            <TabsContent value="app" className="space-y-6">
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">일반 설정</h3>
                <p className="text-muted-foreground">
                  프로젝트에 맞게 설정 항목을 추가하세요.
                </p>
              </div>
            </TabsContent>

            {isDevMode && (
              <TabsContent value="dev" className="space-y-6">
                <div className="border rounded-lg p-6">
                  <DevSettings />
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
    </div>
  );
}
