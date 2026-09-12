const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

function walk(relativeDirectory) {
  const directory = path.join(projectRoot, relativeDirectory);
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.join(relativeDirectory, entry.name);
    return entry.isDirectory() ? walk(relativePath) : [relativePath];
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const sourceFiles = [...walk('app'), ...walk('src')]
  .filter((file) => /\.(ts|tsx)$/.test(file));
const source = sourceFiles.map(read).join('\n');

const forbiddenAuthTokens = [
  ['signIn', 'Anony', 'mously'].join(''),
  ['ensure', 'Anony', 'mous', 'User'].join(''),
  ['익명', ' 인증'].join(''),
  ['익명', ' 로그인'].join(''),
];
assert(
  forbiddenAuthTokens.every((token) => !source.includes(token)),
  '허용되지 않은 자동 계정 생성 코드가 남아 있습니다.',
);

const nativeAuth = read('src/firebase/auth.ts');
const webAuth = read('src/firebase/auth.web.ts');
const authContext = read('src/context/AuthContext.tsx');
const travelStorage = read('src/storage/travelStorage.ts');
const profileRepository = read('src/firebase/profileRepository.ts');
const rootLayout = read('app/_layout.tsx');

assert(nativeAuth.includes('getReactNativePersistence(AsyncStorage)'), '네이티브 인증 persistence가 없습니다.');
assert(webAuth.includes('browserLocalPersistence'), '웹 인증 persistence가 없습니다.');
assert(authContext.includes('onAuthStateChanged'), '인증 상태 구독이 없습니다.');
assert(authContext.includes('createUserWithEmailAndPassword'), '이메일 회원가입 구현이 없습니다.');
assert(authContext.includes('signInWithEmailAndPassword'), '이메일 로그인 구현이 없습니다.');
assert(authContext.includes('signOut'), '로그아웃 구현이 없습니다.');
assert(travelStorage.includes("USER_PROFILE_KEY_PREFIX = '@trip-buddy/profile/'"), 'UID별 프로필 캐시 키가 없습니다.');
assert(travelStorage.includes('PROFILE_MIGRATION_MARKER_KEY'), '기존 프로필 이관 marker가 없습니다.');
assert(profileRepository.includes('onboardingCompleted'), 'onboardingCompleted 필드가 없습니다.');
assert(profileRepository.includes('travelType'), 'travelType 필드가 없습니다.');
assert(rootLayout.includes('Stack.Protected'), '인증 라우트 보호가 없습니다.');

console.log('Firebase 이메일 인증 및 UID별 프로필 정적 검증을 통과했습니다.');
