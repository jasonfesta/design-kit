import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  RotateCcw,
  X,
  Star,
  Heart,
  Flame,
  MessageCircle,
  User,
  Send,
  ChevronLeft,
  BadgeCheck,
  CalendarHeart,
} from 'lucide-react';
import {
  DATING_PROFILES,
  INITIAL_MATCH_THREADS,
  MY_PORTRAIT,
  DEFAULT_PREFERENCES,
  matchesPreferences,
  DatingProfile,
  DiscoveryPreferences,
  MatchThread,
} from './data/datingData';
import { KismetBrandLogo } from './components/KismetBrandLogo';
import { SwipeCard, SwipeDirection } from './components/SwipeCard';
import { MatchCelebrationModal } from './components/MatchCelebrationModal';
import { ProfileDetailSheet } from './components/ProfileDetailSheet';
import { PreferencesPanel } from './components/PreferencesPanel';

const DATE_SPOTS = [
  { spot: 'Hosoi Listening Bar', time: 'Thu · 20:30', vibe: 'Vinyl sets and yuzu highballs' },
  { spot: 'Tyge & Sessil', time: 'Fri · 19:45', vibe: 'Natural wine, candlelight' },
  { spot: 'Drop Coffee', time: 'Sat · 10:30', vibe: 'Cardamom buns and pour-over' },
  { spot: 'Fotografiska Rooftop', time: 'Sun · 18:00', vibe: 'Exhibition, then sunset' },
];

