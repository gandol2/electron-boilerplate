/**
 * 프로젝트 초기화 스크립트
 * 보일러플레이트를 새 프로젝트로 변환합니다.
 *
 * 사용법:
 *   node scripts/init-project.js
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  console.log('🚀 Electron 프로젝트 초기화를 시작합니다.\n');

  // 사용자 입력 받기
  const projectName = await question('프로젝트 이름 (kebab-case, 예: my-electron-app): ');
  const productName = await question('제품 이름 (표시용, 예: My Electron App): ');
  const description = await question('프로젝트 설명: ');
  const appId = await question('App ID (예: com.company.myapp): ');
  const githubOwner = await question('GitHub Owner (사용자명 또는 조직명): ');
  const githubRepo = await question('GitHub Repository (저장소명): ');
  const authorName = await question('작성자 이름: ');
  const devPort = (await question('개발 서버 포트 (기본: 5173): ')) || '5173';

  rl.close();

  console.log('\n📝 다음 정보로 프로젝트를 초기화합니다:');
  console.log(`  - 프로젝트명: ${projectName}`);
  console.log(`  - 제품명: ${productName}`);
  console.log(`  - 설명: ${description}`);
  console.log(`  - App ID: ${appId}`);
  console.log(`  - GitHub: ${githubOwner}/${githubRepo}`);
  console.log(`  - 작성자: ${authorName}`);
  console.log(`  - 개발 포트: ${devPort}\n`);

  // 템플릿 변수 매핑
  const replacements = {
    '{{PROJECT_NAME}}': projectName,
    '{{PRODUCT_NAME}}': productName,
    '{{PROJECT_DESCRIPTION}}': description,
    '{{APP_ID}}': appId,
    '{{GITHUB_OWNER}}': githubOwner,
    '{{GITHUB_REPO}}': githubRepo,
    '{{AUTHOR_NAME}}': authorName,
    '{{DEV_PORT}}': devPort,
  };

  // 파일 내용 치환
  const filesToReplace = [
    'package.json',
    'electron-builder.json',
    'src/main/services/credentials.ts',
    'src/main/services/updater.ts',
    'README.md',
  ];

  console.log('🔧 파일 업데이트 중...');
  for (const file of filesToReplace) {
    const filePath = path.join(rootDir, file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf-8');
      for (const [key, value] of Object.entries(replacements)) {
        content = content.replaceAll(key, value);
      }
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`  ✓ ${file}`);
    }
  }

  // .env 파일 생성
  const envPath = path.join(rootDir, '.env');
  if (!fs.existsSync(envPath)) {
    fs.copyFileSync(path.join(rootDir, '.env.example'), envPath);
    console.log('  ✓ .env 파일 생성');
  }

  console.log('\n✅ 초기화 완료!');
  console.log('\n다음 단계:');
  console.log('  1. .env 파일에 GH_TOKEN 설정 (자동 업데이트용)');
  console.log('  2. pnpm install (의존성 설치)');
  console.log('  3. pnpm dev (개발 모드 실행)');
  console.log('\n📚 자세한 내용은 README.md와 CUSTOMIZATION.md를 참고하세요.\n');
}

main().catch((error) => {
  console.error('❌ 초기화 중 오류 발생:', error);
  process.exit(1);
});
