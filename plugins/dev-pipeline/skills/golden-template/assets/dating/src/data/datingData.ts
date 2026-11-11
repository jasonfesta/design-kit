export interface PhotoSlide {
  id: string;
  url: string;
  caption: string;
  locationTag: string;
  palette: [string, string, string];
}

export interface ProfilePrompt {
  question: string;
  answer: string;
}

export interface VoicePrompt {
  question: string;
  transcript: string;
  durationSec: number;
  baseFreq: number;
}

export type Gender = 'woman' | 'man' | 'nonbinary';

/** Structured form of `intent`, used by the discovery filters. */
export type IntentType = 'longTerm' | 'openToBoth' | 'casual';

export interface DatingProfile {
  id: string;
  name: string;
  age: number;
  pronouns: string;
  gender: Gender;
  role: string;
  company: string;
  education: string;
  neighborhood: string;
  city: string;
  distanceKm: number;
  verified: boolean;
  activeStatus: string;
  compatibilityScore: number;
  intent: string;
  intentType: IntentType;
  smokes: boolean;
  drinks: boolean;
  bio: string;
  interests: { label: string; icon: string }[];
  basics: {
    height: string;
    zodiac: string;
    drinking: string;
    smoking: string;
    pets: string;
    loveLanguage: string;
    weekendStyle: string;
  };
  prompts: ProfilePrompt[];
  voicePrompt: VoicePrompt;
  anthem: {
    title: string;
    artist: string;
    accentColor: string;
    bpm: number;
  };
  compatibilityBreakdown: {
    intellectual: number;
    lifestyle: number;
    aesthetic: number;
    spontaneity: number;
  };
  isMutualMatch: boolean;
  icebreakers: string[];
  sampleReplies: string[];
  photos: PhotoSlide[];
}

export interface ChatMessage {
  id: string;
  sender: 'me' | 'them';
  text: string;
  timestamp: string;
  dateInvite?: {
    spot: string;
    time: string;
    vibe: string;
    accepted?: boolean;
  };
}

export interface MatchThread {
  profile: DatingProfile;
  matchedAt: string;
  matchType: 'like' | 'super';
  unread: boolean;
  messages: ChatMessage[];
}

/** Your own profile portrait (Pexels). */
export const MY_PORTRAIT =
  'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=900';

