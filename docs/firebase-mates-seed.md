# Firebase 콘솔 메이트 초기 데이터 등록

Cloud Firestore의 `(default)` 데이터베이스에서 `mates` 컬렉션을 만들고 아래 문서 ID를 사용해 수동으로 등록합니다. 앱이나 보안 규칙을 통한 seed 쓰기는 사용하지 않습니다.

## 공통 필드 구조와 UI 용도

| 필드 | Firestore 타입 | 앱에서의 용도 |
| --- | --- | --- |
| `name` | string | 목록 카드 이름, 상세·채팅·동행 화면의 이름 route param |
| `age` | number | 목록 카드와 상세 화면의 `N세` 표시 |
| `region` | string | 목록 카드와 상세 화면의 지역 표시 |
| `match` | number | 목록 정렬 및 카드·상세 화면의 매칭률 배지 |
| `image` | string | 목록·상세·채팅·동행 화면의 원격 프로필 이미지 URL |
| `sub` | string | 목록 소개글, 상세 소개글, 채팅 화면의 소개 route param |
| `isActive` | boolean | 향후 활동 상태용 필드이며 현재 UI에는 표시하지 않음 |
| `updatedAt` | timestamp | 데이터 갱신 시각이며 현재 UI에는 표시하지 않음 |

`updatedAt`은 Firebase 콘솔에서 반드시 `timestamp` 타입으로 `2026-08-23T00:00:00.000Z`를 입력합니다. 아래의 `image` 값은 모두 Firestore `string` 타입입니다.

## 문서 `1`

| 필드 | 타입 | 값 |
| --- | --- | --- |
| `name` | string | `여행자_가람` |
| `age` | number | `28` |
| `region` | string | `서울` |
| `match` | number | `89` |
| `image` | string | `https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80` |
| `sub` | string | `맛집과 감성 카페 여행을 좋아해요` |
| `isActive` | boolean | `true` |
| `updatedAt` | timestamp | `2026-08-23T00:00:00.000Z` |

## 문서 `2`

| 필드 | 타입 | 값 |
| --- | --- | --- |
| `name` | string | `여행러_민수` |
| `age` | number | `30` |
| `region` | string | `서울` |
| `match` | number | `86` |
| `image` | string | `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80` |
| `sub` | string | `계획적인 일정과 야경 산책을 좋아해요` |
| `isActive` | boolean | `true` |
| `updatedAt` | timestamp | `2026-08-23T00:00:00.000Z` |

## 문서 `3`

| 필드 | 타입 | 값 |
| --- | --- | --- |
| `name` | string | `트립메이트_지은` |
| `age` | number | `26` |
| `region` | string | `서울` |
| `match` | number | `83` |
| `image` | string | `https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80` |
| `sub` | string | `사진 찍는 여행을 좋아해요` |
| `isActive` | boolean | `false` |
| `updatedAt` | timestamp | `2026-08-23T00:00:00.000Z` |

## 문서 `4`

| 필드 | 타입 | 값 |
| --- | --- | --- |
| `name` | string | `여행하는_준호` |
| `age` | number | `29` |
| `region` | string | `서울` |
| `match` | number | `81` |
| `image` | string | `https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80` |
| `sub` | string | `자연 풍경과 조용한 코스를 선호해요` |
| `isActive` | boolean | `true` |
| `updatedAt` | timestamp | `2026-08-23T00:00:00.000Z` |

## 문서 `5`

| 필드 | 타입 | 값 |
| --- | --- | --- |
| `name` | string | `트래블러_소희` |
| `age` | number | `27` |
| `region` | string | `서울` |
| `match` | number | `70` |
| `image` | string | `https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80` |
| `sub` | string | `전시, 카페, 산책 코스를 좋아해요` |
| `isActive` | boolean | `false` |
| `updatedAt` | timestamp | `2026-08-23T00:00:00.000Z` |
