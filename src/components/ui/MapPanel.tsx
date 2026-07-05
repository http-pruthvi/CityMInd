'use client';

import dynamic from 'next/dynamic';
import type { GeoMarker } from '@/types';
import EmptyState from './EmptyState';
import { MapPin } from 'lucide-react';

const CityMap = dynamic(() => import('@/components/maps/CityMap'), { ssr: false });

interface MapPanelProps {
  title: string;
  subtitle?: string;
  markers?: GeoMarker[];
  center?: [number, number];
  zoom?: number;
  height?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  interactive?: boolean;
  draggableMarker?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
  selectedPosition?: [number, number] | null;
}

export default function MapPanel({
  title,
  subtitle,
  markers = [],
  center,
  zoom = 11,
  height = 360,
  emptyTitle = 'No map data yet',
  emptyDescription = 'Alerts and citizen reports with locations will appear here once submitted.',
  interactive = true,
  draggableMarker,
  onLocationSelect,
  selectedPosition,
}: MapPanelProps) {
  const showEmpty = !draggableMarker && markers.length === 0;

  return (
    <div className="panel map-panel" style={{ height }}>
      <div className="panel-header">
        <div>
          <h2>{title}</h2>
          {subtitle && <p className="panel-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="panel-body map-panel-body">
        {showEmpty ? (
          <EmptyState
            icon={MapPin}
            title={emptyTitle}
            description={emptyDescription}
          />
        ) : (
          <CityMap
            markers={markers}
            center={center}
            zoom={zoom}
            height="100%"
            interactive={interactive}
            draggableMarker={draggableMarker}
            onLocationSelect={onLocationSelect}
            selectedPosition={selectedPosition}
            embedded
          />
        )}
      </div>
    </div>
  );
}
