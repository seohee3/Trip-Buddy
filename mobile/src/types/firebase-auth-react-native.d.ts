import 'firebase/auth';
import type { Persistence } from 'firebase/auth';

type ReactNativeAsyncStorage = {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
};

// firebase@12의 React Native 런타임 export를 wrapper의 공통 타입 선언에 보완합니다.
declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: ReactNativeAsyncStorage): Persistence;
}
