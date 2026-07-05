'use client';

import { MapPin } from 'lucide-react';
import { useDashboardStore, CITIES } from '@/stores/dashboardStore';

interface CitySelectorProps {
  compact?: boolean;
}

export default function CitySelector({ compact = false }: CitySelectorProps) {
  const { currentCity, setCurrentCity } = useDashboardStore();
  const selected = CITIES.find((c) => c.id === currentCity);

  return (
    <label className={`city-selector ${compact ? 'city-selector-compact' : ''}`}>
      <MapPin size={14} className="city-selector-icon" aria-hidden />
      {!compact && <span className="city-selector-label">City</span>}
      <select
        value={currentCity}
        onChange={(e) => setCurrentCity(e.target.value)}
        aria-label="Select city"
        title={selected ? `Viewing: ${selected.name}` : 'Select city'}
      >
        {CITIES.map((city) => (
          <option key={city.id} value={city.id}>
            {city.name}
          </option>
        ))}
      </select>
    </label>
  );
}
