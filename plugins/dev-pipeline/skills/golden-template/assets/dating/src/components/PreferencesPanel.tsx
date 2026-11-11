import React from 'react';
import { MapPin, RotateCcw } from 'lucide-react';
import {
  AGE_CEILING,
  AGE_FLOOR,
  DEFAULT_PREFERENCES,
  DISTANCE_CEILING,
  DiscoveryPreferences,
  INTENT_OPTIONS,
  IntentType,
  LifestyleFilter,
  MY_LOCATION,
  SHOW_ME_OPTIONS,
} from '../data/datingData';

interface PreferencesPanelProps {
  prefs: DiscoveryPreferences;
  onChange: (next: DiscoveryPreferences) => void;
  matchCount: number;
  totalCount: number;
}

const pct = (value: number, min: number, max: number) =>
  ((value - min) / (max - min)) * 100;

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h4 className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#17161B] mb-3">
    {children}
  </h4>
);

/**
 * Small floating read-out that tracks a slider handle. `pad` keeps the label
 * from hanging off either end of the track when a thumb sits at the extremes.
 */
const Bubble: React.FC<{
  left: number;
  pad?: number;
  children: React.ReactNode;
}> = ({ left, pad = 10, children }) => (
  <span
    className="absolute -top-[18px] font-mono-tech text-[10.5px] text-black/45 whitespace-nowrap"
    style={{
      left: `${Math.min(Math.max(left, pad), 100 - pad)}%`,
      transform: 'translateX(-50%)',
    }}
  >
    {children}
  </span>
);

