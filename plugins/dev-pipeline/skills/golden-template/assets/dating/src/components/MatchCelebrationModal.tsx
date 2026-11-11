import React, { useState } from 'react';
import { Send, X } from 'lucide-react';
import { DatingProfile, MY_PORTRAIT } from '../data/datingData';

interface MatchCelebrationModalProps {
  profile: DatingProfile | null;
  matchType: 'like' | 'super';
  onClose: () => void;
  onSendMessage: (profile: DatingProfile, messageText: string) => void;
}

export const MatchCelebrationModal: React.FC<MatchCelebrationModalProps> = ({
  profile,
  matchType,
  onClose,
  onSendMessage,
}) => {
  const [messageText, setMessageText] = useState('');

  if (!profile) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = messageText.trim();
    if (!trimmed) return;
    onSendMessage(profile, trimmed);
    setMessageText('');
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-5 bg-[#FDFCFA]/[0.97] backdrop-blur-sm">
      {/* Soft accent glow so the celebration does not read as an empty screen */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,77,109,0.20), transparent 68%)' }}
      />

      <div className="relative w-full max-w-[340px]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-2 right-0 w-9 h-9 rounded-full bg-black/[0.07] hover:bg-black/[0.12] flex items-center justify-center text-black/65 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center pt-8">
          <p className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-[#FF4D6D] mb-3">
            {matchType === 'super' ? 'Super Spark returned' : `${profile.compatibilityScore}% match`}
          </p>

          <h2 className="font-serif-display italic text-[52px] leading-[0.95] text-[#17161B] mb-3">
            It’s Kismet
          </h2>

          <p className="text-[13px] text-black/55 max-w-[260px] mx-auto">
            You and {profile.name} liked each other.
          </p>
        </div>

        {/* Overlapping portraits */}
        <div className="flex items-center justify-center mt-7 mb-5">
          <img
            src={MY_PORTRAIT}
            alt="You"
            className="w-[104px] h-[104px] rounded-full object-cover border-2 border-white -mr-5 -rotate-6"
          />
          <img
            src={profile.photos[0].url}
            alt={profile.name}
            className="w-[104px] h-[104px] rounded-full object-cover border-2 border-white -ml-5 rotate-6"
          />
        </div>

        {/* Shared ground */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-6">
          {profile.interests.slice(0, 3).map((interest) => (
            <span
              key={interest.label}
              className="px-2.5 py-1 rounded-full bg-black/[0.055] text-[11px] text-black/65"
            >
              {interest.icon} {interest.label}
            </span>
          ))}
        </div>

        {/* Icebreakers */}
        <div className="space-y-1.5 mb-4">
          {profile.icebreakers.slice(0, 2).map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSendMessage(profile, prompt)}
              className="w-full text-left px-4 py-2.5 rounded-xl bg-black/[0.05] hover:bg-black/[0.10] text-[12.5px] leading-snug text-black/80 transition flex items-center justify-between gap-3 cursor-pointer group"
            >
              <span>{prompt}</span>
              <Send className="w-3.5 h-3.5 text-[#FF4D6D] shrink-0 opacity-60 group-hover:opacity-100 transition" />
            </button>
          ))}
        </div>

        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder={`Message ${profile.name}`}
            className="flex-1 px-4 py-3 rounded-full bg-black/[0.06] text-[13px] text-[#17161B] placeholder:text-black/40 focus:outline-none focus:bg-black/[0.10]"
          />
          <button
            type="submit"
            aria-label="Send message"
            className="w-11 h-11 rounded-full bg-[#FF4D6D] text-white flex items-center justify-center shrink-0 hover:brightness-110 transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-4 text-[11px] font-mono-tech uppercase tracking-[0.14em] text-black/40 hover:text-black/65 cursor-pointer"
        >
          Keep swiping
        </button>
      </div>
    </div>
  );
};
