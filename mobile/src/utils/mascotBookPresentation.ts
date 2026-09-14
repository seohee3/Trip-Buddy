import type { MascotCollectionEntry } from './mascotUnlockUtils';

export type MascotBookFilter = 'all' | 'collected' | 'locked';

/** Presentation only: never changes the collection or recomputes unlock dates. */
export function getVisibleMascots(collection: readonly MascotCollectionEntry[], filter: MascotBookFilter) {
  const collected = collection
    .map((mascot, regionOrder) => ({ mascot, regionOrder }))
    .filter(({ mascot }) => mascot.isUnlocked)
    .sort((a, b) => {
      // Known dates first; ties and undated entries retain the original region order.
      const dateOrder = (b.mascot.acquiredDate ?? '').localeCompare(a.mascot.acquiredDate ?? '');
      return dateOrder || a.regionOrder - b.regionOrder;
    })
    .map(({ mascot }) => mascot);
  const locked = collection.filter(mascot => !mascot.isUnlocked);
  return filter === 'collected' ? collected : filter === 'locked' ? locked : [...collected, ...locked];
}
