import type { Mascot, TravelRecord } from '@/src/types/travel';
import { resolveRegionSelection } from '@/src/utils/regionMatchingUtils';

export type MascotUnlockState = {
  isUnlocked: boolean;
  acquiredDate: string | null;
  relatedRecords: TravelRecord[];
};

export type MascotCollectionEntry = Mascot & MascotUnlockState;

function normalizeDateId(value: string) {
  const match = value.match(/(\d{4})[-.](\d{1,2})[-.](\d{1,2})/);
  if (!match) return null;
  return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
}

export function getRecordVisitDate(record: TravelRecord) {
  return normalizeDateId(record.startDate) ?? normalizeDateId(record.date) ?? normalizeDateId(record.createdAt);
}

export function recordUnlocksMascot(record: TravelRecord, mascot: Mascot) {
  const selection = resolveRegionSelection(record);
  return selection?.area.code === mascot.areaCode && selection.sigungu?.code === mascot.sigunguCode;
}

export function getMascotUnlockState(records: TravelRecord[], mascot: Mascot): MascotUnlockState {
  const relatedRecords = records
    .filter((record) => recordUnlocksMascot(record, mascot))
    .sort((first, second) => {
      const firstDate = getRecordVisitDate(first) ?? '';
      const secondDate = getRecordVisitDate(second) ?? '';
      return secondDate.localeCompare(firstDate);
    });

  const acquiredDate = relatedRecords
    .map(getRecordVisitDate)
    .filter((date): date is string => Boolean(date))
    .sort()[0] ?? null;

  return { isUnlocked: relatedRecords.length > 0, acquiredDate, relatedRecords };
}

export function buildMascotCollection(records: TravelRecord[], mascots: Mascot[]) {
  return mascots.map<MascotCollectionEntry>((mascot) => ({
    ...mascot,
    ...getMascotUnlockState(records, mascot),
  }));
}

export function displayAcquiredDate(dateId: string | null) {
  return dateId ? dateId.replaceAll('-', '.') : '날짜 정보 없음';
}
