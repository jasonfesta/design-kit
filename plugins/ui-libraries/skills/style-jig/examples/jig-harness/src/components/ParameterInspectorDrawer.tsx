import React, { useEffect, useRef, useState } from 'react';
import {
  INSPECTOR_SCHEMA_DEFINITIONS,
  type InspectorSchemaKey,
  type ScrubSliderSpec,
} from '../data/jigHarnessData';
import { cn } from '../utils/cn';

interface DragScrubRowProps {
  spec: ScrubSliderSpec;
  value: number;
  onScrubStart: () => void;
  onChange: (next: number) => void;
}

const DragScrubRow: React.FC<DragScrubRowProps> = ({
  spec,
  value,
  onScrubStart,
  onChange,
}) => {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const range = spec.max - spec.min;
  const pct = range > 0 ? Math.max(0, Math.min(100, ((value - spec.min) / range) * 100)) : 0;

  const updateFromClientX = (clientX: number) => {
    const el = rowRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const raw = spec.min + ratio * range;
    const factor = Math.pow(10, spec.decimals);
    const rounded = Math.round(raw * factor) / factor;
    onChange(rounded);
  };

  return (
    <div
      ref={rowRef}
      role="slider"
      tabIndex={0}
      aria-label={spec.label}
      aria-valuemin={spec.min}
      aria-valuemax={spec.max}
      aria-valuenow={value}
      className={cn('dk-slider-row', dragging && 'dragging')}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);
        onScrubStart();
        updateFromClientX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (!dragging) return;
        updateFromClientX(e.clientX);
      }}
      onPointerUp={(e) => {
        if (dragging) {
          setDragging(false);
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
          }
        }
      }}
      onPointerCancel={() => setDragging(false)}
      onKeyDown={(e) => {
        const step = spec.decimals === 0 ? 1 : spec.decimals === 1 ? 0.1 : 0.02;
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          e.preventDefault();
          onChange(Math.min(spec.max, Number((value + step).toFixed(spec.decimals))));
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          e.preventDefault();
          onChange(Math.max(spec.min, Number((value - step).toFixed(spec.decimals))));
        }
      }}
    >
      <div className="dk-slider-fill" style={{ width: `${pct.toFixed(2)}%` }} />
      <span className="dk-slider-label">{spec.label}</span>
      <span className="dk-slider-val">{value.toFixed(spec.decimals)}</span>
    </div>
  );
};

interface ParameterInspectorDrawerProps {
  schemaKey: InspectorSchemaKey | null;
  collapsed: boolean;
  pairedWithMobile: boolean;
  values: Record<string, string | number | boolean> | null;
  onChangeValue: (key: string, value: string | number | boolean) => void;
  onReset: () => void;
  onCollapse: () => void;
  onInteractStart: () => void;
}

export const ParameterInspectorDrawer: React.FC<ParameterInspectorDrawerProps> = ({
  schemaKey,
  collapsed,
  pairedWithMobile,
  values,
  onChangeValue,
  onReset,
  onCollapse,
  onInteractStart,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setDropdownOpen(false);
  }, [schemaKey]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const onDocDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDropdownOpen(false);
    };
    document.addEventListener('mousedown', onDocDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [dropdownOpen]);

  if (!schemaKey || !values || collapsed) return null;

  const schema = INSPECTOR_SCHEMA_DEFINITIONS[schemaKey];

  const handleCopy = () => {
    const payload = JSON.stringify({ schema: schemaKey, ...values }, null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(payload).catch(() => {});
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <aside
      id="dk-inspector-panel"
      className={cn('dk-panel no-scrollbar', pairedWithMobile && 'mapp-paired')}
      aria-label={`${schema.title} jig`}
    >
      <div className="dk-root-header">
        <span className="dk-root-title">{schema.title}</span>
        <button
          type="button"
          className="dk-collapse-word"
          onClick={onCollapse}
        >
          hide
        </button>
      </div>

      <div className="dk-body">
        {/* Custom Stylized Jig Backplate Dropdown */}
        {schema.dropdown && (
          <div
            ref={dropdownRef}
            className={cn('dk-backplate-dropdown', dropdownOpen && 'open')}
          >
            <button
              type="button"
              className="dk-dropdown-trigger"
              aria-haspopup="listbox"
              aria-expanded={dropdownOpen}
              onClick={() => {
                onInteractStart();
                setDropdownOpen((o) => !o);
              }}
            >
              <span>{String(values[schema.dropdown.key])}</span>
              <svg
                className="dk-dropdown-chevron"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.85"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="dk-dropdown-menu" role="listbox">
                {schema.dropdown.options.map((opt) => {
                  const isActive = values[schema.dropdown!.key] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      className={cn('dk-dropdown-item', isActive && 'active')}
                      onClick={() => {
                        onChangeValue(schema.dropdown!.key, opt);
                        setDropdownOpen(false);
                      }}
                    >
                      <span>{opt}</span>
                      <span className="item-check" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Word Strip (`chain - helix - ring - wave - arch`) */}
        {schema.wordStrip && (
          <div className="dk-word-strip">
            {schema.wordStrip.options.map((word) => {
              const isActive = values[schema.wordStrip!.key] === word;
              return (
                <button
                  key={word}
                  type="button"
                  className={cn('dk-word-btn', isActive && 'active')}
                  onClick={() => {
                    onInteractStart();
                    onChangeValue(schema.wordStrip!.key, word);
                  }}
                >
                  {word}
                </button>
              );
            })}
          </div>
        )}

        {/* Segmented Tab Menus (`floating | bar | circle`) */}
        {schema.tabMenus &&
          schema.tabMenus.map((menu) => (
            <div
              key={menu.key}
              className={cn('dk-tab-menu', menu.primary && 'dk-tab-menu-primary')}
              role="tablist"
            >
              {menu.options.map((opt) => {
                const isActive = values[menu.key] === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={cn('dk-tab-btn', isActive && 'active')}
                    onClick={() => {
                      onInteractStart();
                      onChangeValue(menu.key, opt);
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          ))}

        {/* Signature 34px Horizontal Drag-Scrub Sliders */}
        <div className="dk-folder-rows">
          {schema.sliders.map((slider) => (
            <DragScrubRow
              key={slider.key}
              spec={slider}
              value={Number(values[slider.key] ?? schema.defaults[slider.key])}
              onScrubStart={onInteractStart}
              onChange={(nextVal) => onChangeValue(slider.key, nextVal)}
            />
          ))}
        </div>

        {/* Toggle Row (`auto-scroll`) */}
        {schema.toggle && (
          <button
            type="button"
            className={cn(
              'dk-toggle-row w-full',
              Boolean(values[schema.toggle.key]) && 'checked',
            )}
            onClick={() => {
              onInteractStart();
              onChangeValue(schema.toggle!.key, !values[schema.toggle!.key]);
            }}
          >
            <span>{schema.toggle.label}</span>
            <span className="dk-toggle-state">
              {values[schema.toggle.key] ? 'on' : 'off'}
            </span>
          </button>
        )}

        {/* Color Swatch Row (`surface`) */}
        {schema.swatch && (
          <div className="dk-readout-row">
            <span>{schema.swatch.label}</span>
            <input
              type="color"
              className="dk-color-swatch"
              value={String(values[schema.swatch.key] ?? '#242424')}
              onChange={(e) => onChangeValue(schema.swatch!.key, e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="dk-foot">
        <button type="button" className="dk-word-btn" onClick={handleCopy}>
          {copied ? 'copied' : 'copy'}
        </button>
        <button type="button" className="dk-word-btn" onClick={onReset}>
          reset
        </button>
      </div>
    </aside>
  );
};
