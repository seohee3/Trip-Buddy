# 1차 심사 MVP 실행 및 계정 준비

## 제출 대상

`mobile/`: Expo SDK 54 / React Native 0.81 / Expo Router 앱.
`frontend/`는 정적 웹 프로토타입이며 `backend/`에는 실행 서버가 없습니다.
현재 모바일 앱은 TourAPI와 Firebase를 직접 호출합니다.

```powershell
cd C:\Users\82108\Documents\Trip-Buddy\mobile
npm ci
npx expo start
# 웹으로 확인할 경우
npm run web
```

기존 node_modules가 준비되어 있으면 `npm ci`는 생략합니다. 실제 휴대폰은 SDK 54 호환 Expo Go 또는 해당 SDK 개발 빌드로 확인합니다.

## 환경변수와 TourAPI

`mobile/.env.example`의 이름을 기준으로 `mobile/.env.local`을 준비합니다.
키 값은 Git에 저장하지 않습니다. 환경변수 변경 후 Expo를 재시작합니다.

- `EXPO_PUBLIC_TOUR_API_KEY`: 공공데이터포털에서 발급받은 ServiceKey(Decoding 값).
- `EXPO_PUBLIC_FIREBASE_*`: 해당 Firebase 웹 앱의 설정 6개.
- 호출 주소: `https://apis.data.go.kr/B551011/KorService2`.
- `searchKeyword2`: 관광지 키워드 검색.
- `areaBasedList2`: 관광 콘텐츠 유형별 목록.
- `locationBasedList2`: 현재 위치 주변 거리순 목록.
- 관광지 상세는 목록에서 받은 기본정보를 전달받아 표시합니다. 별도 상세 API 호출은 없습니다.
- TourAPI 클라이언트는 API 실패를 mock 성공으로 바꾸지 않습니다. 검색·주변 화면은 실패/빈 결과 안내를 표시합니다. 개인화 추천의 fallback은 해당 추천 화면 로직을 따릅니다.
- Firebase 설정이 없으면 인증 초기화 오류를 처리하고 로그인 화면을 표시하지만 실제 로그인은 불가능합니다.

키를 출력하지 않는 실제 API 확인: `npm run verify:tour-api`.

## 심사용 계정 준비 (Firebase 콘솔 또는 앱 회원가입)

1. Firebase Authentication의 Email/Password 로그인을 활성화합니다.
2. 실제 사용할 도메인의 `openapi@도메인` 형태로 계정을 생성합니다. 단독 ID `openapi` 로그인은 지원하지 않습니다. 비밀번호는 제출용으로 정한 값을 직접 입력하고 소스에 저장하지 않습니다.
3. 해당 계정으로 앱에 한 번 로그인하고 여행 성향 설문을 완료합니다. `users/{Auth UID}` 프로필은 앱에서 자동 생성·보완합니다.
4. 실시간 응답 확인용으로 별도의 동행자 계정도 가입하고 한 번 로그인합니다.
5. Firestore 콘솔의 `mates`에 두 계정의 공개 메이트 문서를 각각 만듭니다. 기존 숫자 문서 ID도 유지할 수 있습니다. 기존 `docs/firebase-mates-seed.md`의 표시 필드에 **`userId` (string): 해당 계정의 실제 Firebase Authentication UID**를 추가합니다. 이메일이나 메이트 문서 ID를 UID 대신 넣지 않습니다.
6. 두 계정의 `users/{UID}` 문서가 생성되었는지 확인합니다. `users`는 기존대로 본인만 읽을 수 있으며 이메일을 메이트 공개 문서에 복사하지 않습니다.
7. 이 저장소의 `firestore.rules`를 해당 Firebase 프로젝트에 배포합니다. 이번 코드 수정만으로 서버 규칙이 자동 배포되지는 않습니다.

```powershell
# 저장소 루트에서 Firebase CLI 로그인 및 대상 프로젝트 확인 후 실행
firebase deploy --only firestore:rules --project <실제-project-id>
```

