export type TourPlace = {
  id: string;
  title: string;
  areaName: string;
  sigunguName: string;
  address: string;
  contentTypeId: string;
  image: string;
  rating?: number;
  distance?: number;
  mapX?: string;
  mapY?: string;
};

export type TourApiEndpoint = 'searchKeyword2' | 'areaBasedList2';
export type TourApiErrorKind = 'missing-key' | 'network' | 'http' | 'invalid-response' | 'api';

export type TourApiRequestSummary = {
  endpoint: TourApiEndpoint;
  keyword: string | null;
  contentTypeId: string | null;
  pageNo: number;
  numOfRows: number;
  arrange: 'O';
};

export type TourApiResponseSummary = TourApiRequestSummary & {
  resultCode: string;
  totalCount: number;
  itemCount: number;
  itemsStructure: 'item-array' | 'single-item' | 'empty' | 'unexpected';
};

export type TourApiResult = {
  places: TourPlace[];
  summary: TourApiResponseSummary;
};

export type TourApiRequest = {
  endpoint: TourApiEndpoint;
  keyword?: string;
  contentTypeId?: string;
  pageNo?: number;
  numOfRows?: number;
};

export const TOUR_API_BASE_URL = 'https://apis.data.go.kr/B551011/KorService2';

export class TourApiRequestError extends Error {
  readonly kind: TourApiErrorKind;
  readonly resultCode: string | null;

  constructor(
    kind: TourApiErrorKind,
    message: string,
    resultCode: string | null = null,
  ) {
    super(message);
    this.name = 'TourApiRequestError';
    this.kind = kind;
    this.resultCode = resultCode;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function getTourApiKey() {
  const key = process.env.EXPO_PUBLIC_TOUR_API_KEY;

  if (!key) {
    throw new TourApiRequestError(
      'missing-key',
      'EXPO_PUBLIC_TOUR_API_KEY가 설정되지 않았습니다.',
    );
  }

  return key;
}

function normalizeItem(value: unknown): TourPlace | null {
  if (!isRecord(value)) return null;
  const idValue = value.contentid;
  const id = typeof idValue === 'string' || typeof idValue === 'number' ? String(idValue) : '';
  const title = text(value.title);
  if (!id || !title) return null;

  const address = text(value.addr1) || text(value.addr2) || '주소 정보 없음';
  const addressParts = address.split(' ');

  return {
    id,
    title,
    areaName: addressParts[0] || '지역',
    sigunguName: addressParts[1] || '',
    address,
    contentTypeId: value.contenttypeid == null ? '' : String(value.contenttypeid),
    image: text(value.firstimage) || text(value.firstimage2),
    mapX: text(value.mapx) || undefined,
    mapY: text(value.mapy) || undefined,
  };
}

function parseItems(body: unknown) {
  if (!isRecord(body)) {
    return { items: [] as unknown[], structure: 'unexpected' as const, totalCount: 0 };
  }

  const totalCountValue = Number(body.totalCount);
  const totalCount = Number.isFinite(totalCountValue) ? Math.max(0, totalCountValue) : 0;
  const itemsContainer = body.items;

  if (itemsContainer === '' || itemsContainer == null) {
    return { items: [] as unknown[], structure: 'empty' as const, totalCount };
  }
  if (!isRecord(itemsContainer)) {
    return { items: [] as unknown[], structure: 'unexpected' as const, totalCount };
  }

  const rawItems = itemsContainer.item;
  if (Array.isArray(rawItems)) {
    return { items: rawItems, structure: 'item-array' as const, totalCount };
  }
  if (isRecord(rawItems)) {
    return { items: [rawItems], structure: 'single-item' as const, totalCount };
  }
  if (rawItems == null || rawItems === '') {
    return { items: [] as unknown[], structure: 'empty' as const, totalCount };
  }
  return { items: [] as unknown[], structure: 'unexpected' as const, totalCount };
}

export async function requestTourPlaces(request: TourApiRequest): Promise<TourApiResult> {
  const serviceKey = getTourApiKey();
  const pageNo = Math.max(1, Math.floor(request.pageNo ?? 1));
  const numOfRows = Math.min(50, Math.max(1, Math.floor(request.numOfRows ?? 20)));
  const summary: TourApiRequestSummary = {
    endpoint: request.endpoint,
    keyword: request.keyword?.trim() || null,
    contentTypeId: request.contentTypeId?.trim() || null,
    pageNo,
    numOfRows,
    arrange: 'O',
  };
  const params = new URLSearchParams({
    MobileOS: 'ETC',
    MobileApp: 'TripBuddy',
    _type: 'json',
    numOfRows: String(numOfRows),
    pageNo: String(pageNo),
    arrange: summary.arrange,
    serviceKey,
  });
  if (summary.keyword) params.set('keyword', summary.keyword);
  if (summary.contentTypeId) params.set('contentTypeId', summary.contentTypeId);

  let response: Response;
  try {
    response = await fetch(`${TOUR_API_BASE_URL}/${request.endpoint}?${params.toString()}`);
  } catch {
    throw new TourApiRequestError('network', '관광공사 API에 연결하지 못했습니다.');
  }

  if (!response.ok) {
    throw new TourApiRequestError('http', '관광공사 API 요청에 실패했습니다.');
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new TourApiRequestError('invalid-response', '관광공사 API 응답 형식을 확인할 수 없습니다.');
  }

  if (!isRecord(data) || !isRecord(data.response) || !isRecord(data.response.header)) {
    throw new TourApiRequestError('invalid-response', '관광공사 API 응답 형식을 확인할 수 없습니다.');
  }

  const resultCode = text(data.response.header.resultCode);
  if (resultCode !== '0000') {
    throw new TourApiRequestError(
      'api',
      '관광공사 API가 요청을 처리하지 못했습니다.',
      resultCode || null,
    );
  }

  const parsed = parseItems(data.response.body);
  const places = parsed.items
    .map(normalizeItem)
    .filter((place): place is TourPlace => place !== null);

  return {
    places,
    summary: {
      ...summary,
      resultCode,
      totalCount: parsed.totalCount,
      itemCount: places.length,
      itemsStructure: parsed.structure,
    },
  };
}

export type SearchTourPlacesOptions = {
  contentTypeId?: string;
  numOfRows?: number;
  pageNo?: number;
};

export async function searchTourPlaces(
  keyword: string,
  options: SearchTourPlacesOptions = {},
): Promise<TourPlace[]> {
  const result = await requestTourPlaces({
    endpoint: 'searchKeyword2',
    keyword,
    contentTypeId: options.contentTypeId,
    numOfRows: options.numOfRows,
    pageNo: options.pageNo,
  });
  return result.places;
}

export async function fetchAreaBasedTourPlaces(
  contentTypeId: string,
  options: { numOfRows?: number; pageNo?: number } = {},
): Promise<TourApiResult> {
  return requestTourPlaces({
    endpoint: 'areaBasedList2',
    contentTypeId,
    numOfRows: options.numOfRows,
    pageNo: options.pageNo,
  });
}
