// TypeScript과 지원되지 않는 플랫폼을 위한 안전한 기본 구현입니다.
// Metro는 iOS/Android에서 NearbyMap.native.tsx, 웹에서 NearbyMap.web.tsx를 우선 선택합니다.
export { default } from './NearbyMap.web.tsx';