실제 계정 생성, 운영 데이터 seed, 규칙 배포는 이 작업에서 자동 수행하지 않습니다.

## 채팅 구조 및 심사 시나리오

- 메이트 상세 → `채팅하기` → `mates/{mateId}.userId`로 실제 수신자 확인.
- 두 Auth UID를 정렬하고 콜론으로 구분해 같은 roomId 생성. 이메일 가입으로 생성된 영문·숫자·하이픈·밑줄 UID를 지원합니다.
- `chatRooms/{roomId}`: `participants`(두 UID), `createdAt`.
- `chatRooms/{roomId}/messages/{messageId}`: `senderId`, `text`, `createdAt`.
- 참가자만 메시지를 읽고 쓸 수 있으며 타인 발신자 위조·메시지 수정·방 참가자 변경은 금지.
- 최근 200개 메시지를 실시간 표시합니다. 이전 메시지도 Firestore에서 삭제하지 않습니다.
- 서버 저장 확인 전에는 `전송 중`을 표시합니다. 완료된 메시지는 앱 재실행 후 다시 불러옵니다.
- 실제 Auth UID가 연결되지 않은 샘플 메이트는 안내를 표시하고 전송을 막습니다. 자동 답장이나 가짜 메시지는 없습니다.
- 두 계정은 각각 상대의 메이트 상세에서 채팅에 진입합니다. 별도 채팅함·푸시알림은 없습니다.

두 기기 또는 서로 다른 브라우저 세션에서 A/B 로그인 → 설문 → 검색(서울) → 상세 → 즐겨찾기 → 주변 지도(위치 허용) → 메이트 상세 → 채팅 양방향 전송 → 앱 재실행 후 메시지 유지 확인.
위치 권한 거부 상태에서는 주변 화면 안내 및 다시 시도 동작도 확인합니다.
기존 동행 화면의 행동 버튼은 별도 데모 흐름이며 실제 채팅 메시지 저장과 독립적입니다.

## 로컬 검증 명령

```powershell
cd mobile
npx tsc --noEmit
npm run lint
npm run test:firebase-auth
npm run test:mascot
npm run test:travel-type
npm run test:nearby
npm run test:chat
npm run verify:tour-api
npx expo export --platform all --output-dir .expo/mvp-export
```

번들 생성은 네이티브 설치 패키지(APK/IPA) 생성이나 실제 기기 E2E 검증을 대신하지 않습니다.

### 로컬 채팅 통합·규칙 테스트

실제 Firebase 프로젝트나 계정에 접근하지 않고 `demo-trip-buddy-chat` 프로젝트와 localhost:8088만 사용합니다. 추가 npm 의존성은 없습니다.
현재 검증에 사용한 Firestore 에뮬레이터는 `.expo/cloud-firestore-emulator-v1.19.8.jar`에 있으며 Git 제외 대상입니다. 새 환경에서는 Firebase 공식 에뮬레이터 다운로드가 필요합니다.

```powershell
# mobile/에서 별도 터미널 (Java 17 이상)
java -jar .expo/cloud-firestore-emulator-v1.19.8.jar --host 127.0.0.1 --port 8088 --project_id demo-trip-buddy-chat --rules ../firestore.rules
# 다른 터미널의 mobile/에서, 매 실행 전 에뮬레이터를 새로 시작
npm run test:chat:emulator
```

검증: 같은 방 동시 생성, 실제 저장소 코드의 양방향 실시간 구독, 새 클라이언트에서 메시지 복원, 샘플·본인 메이트 거절, 비참가자·비로그인 읽기 차단, 발신자 위조·잘못된 시각·초과 길이·추가 필드 차단, 참가자 변경·메시지 삭제·방 ID 선점 차단, 기존 사용자 프로필 비공개 유지.

참고: [Firebase 규칙 에뮬레이터 문서](https://firebase.google.com/docs/firestore/security/test-rules-emulator), [Expo SDK 54 문서](https://docs.expo.dev/versions/v54.0.0/).
