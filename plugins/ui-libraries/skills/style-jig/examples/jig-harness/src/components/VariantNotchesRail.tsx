import React, { useState } from 'react';
import { getDonorVariantsForStyle, type StyleSlot } from '../data/jigHarnessData';
import { cn } from '../utils/cn';

interface VariantNotchesRailProps {
  activeStyle: StyleSlot;
  activeVariant: number;
  visible: boolean;
  onSelectVariant: (variant: number) => void;
}

export const VariantNotchesRail: React.FC<VariantNotchesRailProps> = ({
  activeStyle,
  activeVariant,
  visible,
  onSelectVariant,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [scrubbing, setScrubbing] = useState(false);

  const variants = getDonorVariantsForStyle(activeStyle);
  if (!visible || activeStyle === 'clone' || variants.length === 0) {
    return null;
  }

  const previewIdx = hoveredIdx !== null ? hoveredIdx : null;
  const previewItem = previewIdx !== null ? variants[previewIdx] : null;

  return (
    <nav
      id="jigStyleVariants"
      className="right-variant-notches"
      aria-label="Style donor variants"
      onPointerLeave={() => {
        setHoveredIdx(null);
        setScrubbing(false);
      }}
      onPointerUp={() => setScrubbing(false)}
    >
      <div className="rvn-track">
        {variants.map((item, idx) => {
          const variantNum = idx + 1;
          const isActive = activeVariant === variantNum;
          return (
            <button
              key={item.file}
              type="button"
              className={cn('rvn-notch', isActive && 'active')}
              aria-label={item.label}
              aria-pressed={isActive}
              onPointerEnter={() => {
                setHoveredIdx(idx);
                if (scrubbing) {
                  onSelectVariant(variantNum);
                }
              }}
              onPointerDown={() => {
                setScrubbing(true);
                setHoveredIdx(idx);
                onSelectVariant(variantNum);
              }}
              onFocus={() => setHoveredIdx(idx)}
              onBlur={() => setHoveredIdx(null)}
              onClick={() => onSelectVariant(variantNum)}
            >
              <img className="rvn-thumb" src={item.thumb} alt="" />
            </button>
          );
        })}
      </div>

      <div
        className={cn('rvn-tooltip', previewItem && 'visible')}
        role="status"
        aria-live="polite"
      >
        {previewItem && (
          <>
            <img className="rvn-tooltip-img" src={previewItem.thumb} alt="" />
            <span className="rvn-tooltip-label">{previewItem.label}</span>
          </>
        )}
      </div>
    </nav>
  );
};
