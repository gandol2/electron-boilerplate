# Electron Boilerplate

> 범용 Electron 보일러플레이트 - Windows 데스크톱 애플리케이션을 빠르게 시작할 수 있는 템플릿

[![GitHub](https://img.shields.io/badge/GitHub-Template-blue?logo=github)](https://github.com/gandol2/electron-boilerplate)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**🚀 [Use this template](https://github.com/gandol2/electron-boilerplate/generate)** 버튼을 클릭하여 바로 시작하세요!

---

## 주요 기능

- ⚡ **빠른 개발**: Vite + React + TypeScript
- 🎨 **현대적 UI**: shadcn/ui + Tailwind CSS 4
- 🔒 **보안 자격증명**: keytar를 통한 시스템 자격 증명 관리
- 🔄 **자동 업데이트**: electron-updater (GitHub Release 기반)
- 🌗 **테마 지원**: 라이트/다크 모드
- 🛠️ **개발자 모드**: F12 10회 연타로 활성화
- 📦 **Windows 배포**: NSIS 설치 프로그램 자동 생성

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | Electron 39 |
| 프론트엔드 | React 18 + TypeScript |
| UI | shadcn/ui + Tailwind CSS 4 |
| 상태관리 | Zustand |
| 빌드 | Vite + electron-builder |
| 패키지 매니저 | pnpm |

---

## 빠른 시작

### 방법 1: GitHub에서 생성 (권장) ⭐

1. **이 저장소 페이지 상단의 "Use this template" 버튼 클릭**
2. 새 저장소 이름 입력 (예: `my-electron-app`)
3. "Create repository" 클릭
4. 생성된 저장소를 클론:

```bash
git clone https://github.com/yourusername/my-electron-app.git
cd my-electron-app
```

### 방법 2: gh CLI 사용

```bash
# GitHub CLI로 템플릿에서 새 저장소 생성
gh repo create my-electron-app --template gandol2/electron-boilerplate --public --clone
cd my-electron-app
```

### 방법 3: degit 사용 (Git 히스토리 없이)

```bash
# degit으로 최신 코드만 복사
npx degit gandol2/electron-boilerplate my-electron-app
cd my-electron-app
git init
```

---

### 프로젝트 초기화

```bash
# 대화형 초기화 스크립트 실행
node scripts/init-project.js
```

초기화 스크립트가 다음 정보를 요청합니다:
- 프로젝트 이름 (kebab-case)
- 제품 이름 (표시용)
- 프로젝트 설명
- App ID (com.company.app)
- GitHub 저장소 정보
- 작성자 이름
- 개발 서버 포트

### 3. 환경 변수 설정

`.env` 파일을 열고 GitHub 토큰을 설정하세요:

```bash
GH_TOKEN=your-github-personal-access-token
```

> **토큰 생성**: https://github.com/settings/tokens
>
> 필요한 권한: `repo` (비공개 저장소 접근)

### 4. 의존성 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 개발 모드 실행
pnpm dev
```

---

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `pnpm dev` | 개발 모드 실행 (Hot Reload) |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm dist` | 배포 파일 생성 (exe, 설치 프로그램) |
| `pnpm publish:app` | GitHub Release로 배포 |
| `pnpm lint` | ESLint 실행 |
| `pnpm test` | 테스트 실행 |

---

## 프로젝트 구조

```
src/
├── main/                          # Main Process (Node.js)
│   ├── index.ts                   # 앱 진입점
│   ├── preload.ts                 # Context Bridge API
│   ├── config/env.ts              # 환경 변수
│   └── services/
│       ├── credentials.ts         # 자격증명 관리
│       ├── updater.ts             # 자동 업데이트
│       └── storage/               # 데이터 저장소
├── renderer/                      # Renderer Process (React)
│   ├── App.tsx                    # 앱 진입점
│   ├── components/                # 공통 컴포넌트
│   │   ├── GenericLogo.tsx        # 로고 (커스터마이징 가능)
│   │   ├── AppHeader.tsx          # 공통 헤더
│   │   └── ui/                    # shadcn/ui 컴포넌트
│   ├── pages/                     # 페이지
│   │   ├── Dashboard/             # 메인 페이지
│   │   ├── Settings/              # 설정 페이지
│   │   └── Setup/                 # 초기 설정
│   └── store/                     # Zustand 스토어
└── shared/types/                  # 공유 타입 정의
```

---

## 커스터마이징

### 1. 로고 변경

`src/renderer/components/GenericLogo.tsx` 파일을 수정하세요:

```tsx
// SVG 로고 사용 예시
export function GenericLogo() {
  return (
    <svg width="32" height="32">
      {/* SVG 코드 */}
    </svg>
  );
}
```

### 2. 자격증명 타입 변경

`src/main/services/credentials.ts`와 `src/shared/types/preload-api.ts`에서 `Credentials` 인터페이스를 수정하세요.

### 3. 추가 IPC 핸들러

1. `src/main/index.ts`에 핸들러 추가
2. `src/main/preload.ts`에 API 노출
3. `src/shared/types/preload-api.ts`에 타입 정의

### 4. 페이지 추가

1. `src/renderer/pages/`에 새 폴더 생성
2. `src/renderer/App.tsx`에 라우트 추가

---

## 배포

### 1. 버전 업데이트

`package.json`의 `version` 필드를 수정하세요.

### 2. 빌드

```bash
pnpm dist
```

`dist-electron/` 폴더에 다음 파일이 생성됩니다:
- `*.exe` - 설치 프로그램
- `latest.yml` - 업데이트 정보 (필수)

### 3. GitHub Release 생성

1. GitHub 저장소로 이동
2. "Releases" → "Create a new release"
3. 태그: `v버전` (예: `v1.0.0`)
4. 파일 업로드: `*.exe`, `latest.yml` (**필수**)
5. "Publish release" 클릭

### 4. 자동 업데이트

배포 후, 모든 사용자의 앱이 자동으로 업데이트를 확인하고 백그라운드에서 다운로드합니다.

---

## 개발자 모드

### 활성화 방법

설정 페이지에서 **F12 키를 10회 연타** (5초 내)

### 기능

- 상단 메뉴 표시 (파일, 개발자)
- DevTools 활성화 (F12)
- 개발자 설정 패널 표시
  - 앱 버전 확인
  - 자격증명 삭제

---

## 트러블슈팅

### keytar 설치 오류

```bash
pnpm rebuild
```

### 업데이트가 작동하지 않음

- `.env` 파일에 `GH_TOKEN`이 설정되어 있는지 확인
- GitHub Release에 `latest.yml` 파일이 업로드되었는지 확인
- 저장소가 비공개인 경우, 토큰에 `repo` 권한이 있는지 확인

### 빌드 오류

```bash
# 캐시 삭제 후 재빌드
rm -rf node_modules dist dist-electron
pnpm install
pnpm dist
```

---

## 라이선스

MIT

---

## 크레딧

이 보일러플레이트는 다음 프로젝트들을 기반으로 만들어졌습니다:
- group-d-naver-ad-automation
- group-d-kda-review-monitor

---

## 지원

이슈나 질문이 있으시면 GitHub Issues를 이용해주세요.
