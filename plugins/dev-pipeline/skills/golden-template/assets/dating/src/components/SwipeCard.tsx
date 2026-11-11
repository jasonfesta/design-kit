import React, { useState, useRef, useEffect } from 'react';
import { BadgeCheck, MapPin, ChevronUp } from 'lucide-react';
import { DatingProfile } from '../data/datingData';

export type SwipeDirection = 'left' | 'right' | 'up';

interface SwipeCardProps {
  profile: DatingProfile;
  isTop: boolean;
  stackIndex: number;
  programmaticSwipe: SwipeDirection | null;
  onSwipeComplete: (direction: SwipeDirection, profile: DatingProfile) => void;
  onOpenDetails: (profile: DatingProfile) => void;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  profile,
  isTop,
  stackIndex,
  programmaticSwipe,
  onSwipeComplete,
  onOpenDetails,
}) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [flyOut, setFlyOut] = useState<SwipeDirection | null>(null);

  const startRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const committedRef = useRef(false);

  useEffect(() => {
    setPhotoIndex(0);
    setDrag({ x: 0, y: 0 });
    setIsDragging(false);
    setFlyOut(null);
    committedRef.current = false;
  }, [profile.id]);

  // Button / keyboard driven swipes. The ref guard keeps this from re-running
  // when `flyOut` changes, which would otherwise clear the completion timer.
  useEffect(() => {
    if (!isTop || !programmaticSwipe || committedRef.current) return;
    committedRef.current = true;
    setFlyOut(programmaticSwipe);
    const timer = setTimeout(() => onSwipeComplete(programmaticSwipe, profile), 300);
    return () => clearTimeout(timer);
  }, [isTop, programmaticSwipe, onSwipeComplete, profile]);


  const photo = profile.photos[photoIndex] || profile.photos[0];
  const [c1, c2, c3] = photo.palette;

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isTop || flyOut) return;
    if ((e.target as HTMLElement).closest('button')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    startRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    setIsDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !startRef.current || !isTop) return;
    setDrag({
      x: e.clientX - startRef.current.x,
      y: e.clientY - startRef.current.y,
    });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !startRef.current || !isTop) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    const elapsed = Date.now() - startRef.current.time;

    setIsDragging(false);
    startRef.current = null;

    // Quick tap: navigate photo stories, or open details from the lower info area.
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && elapsed < 250) {
      const rect = cardRef.current?.getBoundingClientRect();
      if (rect) {
        const relX = (e.clientX - rect.left) / rect.width;
        const relY = (e.clientY - rect.top) / rect.height;
        if (relY > 0.74) {
          onOpenDetails(profile);
        } else if (relX < 0.36) {
          setPhotoIndex((p) => (p > 0 ? p - 1 : profile.photos.length - 1));
        } else {
          setPhotoIndex((p) => (p < profile.photos.length - 1 ? p + 1 : 0));
        }
      }
      setDrag({ x: 0, y: 0 });
      return;
    }

    const velocity = Math.abs(dx) / Math.max(elapsed, 1);
    if (dx > 95 || (dx > 55 && velocity > 0.45)) {
      committedRef.current = true;
      setFlyOut('right');
      setTimeout(() => onSwipeComplete('right', profile), 280);
    } else if (dx < -95 || (dx < -55 && velocity > 0.45)) {
      committedRef.current = true;
      setFlyOut('left');
      setTimeout(() => onSwipeComplete('left', profile), 280);
    } else if (dy < -100 && Math.abs(dx) < 80) {
      committedRef.current = true;
      setFlyOut('up');
      setTimeout(() => onSwipeComplete('up', profile), 280);
    } else {
      setDrag({ x: 0, y: 0 });
    }
  };

  let tx = drag.x;
  let ty = drag.y;
  let rot = drag.x * 0.045;
  let opacity = 1;

  if (flyOut === 'right') {
    tx = 520;
    ty = 60;
    rot = 20;
    opacity = 0;
  } else if (flyOut === 'left') {
    tx = -520;
    ty = 60;
    rot = -20;
    opacity = 0;
  } else if (flyOut === 'up') {
    tx = 0;
    ty = -600;
    opacity = 0;
  }

  const likeOpacity = flyOut === 'right' ? 1 : Math.min(1, Math.max(0, (drag.x - 24) / 80));
  const nopeOpacity = flyOut === 'left' ? 1 : Math.min(1, Math.max(0, (-drag.x - 24) / 80));
  const superOpacity = flyOut === 'up' ? 1 : Math.min(1, Math.max(0, (-drag.y - 40) / 80));

  const scale = isTop ? 1 : Math.max(0.92, 1 - stackIndex * 0.04);
  const offsetY = isTop ? 0 : stackIndex * 10;
  const stackOpacity = flyOut ? 0 : isTop ? opacity : Math.max(0.5, 1 - stackIndex * 0.3);

  return (
    <div
      ref={cardRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        transform: isTop
          ? `translate3d(${tx}px, ${ty}px, 0) rotate(${rot}deg)`
          : `translate3d(0, ${offsetY}px, 0) scale(${scale})`,
        opacity: stackOpacity,
        zIndex: 30 - stackIndex,
        transition: isDragging
          ? 'none'
          : 'transform 0.38s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease',
        touchAction: 'none',
      }}
      className={`absolute inset-0 rounded-[26px] overflow-hidden select-none bg-[#E7E4DE] shadow-[0_18px_40px_-14px_rgba(0,0,0,0.35)] ${
        isTop ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'
      }`}
    >
      {/* Colour wash fallback derived from the photo palette */}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(160deg, ${c1}40, ${c2}30 45%, ${c3})` }}
      />

      <img
        src={photo.url}
        alt={`${profile.name} — ${photo.caption}`}
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Legibility scrims */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />

      {/* Story progress bars */}
      <div className="absolute top-3 inset-x-3 z-20 flex gap-1">
        {profile.photos.map((p, idx) => (
          <button
            key={p.id}
            type="button"
            aria-label={`Photo ${idx + 1}`}
            onClick={(e) => {
              e.stopPropagation();
              setPhotoIndex(idx);
            }}
            className="h-[3px] flex-1 rounded-full bg-white/30 overflow-hidden cursor-pointer"
          >
            <div
              className={`h-full rounded-full bg-white transition-all duration-300 ${
                idx === photoIndex ? 'w-full' : idx < photoIndex ? 'w-full opacity-60' : 'w-0'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Presence + match score */}
      <div className="absolute top-7 inset-x-3.5 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-sm">
          <span
            className={`w-[6px] h-[6px] rounded-full ${
              profile.activeStatus === 'Online now' ? 'bg-[#4ADE80]' : 'bg-white/50'
            }`}
          />
          <span className="font-mono-tech text-[10px] text-white/85 tracking-tight">
            {profile.activeStatus}
          </span>
        </div>
        <div className="flex items-center px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-sm">
          <span className="font-mono-tech text-[10px] text-white/85 tracking-tight">
            {profile.compatibilityScore}% match
          </span>
        </div>
      </div>

      {/* Swipe intent stamps */}
      {likeOpacity > 0.02 && (
        <div
          style={{ opacity: likeOpacity, transform: 'rotate(-12deg)' }}
          className="absolute top-20 left-5 z-30 pointer-events-none border-2 border-[#4ADE80] px-3 py-1 rounded-lg"
        >
          <span className="font-grotesk text-xl font-extrabold tracking-[0.18em] text-[#4ADE80]">
            LIKE
          </span>
        </div>
      )}
      {nopeOpacity > 0.02 && (
        <div
          style={{ opacity: nopeOpacity, transform: 'rotate(12deg)' }}
          className="absolute top-20 right-5 z-30 pointer-events-none border-2 border-[#FB7185] px-3 py-1 rounded-lg"
        >
          <span className="font-grotesk text-xl font-extrabold tracking-[0.18em] text-[#FB7185]">
            NOPE
          </span>
        </div>
      )}
      {superOpacity > 0.02 && (
        <div
          style={{ opacity: superOpacity }}
          className="absolute bottom-40 left-1/2 -translate-x-1/2 z-30 pointer-events-none border-2 border-[#38BDF8] px-4 py-1 rounded-lg whitespace-nowrap"
        >
          <span className="font-grotesk text-lg font-extrabold tracking-[0.18em] text-[#38BDF8]">
            SUPER SPARK
          </span>
        </div>
      )}

      {/* Identity block */}
      <div className="absolute inset-x-0 bottom-0 z-20 px-5 pb-5">
        <p className="font-mono-tech text-[10px] uppercase tracking-[0.14em] text-white/55 mb-2">
          {photo.caption}
        </p>

        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <h2 className="text-[32px] leading-none font-extrabold tracking-[-0.02em] text-white">
                {profile.name}
              </h2>
              <span className="text-[24px] leading-none font-light text-white/70">
                {profile.age}
              </span>
              {profile.verified && (
                <BadgeCheck className="w-[18px] h-[18px] text-[#38BDF8] shrink-0 self-center" />
              )}
            </div>

            <p className="mt-1.5 text-[13px] text-white/75 truncate">{profile.role}</p>

            <div className="mt-1 flex items-center gap-1 text-[12px] text-white/55">
              <MapPin className="w-3 h-3 shrink-0" />
              <span>
                {profile.neighborhood} · {profile.distanceKm} km away
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(profile);
            }}
            aria-label={`Open ${profile.name}'s full profile`}
            className="w-9 h-9 rounded-full bg-white/12 hover:bg-white/22 backdrop-blur-sm flex items-center justify-center text-white shrink-0 transition active:scale-90 cursor-pointer"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-3 flex gap-1.5 overflow-hidden">
          {profile.interests.slice(0, 3).map((item) => (
            <span
              key={item.label}
              className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm text-[11px] text-white/85 whitespace-nowrap"
            >
              {item.icon} {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