export const PreferencesPanel: React.FC<PreferencesPanelProps> = ({
  prefs,
  onChange,
  matchCount,
  totalCount,
}) => {
  const set = <K extends keyof DiscoveryPreferences>(
    key: K,
    value: DiscoveryPreferences[K],
  ) => onChange({ ...prefs, [key]: value });

  // The two age thumbs share a track. They may land on the same value (a
  // single-year range is valid) but must never cross each other.
  const setAgeMin = (raw: number) => set('ageMin', Math.min(raw, prefs.ageMax));
  const setAgeMax = (raw: number) => set('ageMax', Math.max(raw, prefs.ageMin));

  const toggleIntent = (value: IntentType) => {
    const next = prefs.intents.includes(value)
      ? prefs.intents.filter((i) => i !== value)
      : [...prefs.intents, value];
    // Clearing every option would silently empty the deck with no way back
    // from the discover tab, so keep at least one selected.
    if (next.length === 0) return;
    set('intents', next);
  };

  // Tapping the active answer again clears it back to "no preference".
  const setLifestyle = (
    key: 'smoker' | 'drinker',
    value: Exclude<LifestyleFilter, null>,
  ) => set(key, prefs[key] === value ? null : value);

  const isDefault =
    prefs.showMe === DEFAULT_PREFERENCES.showMe &&
    prefs.ageMin === DEFAULT_PREFERENCES.ageMin &&
    prefs.ageMax === DEFAULT_PREFERENCES.ageMax &&
    prefs.maxDistanceKm === DEFAULT_PREFERENCES.maxDistanceKm &&
    prefs.intents.length === DEFAULT_PREFERENCES.intents.length &&
    prefs.smoker === null &&
    prefs.drinker === null;

  const ageMinPct = pct(prefs.ageMin, AGE_FLOOR, AGE_CEILING);
  const ageMaxPct = pct(prefs.ageMax, AGE_FLOOR, AGE_CEILING);
  const distPct = pct(prefs.maxDistanceKm, 1, DISTANCE_CEILING);

  const lifestyleRow = (
    label: string,
    key: 'smoker' | 'drinker',
  ) => (
    <div className="flex items-center justify-between">
      <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#17161B]">
        {label}
      </span>
      <div className="flex gap-1.5">
        {(['yes', 'no'] as const).map((value) => {
          const active = prefs[key] === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setLifestyle(key, value)}
              aria-pressed={active}
              aria-label={`${label} ${value}`}
              className={`w-[52px] py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-[0.08em] transition cursor-pointer ${
                active
                  ? 'bg-[#FF4D6D] text-white'
                  : 'bg-black/[0.05] text-black/45 hover:text-black/70'
              }`}
            >
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <section className="pt-7">
      <div className="flex items-baseline justify-between pb-3 border-b border-black/10">
        <h3 className="text-[15px] font-bold uppercase tracking-[0.18em] text-[#17161B]">
          Filters
        </h3>
        {!isDefault && (
          <button
            type="button"
            onClick={() => onChange(DEFAULT_PREFERENCES)}
            className="flex items-center gap-1 font-mono-tech text-[10px] uppercase tracking-[0.1em] text-black/40 hover:text-[#FF4D6D] transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* Location + radius */}
      <div className="pt-5">
        <SectionLabel>Location</SectionLabel>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-full bg-black/[0.05]">
          <MapPin className="w-3.5 h-3.5 text-black/40 shrink-0" />
          <span className="font-mono-tech text-[11px] uppercase tracking-[0.08em] text-black/55 truncate">
            {MY_LOCATION}
          </span>
        </div>
        <div className="relative h-5 flex items-center mt-7">
          <Bubble left={distPct}>within {prefs.maxDistanceKm} km</Bubble>
          <div className="absolute inset-x-0 h-[3px] rounded-full bg-black/[0.10]" />
          <div
            className="absolute left-0 h-[3px] rounded-full bg-[#FF4D6D]"
            style={{ width: `${distPct}%` }}
          />
          <input
            type="range"
            aria-label="Maximum distance in kilometres"
            min={1}
            max={DISTANCE_CEILING}
            value={prefs.maxDistanceKm}
            onChange={(e) => set('maxDistanceKm', Number(e.target.value))}
            className="range-input absolute inset-x-0 w-full"
          />
        </div>
      </div>

      {/* Age range */}
      <div className="pt-7">
        <SectionLabel>Age range</SectionLabel>
        <div className="relative h-5 flex items-center mt-4">
          <Bubble left={(ageMinPct + ageMaxPct) / 2}>
            {prefs.ageMin}–{prefs.ageMax}
          </Bubble>
          <div className="absolute inset-x-0 h-[3px] rounded-full bg-black/[0.10]" />
          <div
            className="absolute h-[3px] rounded-full bg-[#FF4D6D]"
            style={{ left: `${ageMinPct}%`, right: `${100 - ageMaxPct}%` }}
          />
          <input
            type="range"
            aria-label="Minimum age"
            min={AGE_FLOOR}
            max={AGE_CEILING}
            value={prefs.ageMin}
            onChange={(e) => setAgeMin(Number(e.target.value))}
            className="range-input absolute inset-x-0 w-full"
          />
          <input
            type="range"
            aria-label="Maximum age"
            min={AGE_FLOOR}
            max={AGE_CEILING}
            value={prefs.ageMax}
            onChange={(e) => setAgeMax(Number(e.target.value))}
            className="range-input absolute inset-x-0 w-full"
          />
        </div>
      </div>

      {/* Gender */}
      <div className="pt-7">
        <SectionLabel>Looking for</SectionLabel>
        <div className="flex p-1 rounded-full bg-black/[0.05]">
          {SHOW_ME_OPTIONS.map((opt) => {
            const active = prefs.showMe === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => set('showMe', opt.value)}
                aria-pressed={active}
                className={`flex-1 py-2 rounded-full text-[11px] font-semibold uppercase tracking-[0.08em] transition cursor-pointer ${
                  active
                    ? 'bg-[#FF4D6D] text-white'
                    : 'text-black/45 hover:text-black/70'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Intent */}
      <div className="pt-7">
        <SectionLabel>Intentions</SectionLabel>
        <div className="flex flex-wrap gap-1.5">
          {INTENT_OPTIONS.map((opt) => {
            const active = prefs.intents.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleIntent(opt.value)}
                aria-pressed={active}
                className={`px-3 py-1.5 rounded-full text-[12px] transition cursor-pointer border ${
                  active
                    ? 'bg-[#FF4D6D]/10 border-[#FF4D6D]/35 text-[#E11D48]'
                    : 'bg-transparent border-black/[0.12] text-black/45 hover:border-black/25'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lifestyle */}
      <div className="mt-7 pt-6 border-t border-black/10 space-y-3">
        {lifestyleRow('Smoke', 'smoker')}
        {lifestyleRow('Drink', 'drinker')}
      </div>

      <p className="mt-6 font-mono-tech text-[10.5px] uppercase tracking-[0.1em] text-black/40">
        {matchCount} of {totalCount} profiles match
      </p>
    </section>
  );
};