export function App() {
  const [activeTab, setActiveTab] = useState<'discover' | 'matches' | 'profile'>('discover');
  const [swipedIds, setSwipedIds] = useState<string[]>([]);
  const [history, setHistory] = useState<{ profile: DatingProfile; direction: SwipeDirection }[]>([]);
  const [programmaticSwipe, setProgrammaticSwipe] = useState<SwipeDirection | null>(null);
  const [detailProfile, setDetailProfile] = useState<DatingProfile | null>(null);
  const [celebration, setCelebration] = useState<{
    profile: DatingProfile;
    type: 'like' | 'super';
  } | null>(null);
  const [threads, setThreads] = useState<MatchThread[]>(INITIAL_MATCH_THREADS);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [showDateSpots, setShowDateSpots] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<DiscoveryPreferences>(DEFAULT_PREFERENCES);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast((prev) => (prev === msg ? null : prev)), 2000);
  }, []);

  /** Everyone who passes the discovery filters, swiped or not. */
  const eligible = useMemo(
    () => DATING_PROFILES.filter((p) => matchesPreferences(p, prefs)),
    [prefs],
  );

  const deck = useMemo(
    () => eligible.filter((p) => !swipedIds.includes(p.id)),
    [eligible, swipedIds],
  );

  const handleSwipeComplete = useCallback(
    (direction: SwipeDirection, profile: DatingProfile) => {
      setProgrammaticSwipe(null);
      setSwipedIds((prev) => (prev.includes(profile.id) ? prev : [...prev, profile.id]));
      setHistory((prev) => [{ profile, direction }, ...prev]);

      if (direction === 'left') {
        showToast(`Passed on ${profile.name}`);
        return;
      }

      const type = direction === 'up' ? 'super' : 'like';
      setCelebration({ profile, type });
      setThreads((prev) => {
        if (prev.some((t) => t.profile.id === profile.id)) return prev;
        return [
          {
            profile,
            matchedAt: 'Just now',
            matchType: type,
            unread: true,
            messages: [
              {
                id: `welcome-${Date.now()}`,
                sender: 'them',
                text: profile.sampleReplies[0],
                timestamp: 'Now',
              },
            ],
          },
          ...prev,
        ];
      });
    },
    [showToast],
  );

  const triggerSwipe = useCallback(
    (direction: SwipeDirection) => {
      if (deck.length === 0 || programmaticSwipe) return;
      setProgrammaticSwipe(direction);
    },
    [deck.length, programmaticSwipe],
  );

  const handleRewind = useCallback(() => {
    if (history.length === 0 || programmaticSwipe) {
      showToast('Nothing to rewind');
      return;
    }
    const [last, ...rest] = history;
    setHistory(rest);
    setSwipedIds((prev) => prev.filter((id) => id !== last.profile.id));
    showToast(`${last.profile.name} is back`);
  }, [history, programmaticSwipe, showToast]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'discover' || celebration || detailProfile) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        triggerSwipe('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        triggerSwipe('right');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        triggerSwipe('up');
      } else if (e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleRewind();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeTab, celebration, detailProfile, triggerSwipe, handleRewind]);

  const sendMessage = (
    profile: DatingProfile,
    text: string,
    dateInvite?: { spot: string; time: string; vibe: string; accepted?: boolean },
  ) => {
    const stamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msgId = `msg-${Date.now()}`;

    setThreads((prev) => {
      const exists = prev.some((t) => t.profile.id === profile.id);
      const msg = { id: msgId, sender: 'me' as const, text, timestamp: stamp, dateInvite };
      if (exists) {
        return prev.map((t) =>
          t.profile.id === profile.id
            ? { ...t, unread: false, messages: [...t.messages, msg] }
            : t,
        );
      }
      return [
        { profile, matchedAt: 'Just now', matchType: 'like', unread: false, messages: [msg] },
        ...prev,
      ];
    });

    setCelebration(null);
    setActiveTab('matches');
    setSelectedChatId(profile.id);

    setTimeout(() => {
      setThreads((prev) =>
        prev.map((t) => {
          if (t.profile.id !== profile.id) return t;
          const reply = dateInvite
            ? `${dateInvite.spot} is one of my favourite places. ${dateInvite.time} works.`
            : profile.sampleReplies[t.messages.length % profile.sampleReplies.length];
          return {
            ...t,
            messages: [
              ...t.messages.map((m) =>
                m.id === msgId && m.dateInvite
                  ? { ...m, dateInvite: { ...m.dateInvite, accepted: true } }
                  : m,
              ),
              {
                id: `reply-${Date.now()}`,
                sender: 'them' as const,
                text: reply,
                timestamp: new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
              },
            ],
          };
        }),
      );
    }, 900);
  };

  const handlePromptReply = (profile: DatingProfile, question: string, reply: string) => {
    setSwipedIds((prev) => (prev.includes(profile.id) ? prev : [...prev, profile.id]));
    sendMessage(profile, `On “${question}” — ${reply}`);
  };

  const activeThread = threads.find((t) => t.profile.id === selectedChatId) || null;
  const unreadCount = threads.filter((t) => t.unread).length;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages.length]);

  return (
    <div className="min-h-[100dvh] w-full bg-[#E7E4DE] flex items-center justify-center sm:p-6">
      <main className="relative w-full sm:w-[400px] h-[100dvh] sm:h-[812px] bg-[#FFFFFF] text-[#17161B] sm:rounded-[36px] sm:border sm:border-black/10 overflow-hidden flex flex-col shadow-[0_24px_70px_-20px_rgba(23,22,27,0.28)]">
        {/* Header */}
        <header className="px-5 pt-5 pb-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <KismetBrandLogo size={24} />
            <span className="font-grotesk font-extrabold text-[17px] tracking-[-0.02em]">
              kismet
            </span>
          </div>
          <span className="font-mono-tech text-[10px] uppercase tracking-[0.16em] text-black/40">
            Stockholm
          </span>
        </header>

        {/* Toast */}
        {toast && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 px-3.5 py-1.5 rounded-full bg-[#17161B] text-[12px] text-white/95 pointer-events-none whitespace-nowrap shadow-[0_6px_18px_-6px_rgba(23,22,27,0.5)]">
            {toast}
          </div>
        )}

        {/* DISCOVER */}
        {activeTab === 'discover' && (
          <div className="flex-1 flex flex-col px-4 pb-2 overflow-hidden">
            <div className="relative flex-1 min-h-0">
              {deck.length > 0 ? (
                deck
                  .slice(0, 3)
                  .reverse()
                  .map((profile, idx, arr) => {
                    const stackIndex = arr.length - 1 - idx;
                    const isTop = stackIndex === 0;
                    return (
                      <SwipeCard
                        key={profile.id}
                        profile={profile}
                        isTop={isTop}
                        stackIndex={stackIndex}
                        programmaticSwipe={isTop ? programmaticSwipe : null}
                        onSwipeComplete={handleSwipeComplete}
                        onOpenDetails={setDetailProfile}
                      />
                    );
                  })
              ) : (
                <div className="h-full rounded-[26px] bg-black/[0.03] flex flex-col items-center justify-center px-8 text-center">
                  <KismetBrandLogo size={40} className="mb-5 opacity-80" />
                  {eligible.length === 0 ? (
                    <>
                      <h3 className="font-serif-display italic text-[30px] leading-tight mb-2.5">
                        Nobody fits those filters
                      </h3>
                      <p className="text-[13px] text-black/45 mb-7 max-w-[240px]">
                        Your discovery preferences rule out everyone in range. Widen them to
                        see more people.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('profile')}
                        className="px-6 py-3 rounded-full bg-[#FF4D6D] text-white text-[12px] font-semibold tracking-wide hover:brightness-110 transition cursor-pointer"
                      >
                        Adjust preferences
                      </button>
                    </>
                  ) : (
                    <>
                      <h3 className="font-serif-display italic text-[30px] leading-tight mb-2.5">
                        That’s everyone nearby
                      </h3>
                      <p className="text-[13px] text-black/45 mb-7 max-w-[240px]">
                        You have seen every profile in range. Reset to run through the deck again.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSwipedIds([]);
                          setHistory([]);
                        }}
                        className="px-6 py-3 rounded-full bg-[#FF4D6D] text-white text-[12px] font-semibold tracking-wide hover:brightness-110 transition cursor-pointer"
                      >
                        Reset deck
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Action dock */}
            <div className="pt-5 pb-3 flex items-center justify-center gap-4 shrink-0">
              <button
                type="button"
                onClick={handleRewind}
                aria-label="Rewind"
                className="w-11 h-11 rounded-full bg-black/[0.05] hover:bg-black/[0.10] text-[#C2820A] flex items-center justify-center transition active:scale-90 cursor-pointer"
              >
                <RotateCcw className="w-[18px] h-[18px]" />
              </button>

              <button
                type="button"
                onClick={() => triggerSwipe('left')}
                aria-label="Pass"
                className="w-15 h-15 rounded-full bg-black/[0.05] hover:bg-[#E11D48]/15 text-[#E11D48] flex items-center justify-center transition active:scale-90 cursor-pointer"
              >
                <X className="w-7 h-7" />
              </button>

              <button
                type="button"
                onClick={() => triggerSwipe('up')}
                aria-label="Super Spark"
                className="w-12 h-12 rounded-full bg-black/[0.05] hover:bg-[#0284C7]/15 text-[#0284C7] flex items-center justify-center transition active:scale-90 cursor-pointer"
              >
                <Star className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => triggerSwipe('right')}
                aria-label="Like"
                className="w-15 h-15 rounded-full bg-[#FF4D6D] text-white flex items-center justify-center transition active:scale-90 hover:brightness-110 cursor-pointer"
              >
                <Heart className="w-7 h-7 fill-white" />
              </button>
            </div>
          </div>
        )}

        {/* MATCHES */}
        {activeTab === 'matches' && !activeThread && (
          <div className="flex-1 overflow-y-auto px-5 pb-4">
            <h2 className="font-mono-tech text-[10px] uppercase tracking-[0.16em] text-black/40 mb-3">
              New matches
            </h2>
            <div className="flex gap-3.5 overflow-x-auto pb-4">
              {threads.map((t) => (
                <button
                  key={t.profile.id}
                  type="button"
                  onClick={() => {
                    setSelectedChatId(t.profile.id);
                    setThreads((prev) =>
                      prev.map((x) =>
                        x.profile.id === t.profile.id ? { ...x, unread: false } : x,
                      ),
                    );
                  }}
                  className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group"
                >
                  <div className="relative">
                    <img
                      src={t.profile.photos[0].url}
                      alt={t.profile.name}
                      className="w-[62px] h-[62px] rounded-full object-cover"
                    />
                    {t.matchType === 'super' && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#0284C7] border-2 border-[#FFFFFF] flex items-center justify-center">
                        <Star className="w-2.5 h-2.5 fill-[#FFFFFF] text-[#FFFFFF]" />
                      </span>
                    )}
                  </div>
                  <span className="text-[12px] text-black/70 group-hover:text-[#17161B] transition">
                    {t.profile.name}
                  </span>
                </button>
              ))}
            </div>

            <h2 className="font-mono-tech text-[10px] uppercase tracking-[0.16em] text-black/40 mt-3 mb-2">
              Messages
            </h2>
            <div>
              {threads.map((t) => {
                const last = t.messages[t.messages.length - 1];
                return (
                  <button
                    key={t.profile.id}
                    type="button"
                    onClick={() => {
                      setSelectedChatId(t.profile.id);
                      setThreads((prev) =>
                        prev.map((x) =>
                          x.profile.id === t.profile.id ? { ...x, unread: false } : x,
                        ),
                      );
                    }}
                    className="w-full py-3 flex items-center gap-3.5 text-left border-b border-black/[0.08] hover:bg-black/[0.03] transition cursor-pointer"
                  >
                    <img
                      src={t.profile.photos[0].url}
                      alt={t.profile.name}
                      className="w-12 h-12 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-semibold text-[14px]">{t.profile.name}</span>
                        <span className="font-mono-tech text-[10px] text-black/40 shrink-0">
                          {last?.timestamp || t.matchedAt}
                        </span>
                      </div>
                      <p className="text-[12.5px] text-black/45 truncate mt-0.5">
                        {last ? last.text : `Matched ${t.matchedAt}`}
                      </p>
                    </div>
                    {t.unread && (
                      <span className="w-2 h-2 rounded-full bg-[#FF4D6D] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* CHAT THREAD */}
        {activeTab === 'matches' && activeThread && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 py-2.5 border-b border-black/[0.08] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedChatId(null);
                    setShowDateSpots(false);
                  }}
                  aria-label="Back to matches"
                  className="w-8 h-8 rounded-full hover:bg-black/[0.07] flex items-center justify-center cursor-pointer shrink-0"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <img
                  src={activeThread.profile.photos[0].url}
                  alt={activeThread.profile.name}
                  className="w-9 h-9 rounded-full object-cover shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-[14px] truncate">
                      {activeThread.profile.name}
                    </span>
                    <BadgeCheck className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                  </div>
                  <span className="text-[10.5px] text-black/40">
                    {activeThread.profile.activeStatus}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDateSpots((p) => !p)}
                aria-label="Suggest a date spot"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer shrink-0 ${
                  showDateSpots ? 'bg-[#FF4D6D] text-white' : 'bg-black/[0.055] text-black/65'
                }`}
              >
                <CalendarHeart className="w-4 h-4" />
              </button>
            </div>

            {showDateSpots && (
              <div className="px-4 py-3 border-b border-black/[0.08] shrink-0">
                <p className="font-mono-tech text-[10px] uppercase tracking-[0.14em] text-black/40 mb-2">
                  Suggest a first date
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {DATE_SPOTS.map((d) => (
                    <button
                      key={d.spot}
                      type="button"
                      onClick={() => {
                        sendMessage(
                          activeThread.profile,
                          `${d.spot} — ${d.vibe}`,
                          d,
                        );
                        setShowDateSpots(false);
                      }}
                      className="p-2.5 rounded-xl bg-black/[0.04] hover:bg-black/[0.09] text-left transition cursor-pointer"
                    >
                      <span className="text-[11.5px] font-medium block truncate">{d.spot}</span>
                      <span className="font-mono-tech text-[9.5px] text-black/40 block">
                        {d.time}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5">
              {activeThread.messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'me' ? 'items-end' : 'items-start'}`}
                >
                  {m.dateInvite ? (
                    <div className="max-w-[82%] p-3.5 rounded-2xl bg-black/[0.055] border border-black/10">
                      <div className="flex items-center justify-between gap-3 mb-1.5">
                        <span className="font-mono-tech text-[9px] uppercase tracking-[0.16em] text-black/40">
                          Date invite
                        </span>
                        {m.dateInvite.accepted && (
                          <span className="font-mono-tech text-[9px] text-[#16A34A]">
                            ACCEPTED
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-[13.5px]">{m.dateInvite.spot}</p>
                      <p className="text-[12px] text-black/50 mt-0.5">
                        {m.dateInvite.time} · {m.dateInvite.vibe}
                      </p>
                    </div>
                  ) : (
                    <div
                      className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                        m.sender === 'me'
                          ? 'bg-[#FF4D6D] text-white rounded-br-sm'
                          : 'bg-black/[0.06] text-black/85 rounded-bl-sm'
                      }`}
                    >
                      {m.text}
                    </div>
                  )}
                  <span className="font-mono-tech text-[9px] text-black/30 mt-1 px-1">
                    {m.timestamp}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!chatInput.trim()) return;
                sendMessage(activeThread.profile, chatInput.trim());
                setChatInput('');
              }}
              className="px-4 py-3 border-t border-black/[0.08] flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Message"
                className="flex-1 px-4 py-2.5 rounded-full bg-black/[0.055] text-[13px] text-[#17161B] placeholder:text-black/40 focus:outline-none focus:bg-black/[0.10]"
              />
              <button
                type="submit"
                aria-label="Send"
                className="w-10 h-10 rounded-full bg-[#FF4D6D] text-white flex items-center justify-center shrink-0 cursor-pointer hover:brightness-110 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* PROFILE */}
        {activeTab === 'profile' && (
          <div className="flex-1 overflow-y-auto px-5 pb-5">
            <div className="flex flex-col items-center text-center pt-3 pb-6">
              <img
                src={MY_PORTRAIT}
                alt="Your profile"
                className="w-24 h-24 rounded-full object-cover mb-4"
              />
              <h2 className="text-[20px] font-bold">Soren, 28</h2>
              <p className="text-[12.5px] text-black/45 mt-0.5">
                Design Director · Södermalm
              </p>
            </div>

            <div className="grid grid-cols-3 border-y border-black/[0.08]">
              <div className="py-4 text-center border-r border-black/[0.08]">
                <span className="block text-[18px] font-bold">{history.length}</span>
                <span className="block font-mono-tech text-[9.5px] uppercase tracking-[0.12em] text-black/40 mt-0.5">
                  Swipes
                </span>
              </div>
              <div className="py-4 text-center border-r border-black/[0.08]">
                <span className="block text-[18px] font-bold">{threads.length}</span>
                <span className="block font-mono-tech text-[9.5px] uppercase tracking-[0.12em] text-black/40 mt-0.5">
                  Matches
                </span>
              </div>
              <div className="py-4 text-center">
                <span className="block text-[18px] font-bold">96%</span>
                <span className="block font-mono-tech text-[9.5px] uppercase tracking-[0.12em] text-black/40 mt-0.5">
                  Avg score
                </span>
              </div>
            </div>

            <PreferencesPanel
              prefs={prefs}
              onChange={setPrefs}
              matchCount={eligible.length}
              totalCount={DATING_PROFILES.length}
            />

            {history.length > 0 && (
              <div className="pt-5">
                <h3 className="font-mono-tech text-[10px] uppercase tracking-[0.16em] text-black/40 mb-2">
                  Recent activity
                </h3>
                {history.slice(0, 6).map((h, i) => (
                  <div
                    key={`${h.profile.id}-${i}`}
                    className="py-2.5 flex items-center justify-between border-b border-black/[0.08]"
                  >
                    <span className="text-[13px] text-black/75">{h.profile.name}</span>
                    <span
                      className={`font-mono-tech text-[10px] uppercase tracking-[0.1em] ${
                        h.direction === 'right'
                          ? 'text-[#16A34A]'
                          : h.direction === 'up'
                          ? 'text-[#0284C7]'
                          : 'text-black/40'
                      }`}
                    >
                      {h.direction === 'right'
                        ? 'Liked'
                        : h.direction === 'up'
                        ? 'Super Spark'
                        : 'Passed'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bottom nav */}
        <nav className="px-3 pt-2.5 pb-4 border-t border-black/[0.08] flex items-stretch shrink-0">
          {([
            { id: 'discover', icon: Flame, label: 'Discover' },
            { id: 'matches', icon: MessageCircle, label: 'Matches' },
            { id: 'profile', icon: User, label: 'You' },
          ] as const).map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 transition cursor-pointer ${
                  active ? 'text-[#FF4D6D]' : 'text-black/40 hover:text-black/55'
                }`}
              >
                {/* Wrapper keeps the unread dot attached to the icon, not the
                    full-width column. */}
                <span className="relative flex items-center justify-center">
                  <Icon className="w-[21px] h-[21px]" />
                  {tab.id === 'matches' && unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-1 w-[7px] h-[7px] rounded-full bg-[#FF4D6D]" />
                  )}
                </span>
                <span className="font-mono-tech text-[9px] uppercase tracking-[0.12em]">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Overlays, scoped inside the phone frame */}
        <ProfileDetailSheet
          profile={detailProfile}
          onClose={() => setDetailProfile(null)}
          onTriggerAction={triggerSwipe}
          onSendPromptReply={handlePromptReply}
        />
        <MatchCelebrationModal
          profile={celebration?.profile || null}
          matchType={celebration?.type || 'like'}
          onClose={() => setCelebration(null)}
          onSendMessage={sendMessage}
        />
      </main>
    </div>
  );
}
