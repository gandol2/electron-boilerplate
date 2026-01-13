/**
 * Dashboard 페이지
 * 메인 대시보드 화면
 */

import { AppHeader } from '@/components/AppHeader';
import { GenericLogo } from '@/components/GenericLogo';

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader logo={<GenericLogo projectName="Electron App" />} showHome={false} showSettings={true} />

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">대시보드</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 예시 카드 */}
            <div className="border rounded-lg p-6 bg-card">
              <h3 className="text-lg font-semibold mb-2">환영합니다!</h3>
              <p className="text-muted-foreground">
                이곳은 대시보드입니다. 프로젝트에 맞게 커스터마이징하세요.
              </p>
            </div>

            <div className="border rounded-lg p-6 bg-card">
              <h3 className="text-lg font-semibold mb-2">시작하기</h3>
              <p className="text-muted-foreground">
                src/renderer/pages/Dashboard/index.tsx 파일을 수정하여 내용을 변경할 수 있습니다.
              </p>
            </div>

            <div className="border rounded-lg p-6 bg-card">
              <h3 className="text-lg font-semibold mb-2">설정</h3>
              <p className="text-muted-foreground">
                우측 상단의 설정 버튼을 클릭하여 앱 설정을 변경할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
