import React from 'react';
import { cn } from '../utils/cn';

export interface EmptyStageBayProps {
  mode: 'component' | 'full';
  isPlaying: boolean;
  travelProgress: number;
}

export const EmptyStageBay: React.FC<EmptyStageBayProps> = ({
  mode,
  isPlaying,
  travelProgress,
}) => {
  const floatOffsetPx = isPlaying ? Math.sin(travelProgress * Math.PI * 2) * 6 : 0;

  return (
    <div
      data-empty-stage-bay={mode}
      data-ap="stage-bay"
      className={cn(
        'blank-stage-surface mx-auto',
        mode === 'component'
          ? 'w-full max-w-[660px] h-[min(380px,calc(100vh-168px))]'
          : 'w-full max-w-[1152px] h-full max-h-[706px]',
      )}
      style={
        isPlaying
          ? { transform: `translate3d(0, ${floatOffsetPx.toFixed(2)}px, 0)` }
          : undefined
      }
    />
  );
};
