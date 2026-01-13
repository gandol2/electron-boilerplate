/**
 * 자동 배포 스크립트
 * 버전 증가 → 빌드 → GitHub Release 등록
 *
 * 사용법:
 *   pnpm publish:app              # patch 버전 증가 (0.0.1 → 0.0.2)
 *   pnpm publish:app minor        # minor 버전 증가 (0.0.1 → 0.1.0)
 *   pnpm publish:app major        # major 버전 증가 (0.0.1 → 1.0.0)
 *   pnpm publish:app --no-bump    # 버전 증가 없이 현재 버전으로 배포
 *
 * 참고: PIN은 배포 저장소의 PIN.txt 파일에서 관리됩니다.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// .env 파일에서 환경변수 로드
dotenv.config({ path: path.join(ROOT_DIR, '.env') });

// GH_TOKEN 확인
if (!process.env.GH_TOKEN) {
  console.error('❌ GH_TOKEN이 .env 파일에 설정되지 않았습니다.');
  process.exit(1);
}

// 설정
const CONFIG = {
  owner: 'gandol2',
  repo: 'group-d-naver-ad-automation',
  packageJson: path.join(ROOT_DIR, 'package.json'),
  distDir: path.join(ROOT_DIR, 'dist-electron'),
};

/**
 * 명령어 실행
 */
function run(cmd, options = {}) {
  console.log(`\n📌 실행: ${cmd}\n`);
  try {
    execSync(cmd, {
      stdio: 'inherit',
      cwd: ROOT_DIR,
      env: { ...process.env },
      ...options,
    });
  } catch (error) {
    console.error(`❌ 명령어 실패: ${cmd}`);
    process.exit(1);
  }
}

/**
 * 명령어 실행 (출력 반환)
 */
function runWithOutput(cmd) {
  try {
    return execSync(cmd, { cwd: ROOT_DIR, encoding: 'utf-8' }).trim();
  } catch (error) {
    console.error(`❌ 명령어 실패: ${cmd}`);
    process.exit(1);
  }
}

/**
 * 버전 증가
 */
function bumpVersion(type = 'patch') {
  const pkg = JSON.parse(fs.readFileSync(CONFIG.packageJson, 'utf-8'));
  const currentVersion = pkg.version;

  // 접미사 분리 (예: "0.1.0-beta" → baseVersion: "0.1.0", suffix: "-beta")
  const suffixMatch = currentVersion.match(/(-[a-zA-Z0-9.]+)$/);
  const suffix = suffixMatch ? suffixMatch[1] : '';
  const baseVersion = suffix ? currentVersion.slice(0, -suffix.length) : currentVersion;
  const parts = baseVersion.split('.').map(Number);

  switch (type) {
    case 'major':
      parts[0]++;
      parts[1] = 0;
      parts[2] = 0;
      break;
    case 'minor':
      parts[1]++;
      parts[2] = 0;
      break;
    case 'patch':
    default:
      parts[2]++;
      break;
  }

  // 접미사 유지
  const newVersion = parts.join('.') + suffix;

  pkg.version = newVersion;
  fs.writeFileSync(CONFIG.packageJson, JSON.stringify(pkg, null, 2) + '\n');

  console.log(`\n📦 버전 업데이트: ${currentVersion} → ${newVersion}\n`);
  return newVersion;
}

/**
 * GitHub Release 생성 및 파일 업로드
 */
function createRelease(version) {
  const tag = `v${version}`;
  const files = [
    'latest.yml',
    `group-d-ad-data-collector-setup-${version}.exe`,
    `group-d-ad-data-collector-setup-${version}.exe.blockmap`,
  ];

  // 파일 존재 확인
  for (const file of files) {
    const filePath = path.join(CONFIG.distDir, file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ 파일을 찾을 수 없습니다: ${filePath}`);
      process.exit(1);
    }
  }

  // 프리릴리즈 여부 확인 (-beta, -alpha, -rc 등)
  const isPrerelease = /-[a-zA-Z]/.test(version);
  const prereleaseFlag = isPrerelease ? ' --prerelease' : '';

  // Release 생성
  console.log(`\n🚀 GitHub Release 생성: ${tag}${isPrerelease ? ' (프리릴리즈)' : ''}\n`);
  run(
    `gh release create ${tag} --repo ${CONFIG.owner}/${CONFIG.repo} --title "${tag}" --notes "자동 배포 - ${new Date().toLocaleString('ko-KR')}"${prereleaseFlag}`,
  );

  // 파일 업로드
  console.log(`\n📤 파일 업로드 중...\n`);
  const fileArgs = files.map((f) => `"${path.join(CONFIG.distDir, f)}"`).join(' ');
  run(`gh release upload ${tag} --repo ${CONFIG.owner}/${CONFIG.repo} ${fileArgs}`);

  console.log(`\n✅ Release 완료: https://github.com/${CONFIG.owner}/${CONFIG.repo}/releases/tag/${tag}\n`);
}

/**
 * 현재 버전 가져오기
 */
function getCurrentVersion() {
  const pkg = JSON.parse(fs.readFileSync(CONFIG.packageJson, 'utf-8'));
  return pkg.version;
}

/**
 * 메인 함수
 */
async function main() {
  const arg = process.argv[2];
  const noBump = arg === '--no-bump';
  const versionType = noBump ? null : (arg || 'patch');

  if (!noBump && !['patch', 'minor', 'major'].includes(versionType)) {
    console.error('❌ 올바른 옵션을 지정하세요: patch, minor, major, --no-bump');
    process.exit(1);
  }

  console.log('='.repeat(50));
  console.log('🔧 자동 배포 시작');
  console.log('='.repeat(50));

  // 1. 버전 결정 (--no-bump면 현재 버전 유지)
  let newVersion;
  if (noBump) {
    newVersion = getCurrentVersion();
    console.log(`\n📦 현재 버전 유지: ${newVersion}\n`);
  } else {
    newVersion = bumpVersion(versionType);
  }

  // 2. 빌드
  console.log('\n📦 빌드 시작...\n');
  run('pnpm run dist');

  // 3. GitHub Release 생성 및 업로드
  createRelease(newVersion);

  console.log('='.repeat(50));
  console.log(`✅ 배포 완료: v${newVersion}`);
  console.log('');
  console.log('📌 PIN 설정 확인:');
  console.log(`   배포 저장소에 PIN.txt 파일이 있는지 확인하세요.`);
  console.log(`   https://github.com/${CONFIG.owner}/${CONFIG.repo}/blob/main/PIN.txt`);
  console.log('='.repeat(50));
}

main().catch((error) => {
  console.error('❌ 배포 실패:', error);
  process.exit(1);
});
