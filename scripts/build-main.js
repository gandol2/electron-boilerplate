import * as esbuild from 'esbuild';
import dotenv from 'dotenv';

// .env 파일 로드
dotenv.config();

// CUSTOMER_ID 환경 변수 확인
const customerId = process.env.CUSTOMER_ID;
if (!customerId) {
  console.error('❌ CUSTOMER_ID 환경 변수가 설정되지 않았습니다.');
  console.error('   .env 파일을 생성하고 CUSTOMER_ID를 설정하세요.');
  console.error('   예: CUSTOMER_ID=your_customer_id_here');
  process.exit(1);
}

// NAVER_AD_CENTER_ID 환경 변수 (선택적)
const naverAdCenterId = process.env.NAVER_AD_CENTER_ID || '';

// GH_TOKEN 환경 변수 (자동 업데이트용, 비공개 저장소 필수)
const ghToken = process.env.GH_TOKEN || '';
if (!ghToken) {
  console.warn('⚠️  GH_TOKEN 환경 변수가 설정되지 않았습니다.');
  console.warn('   비공개 저장소 자동 업데이트가 작동하지 않습니다.');
}

// 메인 프로세스 빌드
await esbuild.build({
  entryPoints: ['src/main/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist/main/index.js',
  external: [
    'electron',
    'keytar',
    // puppeteer 관련 (native 모듈 포함)
    'puppeteer',
    'puppeteer-core',
    'puppeteer-extra',
    'puppeteer-extra-plugin-stealth',
    // robotjs (네이티브 모듈)
    'robotjs',
    // electron-updater (CommonJS 모듈)
    'electron-updater',
  ],
  format: 'esm',
  sourcemap: true,
  define: {
    'process.env.CUSTOMER_ID': JSON.stringify(customerId),
    'process.env.NAVER_AD_CENTER_ID': JSON.stringify(naverAdCenterId),
    'process.env.GH_TOKEN': JSON.stringify(ghToken),
  },
});

// Preload 스크립트 빌드
await esbuild.build({
  entryPoints: ['src/main/preload.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist/main/preload.js',
  external: ['electron'], // electron을 external로 설정 (preload는 Electron 환경에서 실행)
  format: 'cjs', // CommonJS 형식으로 변경 (Electron preload에 적합)
  sourcemap: true,
});

console.log('✅ Main process built successfully');
