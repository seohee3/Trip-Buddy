import { findRegionSelection, getFullRegionName, REGIONS } from '@/src/data/regions';
import type { TravelRecord } from '@/src/types/travel';

export const REGION_NAMES = REGIONS.map((region) => region.name);
export const RECORD_REGION_OPTIONS = REGION_NAMES;

export function normalizeRegionName(region: string) {
  const selection = findRegionSelection(region);
  if (!selection) return region;
  return selection.sigungu
    ? getFullRegionName(selection.area.name, selection.sigungu.name)
    : selection.area.name;
}

export function getRecordRegionName(record: TravelRecord) {
  return record.fullRegionName || record.region || record.areaName;
}

export function getVisitedRegions(records: TravelRecord[]) {
  return [...new Set(records.map(getRecordRegionName).filter(Boolean))];
}

export function getRegionRecords(records: TravelRecord[], region: string) {
  const normalized = normalizeRegionName(region);
  const selection = findRegionSelection(region);

  return records
    .filter((record) => {
      const recordName = getRecordRegionName(record);
      if (recordName === normalized || recordName === region) return true;
      if (selection?.sigungu) return record.sigunguCode === selection.sigungu.code;
      return record.areaCode === selection?.area.code || record.areaName === region;
    })
    .sort((first, second) => second.startDate.localeCompare(first.startDate));
}

export function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

export function formatDateId(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function displayDate(dateId: string) {
  return dateId.replaceAll('-', '.');
}

export function createRecordId() {
  return `record-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
