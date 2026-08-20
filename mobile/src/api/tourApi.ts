export type TourPlace = {
  id: string;
  title: string;
  areaName: string;
  sigunguName: string;
  address: string;
  contentTypeId: string;
  image: string;
  rating: number;
  distance: number;
  mapX?: string;
  mapY?: string;
};

const TOUR_API_BASE_URL =
  'https://apis.data.go.kr/B551011/KorService2/searchKeyword2';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=80';

function getTourApiKey() {
  const key = process.env.EXPO_PUBLIC_TOUR_API_KEY;

  if (!key) {
    throw new Error('EXPO_PUBLIC_TOUR_API_KEY가 설정되지 않았습니다.');
  }

  return key;
}

function normalizeItem(item: any, index: number): TourPlace {
  const address = item.addr1 || item.addr2 || '주소 정보 없음';
  const addressParts = address.split(' ');

  return {
    id: String(item.contentid ?? `${Date.now()}-${index}`),
    title: item.title ?? '이름 없는 장소',
    areaName: addressParts[0] ?? '지역',
    sigunguName: addressParts[1] ?? '',
    address,
    contentTypeId: String(item.contenttypeid ?? '12'),
    image: item.firstimage || item.firstimage2 || DEFAULT_IMAGE,
    rating: 4.5 + (index % 5) * 0.1,
    distance: 1.2 + index * 0.4,
    mapX: item.mapx,
    mapY: item.mapy,
  };
}

export async function searchTourPlaces(keyword: string): Promise<TourPlace[]> {
  const serviceKey = getTourApiKey();

  const params = new URLSearchParams({
    MobileOS: 'ETC',
    MobileApp: 'TripBuddy',
    _type: 'json',
    numOfRows: '20',
    pageNo: '1',
    arrange: 'O',
    keyword,
    serviceKey,
  });

  const response = await fetch(`${TOUR_API_BASE_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error('관광공사 API 요청에 실패했습니다.');
  }

  const data = await response.json();
  const item = data?.response?.body?.items?.item;

  if (!item) {
    return [];
  }

  const items = Array.isArray(item) ? item : [item];

  return items.map(normalizeItem);
}