export const DATING_PROFILES: DatingProfile[] = [
  {
    id: 'astrid-lindqvist',
    name: 'Astrid',
    age: 27,
    pronouns: 'she/her',
    gender: 'woman',
    role: 'Spatial Sound Designer',
    company: 'Nordic Audio Lab',
    education: 'Konstfack Stockholm',
    neighborhood: 'Södermalm',
    city: 'Stockholm',
    distanceKm: 2,
    verified: true,
    activeStatus: 'Online now',
    compatibilityScore: 97,
    intent: 'Long-term, with a creative spark',
    intentType: 'longTerm',
    smokes: false,
    drinks: true,
    bio: 'Building tactile synthesizers by day, hunting obscure Japanese jazz vinyl by night. Swipe right if you appreciate brutalist architecture or spontaneous ferry rides.',
    interests: [
      { label: 'Analog Synths', icon: '🎛️' },
      { label: 'Vinyl Bars', icon: '💿' },
      { label: 'Sea Swims', icon: '🌊' },
      { label: '35mm Film', icon: '📷' },
      { label: 'Espresso', icon: '☕' },
    ],
    basics: {
      height: '173 cm',
      zodiac: 'Libra',
      drinking: 'Natural wine',
      smoking: 'Non-smoker',
      pets: 'Whippet named Miso',
      loveLanguage: 'Quality time',
      weekendStyle: 'Sauna, then late brunch',
    },
    prompts: [
      {
        question: 'My ideal first date',
        answer: 'Vinyl listening room, yuzu highballs, then rating every street dog on the walk home along the water.',
      },
      {
        question: 'A green flag I look for',
        answer: 'You get unreasonably excited about good typography and pack only a carry-on for ten days.',
      },
    ],
    voicePrompt: {
      question: 'Why I was banned from the road trip playlist',
      transcript: '“Transitioning from Swedish ambient synth into 2000s French house at 8 AM is an art form. Give me the aux for fifteen minutes.”',
      durationSec: 14,
      baseFreq: 329.63,
    },
    anthem: {
      title: 'Veridis Quo',
      artist: 'Daft Punk',
      accentColor: '#FF4D6D',
      bpm: 116,
    },
    compatibilityBreakdown: {
      intellectual: 98,
      lifestyle: 95,
      aesthetic: 99,
      spontaneity: 94,
    },
    isMutualMatch: true,
    icebreakers: [
      'Defend your top 8 AM road-trip track. I need proof.',
      'Vinyl bar and yuzu highballs Thursday? First round on me.',
      'Important: does Miso the whippet own a turtleneck?',
    ],
    sampleReplies: [
      'Miso owns three cashmere turtlenecks and walks like he pays the rent in Södermalm.',
      'Thursday sounds dangerously good. Are you ready for my French house agenda though?',
      'That is elite taste. Tell me your coffee order so I can judge our 97% properly.',
    ],
    photos: [
      {
        id: 'astrid-1',
        url: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=900',
        caption: 'Studio portrait after a long mixing session',
        locationTag: 'Södermalm',
        palette: ['#FFB020', '#FF4D6D', '#12121A'],
      },
      {
        id: 'astrid-2',
        url: 'https://images.pexels.com/photos/1123262/pexels-photo-1123262.jpeg?auto=compress&cs=tinysrgb&w=900',
        caption: 'My favourite listening bar, warm bulbs only',
        locationTag: 'Hornstull',
        palette: ['#F59E0B', '#B45309', '#0E0E14'],
      },
      {
        id: 'astrid-3',
        url: 'https://images.pexels.com/photos/1002638/pexels-photo-1002638.jpeg?auto=compress&cs=tinysrgb&w=900',
        caption: 'Still shooting everything on 35mm',
        locationTag: 'Film archive',
        palette: ['#F9A8D4', '#F472B6', '#1A1220'],
      },
      {
        id: 'astrid-4',
        url: 'https://images.pexels.com/photos/298018/pexels-photo-298018.jpeg?auto=compress&cs=tinysrgb&w=900',
        caption: 'Always catching the last train somewhere',
        locationTag: 'T-Centralen',
        palette: ['#EF4444', '#7F1D1D', '#0F0F16'],
      },
    ],
  },
  {
    id: 'mateo-valencia',
    name: 'Mateo',
    age: 29,
    pronouns: 'he/him',
    gender: 'man',
    role: 'Architect & Ceramist',
    company: 'Studio Valencia',
    education: 'ETH Zürich',
    neighborhood: 'Vasastan',
    city: 'Stockholm',
    distanceKm: 4,
    verified: true,
    activeStatus: 'Online now',
    compatibilityScore: 94,
    intent: 'Chemistry first, open to serious',
    intentType: 'openToBoth',
    smokes: false,
    drinks: true,
    bio: 'Designing timber pavilions during the week, throwing stoneware espresso cups on weekends. Will happily cook you cacio e pepe at 11 PM after a film.',
    interests: [
      { label: 'Ceramics', icon: '🏺' },
      { label: 'Fresh Pasta', icon: '🍝' },
      { label: 'Bouldering', icon: '🧗' },
      { label: 'Cinema', icon: '🎬' },
      { label: 'Cortados', icon: '☕' },
    ],
    basics: {
      height: '184 cm',
      zodiac: 'Scorpio',
      drinking: 'Mezcal, occasionally',
      smoking: 'Never',
      pets: 'Plant dad (32 thriving)',
      loveLanguage: 'Acts of service',
      weekendStyle: 'Kiln day, then late cinema',
    },
    prompts: [
      {
        question: 'The fastest way to my heart',
        answer: 'Having strong opinions on lighting temperature. 2700K warm bulbs only. Overhead big lights are illegal.',
      },
      {
        question: 'Together, we could',
        answer: 'Sketch our dream courtyard house on a napkin, then book flights to Lisbon to “research tiles”.',
      },
    ],
    voicePrompt: {
      question: 'My non-negotiable rule about lighting',
      transcript: '“If you walk into a room and flip on the ceiling fluorescent instead of four warm lamps, we need an architectural intervention.”',
      durationSec: 12,
      baseFreq: 261.63,
    },
    anthem: {
      title: 'Nude',
      artist: 'Radiohead',
      accentColor: '#F59E0B',
      bpm: 63,
    },
    compatibilityBreakdown: {
      intellectual: 95,
      lifestyle: 93,
      aesthetic: 97,
      spontaneity: 91,
    },
    isMutualMatch: true,
    icebreakers: [
      '2700K supremacy. Does that earn me a ceramic espresso cup?',
      'Lisbon tile research or late-night cacio e pepe — which first?',
      'Last film that earned a five out of five from you?',
    ],
    sampleReplies: [
      'A fellow enemy of the big overhead light. Your cup is reserved in tomorrow’s kiln batch.',
      'Let’s do cacio e pepe while booking the Lisbon flights. Efficiency is a virtue.',
      'We test your pepper-grinding stamina first. Thursday evening?',
    ],
    photos: [
      {
        id: 'mateo-1',
        url: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=900',
        caption: 'Outside the studio, concrete season',
        locationTag: 'Vasastan',
        palette: ['#94A3B8', '#475569', '#0F1117'],
      },
      {
        id: 'mateo-2',
        url: 'https://images.pexels.com/photos/4706134/pexels-photo-4706134.jpeg?auto=compress&cs=tinysrgb&w=900',
        caption: 'Sunday at the wheel, hands full of clay',
        locationTag: 'Ceramics co-op',
        palette: ['#D97706', '#92400E', '#14100C'],
      },
      {
        id: 'mateo-3',
        url: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=900',
        caption: 'The 11 PM pasta in question',
        locationTag: 'My kitchen',
        palette: ['#22C55E', '#15803D', '#0D120F'],
      },
      {
        id: 'mateo-4',
        url: 'https://images.pexels.com/photos/2079438/pexels-photo-2079438.jpeg?auto=compress&cs=tinysrgb&w=900',
        caption: 'Where I sketch every morning',
        locationTag: 'Atlasmuren café',
        palette: ['#B45309', '#78350F', '#120E0A'],
      },
    ],
  },
  {
    id: 'sora-takahashi',
    name: 'Sora',
    age: 26,
    pronouns: 'she/her',
    gender: 'woman',
    role: 'Robotics Technologist',
    company: 'KTH Autonomous Lab',
    education: 'Tokyo & KTH',
    neighborhood: 'Östermalm',
    city: 'Stockholm',
    distanceKm: 3,
    verified: true,
    activeStatus: 'Active 12m ago',
    compatibilityScore: 95,
    intent: 'Long-term partner & adventure buddy',
    intentType: 'longTerm',
    smokes: false,
    drinks: false,
    bio: 'Teaching kinetic sculptures how to dance by day, perfecting my matcha ratio by twilight. Looking for someone down for a bookshop crawl or a 6 AM train to the mountains.',
    interests: [
      { label: 'Robotics', icon: '🤖' },
      { label: 'Matcha', icon: '🍵' },
      { label: 'Trail Running', icon: '👟' },
      { label: 'Art Books', icon: '📚' },
      { label: 'Ramen', icon: '🍜' },
    ],
    basics: {
      height: '168 cm',
      zodiac: 'Aquarius',
      drinking: 'Sober, pour-over instead',
      smoking: 'Never',
      pets: 'Shiba Inu fan',
      loveLanguage: 'Thoughtful surprises',
      weekendStyle: '10k forest run, then a bookshop',
    },
    prompts: [
      {
        question: 'My most controversial food opinion',
        answer: 'A 36-hour homemade broth beats any tasting menu with tweezers and foam. I will make you a bowl.',
      },
      {
        question: 'Two truths and a lie',
        answer: 'I built a robot that pours latte art, I hiked Fuji overnight in the rain, and I can parallel park first try.',
      },
    ],
    voicePrompt: {
      question: 'The story behind my latte-pouring robot arm',
      transcript: '“It only spilled oat milk across the entire lab twice before nailing a rosetta. Better success rate than most first dates.”',
      durationSec: 15,
      baseFreq: 392.0,
    },
    anthem: {
      title: 'Plastic Love',
      artist: 'Mariya Takeuchi',
      accentColor: '#38BDF8',
      bpm: 102,
    },
    compatibilityBreakdown: {
      intellectual: 99,
      lifestyle: 94,
      aesthetic: 95,
      spontaneity: 93,
    },
    isMutualMatch: true,
    icebreakers: [
      'The parallel parking is the lie. The robot is too specific to be fake.',
      'Formally applying for a seat at the 36-hour broth table.',
      'Art bookshop and matcha on Saturday afternoon?',
    ],
    sampleReplies: [
      'Direct hit. Parallel parking remains my nemesis; the robot arm has six degrees of freedom and zero anxiety.',
      'Saturday is my literal dream afternoon. Consider it a date.',
      'Bring an appetite. The chashu has been marinating all week.',
    ],
    photos: [
      {
        id: 'sora-1',
        url: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=900',
        caption: 'Between demos at the lab',
        locationTag: 'KTH Campus',
        palette: ['#38BDF8', '#0EA5E9', '#0B1220'],
      },
      {
        id: 'sora-2',
        url: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=900',
        caption: 'Calibrating the pour before standup',
        locationTag: 'Café Pascal',
        palette: ['#D97706', '#7C2D12', '#120F0C'],
      },
      {
        id: 'sora-3',
        url: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=900',
        caption: 'Reading long past a reasonable hour',
        locationTag: 'Konst-ig Books',
        palette: ['#FBBF24', '#78350F', '#0A0A0D'],
      },
      {
        id: 'sora-4',
        url: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=900',
        caption: 'Home for the holidays, ramen pilgrimage',
        locationTag: 'Tokyo',
        palette: ['#EC4899', '#8B5CF6', '#0D0A14'],
      },
    ],
  },
  {
    id: 'celeste-moreau',
    name: 'Céleste',
    age: 28,
    pronouns: 'she/her',
    gender: 'woman',
    role: 'Perfumer',
    company: 'Maison Brume',
    education: 'ISIPCA Paris',
    neighborhood: 'Gamla Stan',
    city: 'Stockholm',
    distanceKm: 1,
    verified: true,
    activeStatus: 'Online now',
    compatibilityScore: 96,
    intent: 'Something easy, see where it goes',
    intentType: 'casual',
    smokes: true,
    drinks: true,
    bio: 'Formulating fragrances from cedarwood, smoked cardamom and Baltic amber. I can guess your personality in ten seconds from the scent you wear — or blend you a new one over wine.',
    interests: [
      { label: 'Olfactory Art', icon: '🌿' },
      { label: 'Jazz Bars', icon: '🎷' },
      { label: 'Flea Markets', icon: '🕯️' },
      { label: 'New Wave Film', icon: '🎞️' },
      { label: 'Natural Wine', icon: '🍷' },
    ],
    basics: {
      height: '171 cm',
      zodiac: 'Taurus',
      drinking: 'Jura Chardonnay',
      smoking: 'The occasional one',
      pets: 'Russian Blue named Figaro',
      loveLanguage: 'Words of affirmation',
      weekendStyle: 'Flea market, candlelit dinner',
    },
    prompts: [
      {
        question: 'The most spontaneous thing I have done',
        answer: 'Booked a one-way night train from Paris to Venice to smell jasmine along the canals after a thunderstorm.',
      },
      {
        question: 'Ask me about',
        answer: 'Why rain on hot asphalt and freshly sharpened cedar pencils are the two greatest aromas on earth.',
      },
    ],
    voicePrompt: {
      question: 'Give me three notes, I diagnose your aura',
      transcript: '“Bergamot, vetiver and black fig means you pretend to be mysterious at parties but secretly bake for your neighbours.”',
      durationSec: 13,
      baseFreq: 440.0,
    },
    anthem: {
      title: 'La Femme d’Argent',
      artist: 'Air',
      accentColor: '#A855F7',
      bpm: 94,
    },
    compatibilityBreakdown: {
      intellectual: 96,
      lifestyle: 96,
      aesthetic: 99,
      spontaneity: 95,
    },
    isMutualMatch: true,
    icebreakers: [
      'How did you know about the vetiver and the secret baking?',
      'I challenge you to guess my scent over a glass of Jura.',
      'Best jazz bar in Gamla Stan — go.',
    ],
    sampleReplies: [
      'A perfumer never misses. Bergamot and vetiver people are my favourite demographic.',
      'Challenge accepted. If I guess within two tries you owe me the next bottle.',
      'There is a late brass quartet tonight. Say the word and I save the corner booth.',
    ],
    photos: [
      {
        id: 'celeste-1',
        url: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=900',
        caption: 'Golden hour on the old town bridge',
        locationTag: 'Gamla Stan',
        palette: ['#F59E0B', '#B45309', '#12100C'],
      },
      {
        id: 'celeste-2',
        url: 'https://images.pexels.com/photos/374757/pexels-photo-374757.jpeg?auto=compress&cs=tinysrgb&w=900',
        caption: 'Botanicals and coffee, the whole morning ritual',
        locationTag: 'The atelier',
        palette: ['#10B981', '#065F46', '#0A1210'],
      },
      {
        id: 'celeste-3',
        url: 'https://images.pexels.com/photos/1751731/pexels-photo-1751731.jpeg?auto=compress&cs=tinysrgb&w=900',
        caption: 'Wednesday nights belong to live sets',
        locationTag: 'Stora Nygatan',
        palette: ['#B45309', '#7C2D12', '#120D09'],
      },
      {
        id: 'celeste-4',
        url: 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=900',
        caption: 'Rooftop apéritif before a long dinner',
        locationTag: 'Södermalm rooftops',
        palette: ['#3B82F6', '#1D4ED8', '#0A0F1C'],
      },
    ],
  },
  {
    id: 'lukas-lindholm',
    name: 'Lukas',
    age: 30,
    pronouns: 'he/him',
    gender: 'man',
    role: 'Oceanographer & Cinematographer',
    company: 'Nordic Expedition Film',
    education: 'Stockholm University',
    neighborhood: 'Kungsholmen',
    city: 'Stockholm',
    distanceKm: 5,
    verified: true,
    activeStatus: 'Active 25m ago',
    compatibilityScore: 92,
    intent: 'A co-pilot for expeditions and life',
    intentType: 'longTerm',
    smokes: false,
    drinks: true,
    bio: 'Filming arctic kelp forests half the year, roasting single-origin beans the other half. Looking for someone who laughs when the travel plans go sideways.',
    interests: [
      { label: 'Freediving', icon: '🤿' },
      { label: 'Documentary', icon: '🎥' },
      { label: 'Kayak Camping', icon: '🛶' },
      { label: 'Roasting', icon: '🔥' },
      { label: 'Cold Plunge', icon: '🧖' },
    ],
    basics: {
      height: '186 cm',
      zodiac: 'Sagittarius',
      drinking: 'Smoky whisky',
      smoking: 'Quit in 2021',
      pets: 'Golden retriever named Fjord',
      loveLanguage: 'Shared adventures',
      weekendStyle: 'Sea kayak, wood-fired sauna',
    },
    prompts: [
      {
        question: 'My best travel story in one sentence',
        answer: 'A pod of curious belugas photobombed our camera rig in Tromsø while we ate cinnamon buns on the boat.',
      },
      {
        question: 'You should swipe right if',
        answer: 'You want a personal cinematographer who always catches your candid angle in golden hour.',
      },
    ],
    voicePrompt: {
      question: 'What bioluminescence looks like at 2 AM',
      transcript: '“Every paddle stroke lights up electric blue beneath the water. It genuinely feels like paddling through the Milky Way.”',
      durationSec: 13,
      baseFreq: 293.66,
    },
    anthem: {
      title: 'Holocene',
      artist: 'Bon Iver',
      accentColor: '#10B981',
      bpm: 147,
    },
    compatibilityBreakdown: {
      intellectual: 92,
      lifestyle: 95,
      aesthetic: 91,
      spontaneity: 98,
    },
    isMutualMatch: true,
    icebreakers: [
      'Belugas and cinnamon buns might be peak human experience.',
      'Night kayaking sounds unreal. When is the next paddle?',
      'Does Fjord approve of prospective dates on his walks?',
    ],
    sampleReplies: [
      'Fjord approves anyone who throws a tennis ball at least twice.',
      'I have a spare drysuit and two thermoses of pour-over ready for this weekend.',
      'Wait until you see the raw footage from Tromsø. Drinks tomorrow?',
    ],
    photos: [
      {
        id: 'lukas-1',
        url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=900',
        caption: 'Back in town after three weeks at sea',
        locationTag: 'Kungsholmen',
        palette: ['#22C55E', '#15803D', '#0B120D'],
      },
      {
        id: 'lukas-2',
        url: 'https://images.pexels.com/photos/1252869/pexels-photo-1252869.jpeg?auto=compress&cs=tinysrgb&w=900',
        caption: 'The 2 AM paddle I keep talking about',
        locationTag: 'Archipelago',
        palette: ['#1E3A8A', '#0C4A6E', '#05080F'],
      },
      {
        id: 'lukas-3',
        url: 'https://images.pexels.com/photos/1666021/pexels-photo-1666021.jpeg?auto=compress&cs=tinysrgb&w=900',
        caption: 'Scouting locations for the next film',
        locationTag: 'Northern fjords',
        palette: ['#10B981', '#047857', '#081210'],
      },
      {
        id: 'lukas-4',
        url: 'https://images.pexels.com/photos/2325446/pexels-photo-2325446.jpeg?auto=compress&cs=tinysrgb&w=900',
        caption: 'Shoot day that started at four in the morning',
        locationTag: 'On assignment',
        palette: ['#F59E0B', '#DB2777', '#100C14'],
      },
    ],
  },
];

