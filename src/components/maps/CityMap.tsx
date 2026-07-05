'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { GeoMarker, AlertSeverity } from '@/types';
import { DOMAIN_CONFIGS } from '@/lib/mock/data';

const getDomainConfig = (domainId: string) => DOMAIN_CONFIGS.find(d => d.id === domainId) || { color: '#06b6d4', name: domainId };

interface CityMapProps {
  markers?: GeoMarker[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onMarkerClick?: (marker: GeoMarker) => void;
  interactive?: boolean;
  draggableMarker?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
  selectedPosition?: [number, number] | null;
}

const getSeverityColor = (severity?: AlertSeverity, defaultColor: string = '#06b6d4'): string => {
  if (!severity) return defaultColor;
  const colors: Record<string, string> = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e',
    urgent: '#ef4444',
    warning: '#f97316',
    info: '#3b82f6',
  };
  return colors[severity] || defaultColor;
};

function createMarkerIcon(color: string, severity?: AlertSeverity): L.DivIcon {
  const glowColor = getSeverityColor(severity, color);
  const size = severity === 'critical' ? 18 : severity === 'high' ? 14 : 12;

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${glowColor};
        border-radius: 50%;
        border: 2px solid rgba(255,255,255,0.8);
        box-shadow: 0 0 12px ${glowColor}88, 0 0 24px ${glowColor}44;
        position: relative;
        ${severity === 'critical' ? 'animation: marker-pulse 2s ease-in-out infinite;' : ''}
      "></div>
      <style>
        @keyframes marker-pulse {
          0%, 100% { box-shadow: 0 0 12px ${glowColor}88, 0 0 24px ${glowColor}44; transform: scale(1); }
          50% { box-shadow: 0 0 20px ${glowColor}cc, 0 0 40px ${glowColor}66; transform: scale(1.15); }
        }
      </style>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 4],
  });
}

export default function CityMap({
  markers = [],
  center = [28.6139, 77.209],
  zoom = 11,
  height = '100%',
  onMarkerClick,
  interactive = true,
  draggableMarker = false,
  onLocationSelect,
  selectedPosition,
}: CityMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const draggableRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center,
      zoom,
      zoomControl: true,
      scrollWheelZoom: interactive,
      dragging: interactive,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    mapInstanceRef.current = map;

    if (draggableMarker && onLocationSelect) {
      const pos = selectedPosition || center;
      const marker = L.marker(pos, {
        draggable: true,
        icon: createMarkerIcon('#06b6d4'),
      }).addTo(map);

      marker.on('dragend', () => {
        const latlng = marker.getLatLng();
        onLocationSelect(latlng.lat, latlng.lng);
      });

      draggableRef.current = marker;

      map.on('click', (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers (except draggable)
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker && layer !== draggableRef.current) {
        map.removeLayer(layer);
      }
    });

    markers.forEach((m) => {
      const domain = getDomainConfig(m.domain);
      const icon = createMarkerIcon(domain.color, m.severity);

      const marker = L.marker([m.lat, m.lng], { icon }).addTo(map);

      const popupContent = `
        <div style="min-width: 180px; font-family: 'Inter', sans-serif;">
          <div style="font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; color: #f1f5f9;">${m.title}</div>
          <div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 6px;">${m.description}</div>
          <div style="display: flex; gap: 6px; align-items: center;">
            <span style="
              padding: 2px 8px;
              border-radius: 99px;
              font-size: 0.65rem;
              font-weight: 600;
              text-transform: uppercase;
              background: ${domain.color}22;
              color: ${domain.color};
              border: 1px solid ${domain.color}44;
            ">${domain.name}</span>
            ${m.severity ? `<span style="
              padding: 2px 8px;
              border-radius: 99px;
              font-size: 0.65rem;
              font-weight: 600;
              text-transform: uppercase;
              background: ${getSeverityColor(m.severity, domain.color)}22;
              color: ${getSeverityColor(m.severity, domain.color)};
              border: 1px solid ${getSeverityColor(m.severity, domain.color)}44;
            ">${m.severity}</span>` : ''}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      if (onMarkerClick) {
        marker.on('click', () => onMarkerClick(m));
      }
    });
  }, [markers, onMarkerClick]);

  useEffect(() => {
    if (draggableRef.current && selectedPosition) {
      draggableRef.current.setLatLng(selectedPosition);
    }
  }, [selectedPosition]);

  return (
    <div
      ref={mapRef}
      className="map-container"
      style={{ height }}
    />
  );
}
