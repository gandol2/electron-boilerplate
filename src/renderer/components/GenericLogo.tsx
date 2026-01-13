/**
 * 범용 로고 컴포넌트
 * 프로젝트명을 텍스트로 표시합니다.
 *
 * 커스터마이징 방법:
 * 1. SVG 로고 사용: 이 파일에서 SVG 코드 직접 삽입
 * 2. 이미지 로고 사용: <img src="/logo.svg" alt="Logo" />로 변경
 * 3. 텍스트 로고 유지: projectName prop 전달
 */

interface GenericLogoProps {
  className?: string;
  projectName?: string;
}

export function GenericLogo({
  className = '',
  projectName = 'Electron App',
}: GenericLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* 기본 아이콘: 첫 글자 표시 */}
      <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
        {projectName.charAt(0).toUpperCase()}
      </div>

      {/* 프로젝트명 */}
      <span className="text-lg font-semibold text-foreground">{projectName}</span>
    </div>
  );
}