export const INITIAL_MATCH_THREADS: MatchThread[] = [
  {
    profile: DATING_PROFILES[3],
    matchedAt: '2h ago',
    matchType: 'super',
    unread: true,
    messages: [
      {
        id: 'm-celeste-1',
        sender: 'them',
        text: 'Your Super Spark caught my attention. Tell me — smoky cedarwood or crisp bergamot for an evening out?',
        timestamp: '21:14',
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Discovery preferences                                               */
/* ------------------------------------------------------------------ */

/** `null` means "no preference" — the filter is simply not applied. */
export type LifestyleFilter = 'yes' | 'no' | null;

export interface DiscoveryPreferences {
  showMe: 'women' | 'men' | 'everyone';
  ageMin: number;
  ageMax: number;
  maxDistanceKm: number;
  intents: IntentType[];
  smoker: LifestyleFilter;
  drinker: LifestyleFilter;
}

export const MY_LOCATION = 'Stockholm, Södermalm';

export const AGE_FLOOR = 18;
export const AGE_CEILING = 55;
export const DISTANCE_CEILING = 30;

/** Deliberately wide, so a new user sees everyone before narrowing down. */
export const DEFAULT_PREFERENCES: DiscoveryPreferences = {
  showMe: 'everyone',
  ageMin: 24,
  ageMax: 38,
  maxDistanceKm: DISTANCE_CEILING,
  intents: ['longTerm', 'openToBoth', 'casual'],
  smoker: null,
  drinker: null,
};

export const SHOW_ME_OPTIONS: {
  value: DiscoveryPreferences['showMe'];
  label: string;
}[] = [
  { value: 'women', label: 'Women' },
  { value: 'men', label: 'Men' },
  { value: 'everyone', label: 'Everyone' },
];

export const INTENT_OPTIONS: { value: IntentType; label: string }[] = [
  { value: 'longTerm', label: 'Long-term' },
  { value: 'openToBoth', label: 'Open to both' },
  { value: 'casual', label: 'Something casual' },
];

export function matchesPreferences(
  profile: DatingProfile,
  prefs: DiscoveryPreferences,
): boolean {
  if (prefs.showMe === 'women' && profile.gender !== 'woman') return false;
  if (prefs.showMe === 'men' && profile.gender !== 'man') return false;
  if (profile.age < prefs.ageMin || profile.age > prefs.ageMax) return false;
  if (profile.distanceKm > prefs.maxDistanceKm) return false;
  if (!prefs.intents.includes(profile.intentType)) return false;
  if (prefs.smoker !== null && profile.smokes !== (prefs.smoker === 'yes')) {
    return false;
  }
  if (prefs.drinker !== null && profile.drinks !== (prefs.drinker === 'yes')) {
    return false;
  }
  return true;
}
