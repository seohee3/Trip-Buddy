import type { Coordinates, NearbyMarkerData } from '../../nearby/nearbyLogic.ts';

export type NearbyMapProps = {
  origin: Coordinates | null;
  markers: readonly NearbyMarkerData[];
  selectedPlaceId: string | null;
  recenterKey: number;
  onSelectPlace: (placeId: string) => void;
  onOpenPlace: (placeId: string) => void;
  onMapError?: () => void;
};
