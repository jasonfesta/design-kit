import React, { useState } from 'react';
import {
  X,
  BadgeCheck,
  MapPin,
  Briefcase,
  GraduationCap,
  Music2,
  Heart,
  Star,
  Send,
} from 'lucide-react';
import { DatingProfile } from '../data/datingData';
import { SwipeDirection } from './SwipeCard';
import { VoicePromptPlayer } from './VoicePromptPlayer';

interface ProfileDetailSheetProps {
  profile: DatingProfile | null;
  onClose: () => void;
  onTriggerAction: (direction: SwipeDirection) => void;
  onSendPromptReply: (profile: DatingProfile, promptQuestion: string, replyText: string) => void;
}

export const ProfileDetailSheet: React.FC<ProfileDetailSheetProps> = ({
  profile,
  onClose,
  onTriggerAction,
  onSendPromptReply,
}) => {
  const [activePromptIdx, setActivePromptIdx] = useState<number | null>(null);
  const [promptReply, setPromptReply] = useState('');

  if (!profile) return null;

  const breakdown = [
    { label: 'Intellectual', value: profile.compatibilityBreakdown.intellectual },
    { label: 'Aesthetic', value: profile.compatibilityBreakdown.aesthetic },
    { label: 'Lifestyle', value: profile.compatibilityBreakdown.lifestyle },
    { label: 'Spontaneity', value: profile.compatibilityBreakdown.spontaneity },
  ];

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-[#FFFFFF]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/[0.08] shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-bold text-[15px] truncate">
            {profile.name}, {profile.age}
          </span>
          {profile.verified && <BadgeCheck className="w-4 h-4 text-[#0284C7] shrink-0" />}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close profile"
          className="w-8 h-8 rounded-full bg-black/[0.06] hover:bg-black/[0.12] flex items-center justify-center cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-5 space-y-6">
          {/* Hero */}
          <div className="relative h-[340px] rounded-2xl overflow-hidden">
            <img
              src={profile.photos[0].url}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/85 to-transparent" />
            <p className="absolute bottom-3 left-4 right-4 text-[12px] text-white/85">
              {profile.photos[0].caption}
            </p>
          </div>

          {/* Bio */}
          <p className="text-[14px] leading-relaxed text-black/80">{profile.bio}</p>

          {/* Facts */}
          <div className="space-y-2.5 text-[13px] text-black/65">
            <div className="flex items-center gap-2.5">
              <Briefcase className="w-4 h-4 text-black/40 shrink-0" />
              <span>{profile.role} · {profile.company}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-4 h-4 text-black/40 shrink-0" />
              <span>{profile.education}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-black/40 shrink-0" />
              <span>{profile.neighborhood}, {profile.city} · {profile.distanceKm} km away</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Heart className="w-4 h-4 text-black/40 shrink-0" />
              <span>{profile.intent}</span>
            </div>
          </div>

          {/* Voice prompt */}
          <VoicePromptPlayer
            voicePrompt={profile.voicePrompt}
            accentColor={profile.anthem.accentColor}
          />

          {/* Compatibility */}
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h3 className="font-mono-tech text-[10px] uppercase tracking-[0.16em] text-black/45">
                Compatibility
              </h3>
              <span className="text-[13px] font-semibold text-[#17161B]">
                {profile.compatibilityScore}%
              </span>
            </div>
            <div className="space-y-2.5">
              {breakdown.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-[12px] text-black/55 w-24 shrink-0">{item.label}</span>
                  <div className="flex-1 h-[3px] rounded-full bg-black/[0.07] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-black/70"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                  <span className="font-mono-tech text-[11px] text-black/45 w-8 text-right shrink-0">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Prompts */}
          <div className="space-y-3">
            {profile.prompts.map((p, i) => (
              <div key={i} className="p-4 rounded-2xl bg-black/[0.035] space-y-3">
                <p className="font-mono-tech text-[10px] uppercase tracking-[0.14em] text-black/45">
                  {p.question}
                </p>
                <p className="font-serif-display italic text-[22px] leading-snug text-[#17161B]">
                  {p.answer}
                </p>

                {activePromptIdx === i ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!promptReply.trim()) return;
                      onSendPromptReply(profile, p.question, promptReply.trim());
                      setPromptReply('');
                      setActivePromptIdx(null);
                      onClose();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={promptReply}
                      onChange={(e) => setPromptReply(e.target.value)}
                      placeholder="Write a reply"
                      className="flex-1 px-3 py-2 rounded-xl bg-black/[0.05] text-[12px] text-[#17161B] placeholder:text-black/40 focus:outline-none"
                    />
                    <button
                      type="submit"
                      aria-label="Send reply"
                      className="w-9 h-9 rounded-xl bg-[#FF4D6D] text-white flex items-center justify-center cursor-pointer shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActivePromptIdx(i)}
                    className="text-[11.5px] text-[#E11D48] hover:text-[#17161B] transition cursor-pointer"
                  >
                    Reply to this prompt →
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Remaining photos */}
          <div className="grid grid-cols-2 gap-2">
            {profile.photos.slice(1).map((photo) => (
              <div key={photo.id} className="relative h-40 rounded-2xl overflow-hidden">
                <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/85 to-transparent" />
                <p className="absolute bottom-2 left-2.5 right-2.5 text-[10.5px] text-white/85 line-clamp-2">
                  {photo.caption}
                </p>
              </div>
            ))}
          </div>

          {/* Basics */}
          <div>
            <h3 className="font-mono-tech text-[10px] uppercase tracking-[0.16em] text-black/45 mb-3">
              Basics
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[12.5px]">
              {Object.entries(profile.basics).map(([key, val]) => (
                <div key={key}>
                  <span className="text-black/40 capitalize block text-[10.5px]">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <span className="text-black/80">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Anthem */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-black/[0.035]">
            <Music2 className="w-5 h-5 shrink-0" style={{ color: profile.anthem.accentColor }} />
            <div className="min-w-0">
              <span className="font-mono-tech text-[10px] uppercase tracking-[0.14em] text-black/40 block">
                Anthem
              </span>
              <span className="text-[13px] text-[#17161B] truncate block">
                {profile.anthem.title} — {profile.anthem.artist}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="shrink-0 px-5 py-4 border-t border-black/[0.08] flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={() => {
            onClose();
            onTriggerAction('left');
          }}
          aria-label="Pass"
          className="w-13 h-13 rounded-full bg-black/[0.05] hover:bg-[#E11D48]/15 text-[#E11D48] flex items-center justify-center transition active:scale-95 cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>
        <button
          type="button"
          onClick={() => {
            onClose();
            onTriggerAction('up');
          }}
          aria-label="Super Spark"
          className="w-11 h-11 rounded-full bg-black/[0.05] hover:bg-[#0284C7]/15 text-[#0284C7] flex items-center justify-center transition active:scale-95 cursor-pointer"
        >
          <Star className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => {
            onClose();
            onTriggerAction('right');
          }}
          aria-label="Like"
          className="w-13 h-13 rounded-full bg-[#FF4D6D] text-white flex items-center justify-center transition active:scale-95 hover:brightness-110 cursor-pointer"
        >
          <Heart className="w-6 h-6 fill-white" />
        </button>
      </div>
    </div>
  );
};
