import React, { useState, useRef, useEffect } from 'react';
import { Play, Square } from 'lucide-react';
import { VoicePrompt } from '../data/datingData';

interface VoicePromptPlayerProps {
  voicePrompt: VoicePrompt;
  accentColor?: string;
}

const BAR_HEIGHTS = [
  34, 62, 46, 82, 90, 54, 40, 76, 94, 58, 44, 86, 70, 48, 88, 62, 42, 78, 66,
  52, 74, 44, 58, 36,
];

export const VoicePromptPlayer: React.FC<VoicePromptPlayerProps> = ({
  voicePrompt,
  accentColor = '#FF4D6D',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);

  const stopAudio = () => {
    setIsPlaying(false);
    setProgress(0);
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
  };

  useEffect(() => stopAudio, [voicePrompt.question]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      stopAudio();
      return;
    }

    setIsPlaying(true);
    setProgress(0);

    // Synthesize a short warm cadence so the prompt has audible feedback.
    try {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctor();
      audioCtxRef.current = ctx;

      const now = ctx.currentTime;
      const root = voicePrompt.baseFreq || 329.63;
      [root, root * 1.25, root * 1.5, root * 1.875].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.45);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.035, now + idx * 0.45 + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + 4.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.35);
        osc.stop(now + 4.5);
      });
    } catch {
      // Visual-only playback if the audio context is unavailable.
    }

    const startTime = Date.now();
    intervalRef.current = window.setInterval(() => {
      const pct = Math.min(100, ((Date.now() - startTime) / 4500) * 100);
      setProgress(pct);
      if (pct >= 100) stopAudio();
    }, 60);
  };

  return (
    <div className="p-4 rounded-2xl bg-black/[0.035] space-y-3">
      <p className="font-mono-tech text-[10px] uppercase tracking-[0.16em] text-black/45">
        Voice prompt · 0:{voicePrompt.durationSec}
      </p>

      <p className="text-[13px] font-medium text-black/85">{voicePrompt.question}</p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Stop voice prompt' : 'Play voice prompt'}
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white transition hover:brightness-110 cursor-pointer"
          style={{ backgroundColor: accentColor }}
        >
          {isPlaying ? (
            <Square className="w-3.5 h-3.5 fill-white" />
          ) : (
            <Play className="w-4 h-4 fill-white ml-0.5" />
          )}
        </button>

        <div className="flex-1 flex items-center gap-[3px] h-8">
          {BAR_HEIGHTS.map((h, idx) => {
            const barPos = (idx / BAR_HEIGHTS.length) * 100;
            const played = isPlaying && barPos <= progress;
            return (
              <div
                key={idx}
                className="flex-1 rounded-full transition-all duration-150"
                style={{
                  height: `${h * (isPlaying ? 0.85 : 0.6)}%`,
                  backgroundColor: played ? accentColor : 'rgba(23,22,27,0.16)',
                }}
              />
            );
          })}
        </div>
      </div>

      <p className="text-[12.5px] italic leading-relaxed text-black/60">
        {voicePrompt.transcript}
      </p>
    </div>
  );
};
