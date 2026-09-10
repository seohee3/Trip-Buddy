// Run from mobile/. Prints status only, never credentials or request URLs.
import { existsSync } from 'node:fs';
import { requestTourPlaces } from '../src/api/tourApi.ts';

for (const file of ['.env.local', '.env']) {
  if (existsSync(file)) process.loadEnvFile(file);
}
const variables = [
  'EXPO_PUBLIC_TOUR_API_KEY', 'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN', 'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET', 'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
];
for (const key of variables) console.log(`${key}: ${process.env[key]?.trim() ? 'present' : 'MISSING'}`);
const timeout = setTimeout(() => {
  console.error('API verification timed out (45s).');
  process.exit(1);
}, 45000);
try {
  for (const request of [
    { endpoint: 'searchKeyword2', keyword: '서울', numOfRows: 1 },
    { endpoint: 'areaBasedList2', contentTypeId: '12', numOfRows: 1 },
    { endpoint: 'locationBasedList2', mapX: 126.978, mapY: 37.5665, radius: 3000, numOfRows: 1 },
  ]) {
    try {
      const { summary } = await requestTourPlaces(request);
      console.log(`${request.endpoint}: code=${summary.resultCode}, items=${summary.itemCount}, total=${summary.totalCount}`);
    } catch (error) {
      console.error(`${request.endpoint}: FAILED kind=${error.kind ?? 'unknown'}, code=${error.resultCode ?? 'none'}`);
      process.exitCode = 1;
    }
  }
} finally {
  clearTimeout(timeout);
}
