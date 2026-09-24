// Event content for BRICS Traditional & Indigenous Sports 2026, Ahmedabad.
// The rest of the app reads only from this file, so edit it to change countries, sports or the programme.
// Sport descriptions are short summaries for visitors; have them checked by each delegation before launch.

export type SportType = 'Wrestling' | 'Combat' | 'Team' | 'Target' | 'Strength' | 'Skill' | 'Equestrian';
export type VenueId = 'main' | 'fop1' | 'fop2' | 'fop3' | 'tsz' | 'cz';
export interface Country {
  id: string; name: string; code: string; iso2: string; color: string; story: string;
  /** Flag carries sacred inscriptions: show it only as a badge, never as background art. */
  inscribed?: boolean;
  /** Uploaded flag image; falls back to /flags/<iso2>.svg. */
  flag?: string | null;
  /** Uploaded photo for the country's cards and page header. */
  image?: string | null;
}
export interface Sport {
  id: string; c: string; name: string; type: SportType; photo: string | null; video?: string; about: string;
  /** Who took the photo / where it comes from, shown under it (free licences require credit). */
  photoCredit?: string;
  photoSource?: string;
}
export interface Venue { id: VenueId; name: string; short: string; kind: string; desc: string; cap: string }
export interface Facility { id: string; name: string; note: string; where: string; hours: string }
/** One item of the show flow. `country` is set for a country's demonstration slot, null for ceremony items. */
export interface Session { id: string; day: number; start: number; end: number; venue: VenueId; sport: string | null; country: string | null; kind: string; title: string; brief: string; /** Country 1–7 of the show flow, for demonstration slots. */ slot?: number }
export type UpdateType = 'Schedule change' | 'Notice' | 'Highlight' | 'Facility';

export const EVENT_DAYS = 1;
export const DAY_START = 9 * 60;
export const DAY_END = 15 * 60 + 30;

export const flagUrl = (c: Country) =>
  c.flag || (c.iso2 ? `/flags/${c.iso2}.svg` : `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3"><rect width="4" height="3" fill="${c.color}"/></svg>`)}`);

export const SPORT_TYPES: SportType[] = ['Wrestling', 'Combat', 'Team', 'Target', 'Strength', 'Skill', 'Equestrian'];

// Photos: freely licensed images on Wikimedia Commons, loaded by visitors' browsers.
// Special:FilePath redirects to the file at a sensible width, whatever its original size.
const COMMONS = (file: string) => ({
  photo: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=960`,
  photoCredit: 'Wikimedia Commons',
  photoSource: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file)}`,
});
const THUMB = (path: string, w = 960) => {
  const file = path.split('/').pop()!;
  return { photo: `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}/${w}px-${file}`, photoCredit: 'Wikimedia Commons', photoSource: `https://commons.wikimedia.org/wiki/File:${file}` };
};
const PHOTOS: Record<string, ReturnType<typeof COMMONS>> = {
  kabaddi: THUMB('1/1f/Iran_men%27s_national_kabaddi_team_13970602000432636707284535394012_98208.jpg'),
  khokho: THUMB('2/2c/Kho_Kho_game_at_a_Government_school_in_Haryana%2C_India.jpg'),
  mallakhamb: THUMB('3/39/Malakhambha_pradarshana_Nudisir_2015_02.JPG'),
  capoeira: THUMB('1/19/Rugendasroda.jpg'),
  peteca: { photo: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Modernpeteca.jpg', photoCredit: 'Wikimedia Commons', photoSource: 'https://commons.wikimedia.org/wiki/File:Modernpeteca.jpg' },
  huka: THUMB('6/66/Huka_huka_fight_Kuarup_ceremony.jpg', 500),
  silat: THUMB('e/e2/DSC_3099_wikimedia2020_deni_dahniel_atraksi_silek_minagkabau.jpg'),
  lapta: COMMONS('Игра_в_лапту_в_России.jpg'),
  gorodki: COMMONS('Gorodki-kolodetz.jpg'),
  wushu: COMMONS('Wushu_(sport).jpg'),
  jianzi: COMMONS('Jianzi.jpg'),
  dragonboat: COMMONS('Dragon_boat_racing.jpg'),
  tahtib: COMMONS('Saho_Ra_Tahtib_-_Abou_Sir.jpg'),
  zurkhaneh: COMMONS('Saheb_A_Zaman_Club_Zurkhaneh,_Yazd,_Iran_(5072483704).jpg'),
  chogan: COMMONS('Polo_game_from_poem_Guy_u_Chawgan.jpg'),
  falconry: COMMONS('The_Falcon_-_The_National_Bird_of_the_UAE_(2).jpg'),
  dhow: COMMONS('Dhow_Wharfage,_Dubai,_UAE_(4325118069).jpg'),
  saluki: COMMONS('Saluki_dog_breed.jpg'),
  egrang: COMMONS('Festival_Egrang_Ledokombo_Jember_-_1.jpg'),
  gasing: COMMONS('Bermain_Gasing.jpg'),
  camel: COMMONS('Dubai_camel_race.jpg'),
  arabhorse: COMMONS('Halterstandingshotarabianone.jpg'),
};

export const COUNTRIES: Country[] = [
  { id: 'bra', name: 'Brazil', code: 'BRA', iso2: 'br', color: '#00923F', story: 'Capoeira circles, the feathered hand-shuttle of peteca and huka-huka wrestling from the Xingu peoples.' },
  { id: 'rus', name: 'Russia', code: 'RUS', iso2: 'ru', color: '#1D4E9E', story: 'Village bat-and-ball and skittle games, and stick-pulling strength contests from the Sakha Republic.' },
  { id: 'ind', name: 'India', code: 'IND', iso2: 'in', color: '#F28C28', story: 'Host nation. Games of breath, pursuit and pole gymnastics, played on packed earth for centuries.' },
  { id: 'chn', name: 'China', code: 'CHN', iso2: 'cn', color: '#D7261E', story: 'Martial-arts forms, shuttlecock kicking in the park and the drumbeat of dragon-boat crews.' },
  { id: 'zaf', name: 'South Africa', code: 'ZAF', iso2: 'za', color: '#D99A00', story: 'Stick fighting of the herding tradition, rhythmic rope games and the pin-throwing game of jukskei.' },
  { id: 'egy', name: 'Egypt', code: 'EGY', iso2: 'eg', color: '#8C1D40', story: 'Tahtib stick fighting, dancing horses of Upper Egypt and strategy games drawn in the sand.' },
  { id: 'eth', name: 'Ethiopia', code: 'ETH', iso2: 'et', color: '#3F7E1E', story: 'Genna hockey at Christmas, mounted gugs contests and Suri stick fighting from the south-west.' },
  { id: 'irn', name: 'Iran', code: 'IRN', iso2: 'ir', color: '#0F8B8D', inscribed: true, story: 'The zurkhaneh "house of strength", chogan on horseback and traditional jacket wrestling from Khorasan.' },
  { id: 'are', name: 'United Arab Emirates', code: 'UAE', iso2: 'ae', color: '#6B3FA0', story: 'Falconry, heritage dhow races and saluki racing across the desert.' },
  { id: 'idn', name: 'Indonesia', code: 'IDN', iso2: 'id', color: '#B5452C', story: 'Silat schools from across the archipelago, alongside stilt races and spinning-top duels.' },
  { id: 'sau', name: 'Saudi Arabia', code: 'SAU', iso2: 'sa', color: '#006C35', inscribed: true, story: 'Camel racing, Arabian horsemanship and the stick game of almezmar from the Hejaz.' },
];

const SPORTS_RAW: Sport[] = [
  { id: 'capoeira', c: 'bra', name: 'Capoeira', type: 'Combat', photo: null, about: 'Played in a roda to the berimbau: kicks, escapes and acrobatics in a continuous conversation between two players.' },
  { id: 'peteca', c: 'bra', name: 'Peteca', type: 'Skill', photo: null, about: 'A feathered hand-shuttle struck over a net with the palm, with roots in Tupi games.' },
  { id: 'huka', c: 'bra', name: 'Huka-Huka', type: 'Wrestling', photo: null, about: 'Xingu wrestling that opens from kneeling, part of the Kuarup ceremony honouring ancestors.' },

  { id: 'lapta', c: 'rus', name: 'Lapta', type: 'Team', photo: null, about: 'A bat-and-ball game with medieval roots: the batter strikes the ball, then runs to the far line and back without being hit by it.' },
  { id: 'gorodki', c: 'rus', name: 'Gorodki', type: 'Target', photo: null, about: 'Players throw a heavy wooden bat to knock figures built from wooden pins out of a square "town".' },
  { id: 'mas', c: 'rus', name: 'Mas-Wrestling', type: 'Strength', photo: null, about: 'From the Sakha Republic: two athletes sit facing each other, feet braced on a board, and try to pull a stick from the other\'s grip.' },

  { id: 'kabaddi', c: 'ind', name: 'Kabaddi', type: 'Team', photo: null, about: 'A raider crosses into the opposing half on a single breath, tags defenders and races back before being tackled.' },
  { id: 'khokho', c: 'ind', name: 'Kho Kho', type: 'Team', photo: null, about: 'A chase game: seated defenders rise when tapped, and the chasers change direction only at the poles.' },
  { id: 'mallakhamb', c: 'ind', name: 'Mallakhamb', type: 'Skill', photo: null, about: 'Gymnasts perform holds, climbs and inversions on a vertical wooden pole or a hanging rope.' },

  { id: 'wushu', c: 'chn', name: 'Wushu', type: 'Combat', photo: null, about: 'Chinese martial arts performed as routines of hand and weapon forms, combining power, balance and flowing technique.' },
  { id: 'jianzi', c: 'chn', name: 'Jianzi', type: 'Skill', photo: null, about: 'Keep a weighted, feathered shuttlecock in the air using the feet and body, but never the hands.' },
  { id: 'dragonboat', c: 'chn', name: 'Dragon Boat', type: 'Team', photo: null, about: 'Dragon-headed boats powered by crews of paddlers to the beat of a drum, linked to the Duanwu Festival.' },

  { id: 'intonga', c: 'zaf', name: 'Intonga', type: 'Combat', photo: null, about: 'Nguni stick fighting from the herding tradition: one stick to strike and one to defend, with respect and rules at its heart.' },
  { id: 'kgati', c: 'zaf', name: 'Kgati', type: 'Skill', photo: null, about: 'Two people turn a long rope while a jumper performs rhythmic moves, often to songs and chants.' },
  { id: 'jukskei', c: 'zaf', name: 'Jukskei', type: 'Target', photo: null, about: 'Players throw wooden pins at a peg set in sand, a game that grew from the yoke pins of ox wagons.' },

  { id: 'tahtib', c: 'egy', name: 'Tahtib', type: 'Combat', photo: null, about: 'Stick fighting turned martial art and performance, played to the music of the mizmar and drum. On UNESCO\'s intangible heritage list.' },
  { id: 'horsedance', c: 'egy', name: 'Horse Dancing', type: 'Equestrian', photo: null, about: 'Horses trained to step and dance in time with traditional music, a treasured part of festivals in Upper Egypt.' },
  { id: 'seega', c: 'egy', name: 'Seega', type: 'Skill', photo: null, about: 'A strategy game played on a grid drawn in the sand: capture the other player\'s pieces by trapping them between your own.' },

  { id: 'genna', c: 'eth', name: 'Genna', type: 'Team', photo: null, about: 'Ethiopian hockey, played with curved sticks and a wooden ball, traditionally around the Christmas (Genna) season.' },
  { id: 'gugs', c: 'eth', name: 'Gugs', type: 'Equestrian', photo: null, about: 'A mounted game in which riders chase each other and throw blunt wooden lances, parrying with shields.' },
  { id: 'donga', c: 'eth', name: 'Donga', type: 'Combat', photo: null, about: 'Stick fighting of the Suri people of south-western Ethiopia, a ritual contest of strength and courage.' },

  { id: 'zurkhaneh', c: 'irn', name: 'Zurkhaneh', type: 'Strength', photo: null, about: 'Training in the "house of strength" with wooden clubs, shields and whirling, led by a drummer and singer. On UNESCO\'s intangible heritage list.' },
  { id: 'chogan', c: 'irn', name: 'Chogan', type: 'Equestrian', photo: null, about: 'Iran\'s horseback game of stick and ball, the ancestor of polo, accompanied by music and storytelling. On UNESCO\'s intangible heritage list.' },
  { id: 'chokheh', c: 'irn', name: 'Koshti Chokheh', type: 'Wrestling', photo: null, about: 'Traditional wrestling from Khorasan, in which wrestlers grip a short jacket to throw their opponent.' },

  { id: 'falconry', c: 'are', name: 'Falconry', type: 'Skill', photo: null, about: 'Training and flying falcons, a heritage shared across the Arab world and recognised by UNESCO.' },
  { id: 'dhow', c: 'are', name: 'Dhow Racing', type: 'Team', photo: null, about: 'Races of traditional wooden dhows, under sail and oar, recalling the pearl-diving era of the Gulf.' },
  { id: 'saluki', c: 'are', name: 'Saluki Racing', type: 'Skill', photo: null, about: 'Races of the Arabian saluki, an ancient sight-hound, over desert tracks at heritage festivals.' },

  { id: 'silat', c: 'idn', name: 'Pencak Silat', type: 'Combat', photo: null, about: 'A family of martial arts from the archipelago, shown as solo forms, duets and sparring. On UNESCO\'s intangible heritage list.' },
  { id: 'egrang', c: 'idn', name: 'Egrang', type: 'Skill', photo: null, about: 'Bamboo stilt racing and balance duels, a staple of Independence Day village games.' },
  { id: 'gasing', c: 'idn', name: 'Gasing', type: 'Skill', photo: null, about: 'Top spinning: hardwood tops are thrown to spin the longest or to knock rivals out of the circle.' },

  { id: 'camel', c: 'sau', name: 'Camel Racing', type: 'Equestrian', photo: null, about: 'Camel racing over long desert tracks, celebrated at the King Abdulaziz Camel Festival.' },
  { id: 'arabhorse', c: 'sau', name: 'Arabian Horsemanship', type: 'Equestrian', photo: null, about: 'Riding and racing the Arabian horse, bred on the peninsula for centuries.' },
  { id: 'mizmar', c: 'sau', name: 'Almezmar', type: 'Skill', photo: null, about: 'A stick game and dance of the Hejaz, performed to drums and chanting. On UNESCO\'s intangible heritage list.' },
];

export const SPORTS: Sport[] = SPORTS_RAW.map((s) => ({ ...s, ...(PHOTOS[s.id] ?? {}) }));

// Veer Savarkar Sports Complex. The programme runs in the Main Arena; the other areas are an
// indicative layout for visitor guidance until the venue plan is confirmed.
export const VENUES: Venue[] = [
  { id: 'main', name: 'Main Arena', short: 'Arena', kind: 'Ceremony & demonstrations', desc: 'Opening ceremony, addresses, country demonstration games and closing presentations.', cap: 'Veer Savarkar Sports Complex' },
  { id: 'fop1', name: 'Warm-up Area', short: 'Warm-up', kind: 'Delegations', desc: 'Where delegations prepare before their demonstration slot.', cap: 'Delegations only' },
  { id: 'fop2', name: 'Delegates\' Lounge', short: 'Lounge', kind: 'Delegations', desc: 'Rest and meeting space for delegations and practitioners.', cap: 'Accredited guests' },
  { id: 'fop3', name: 'Media Centre', short: 'Media', kind: 'Media', desc: 'Workspace for accredited media.', cap: 'Accredited media' },
  { id: 'tsz', name: 'VIP Area', short: 'VIP', kind: 'Hospitality', desc: 'Seating and reception for dignitaries and invited guests.', cap: 'Invitation only' },
  { id: 'cz', name: 'Spectator Plaza', short: 'Plaza', kind: 'Public', desc: 'Entry, meeting point and visitor services.', cap: 'Open to all' },
];

export const FACILITIES: Facility[] = [
  { id: 'registration', name: 'Registration', note: 'Accreditation and delegation check-in', where: 'Main entrance', hours: 'From 8:00 AM' },
  { id: 'info', name: 'Information', note: 'Programme questions, accessibility help and lost property', where: 'Spectator Plaza', hours: 'During event hours' },
  { id: 'food', name: 'Food', note: 'Refreshments; lunch break 1:45–2:30 PM', where: 'Beside Spectator Plaza', hours: 'During event hours' },
  { id: 'medical', name: 'Medical', note: 'First aid point', where: 'Next to the Main Arena', hours: 'During event hours' },
  { id: 'transport', name: 'Transport', note: 'Drop-off and pick-up point', where: 'Main entrance', hours: 'During event hours' },
  { id: 'toilets', name: 'Toilets', note: 'Accessible toilets available', where: 'Across the complex', hours: 'During event hours' },
  { id: 'water', name: 'Water points', note: 'Drinking water', where: 'Across the complex', hours: 'During event hours' },
  { id: 'prayer', name: 'Prayer room', note: 'Quiet room, multi-faith', where: 'To be confirmed', hours: 'During event hours' },
];

const pad = (n: number) => String(n).padStart(2, '0');
export const hhmm = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
/** 9:00 AM style, as in the printed show flow. */
export const ampm = (m: number) => { const h = Math.floor(m / 60) % 24; return `${h % 12 || 12}:${pad(Math.round(m % 60))} ${h < 12 ? 'AM' : 'PM'}`; };

/** The seven countries presenting demonstration games, in running order (Country 1–7 of the show flow). */
export const DEMO_ORDER = ['bra', 'rus', 'chn', 'zaf', 'egy', 'idn', 'ind'];

const TBC = 'Speaker to be confirmed.';
const T = (h: number, m: number) => h * 60 + m;
// Show flow | 12 October 2026 | Ahmedabad, Gujarat | 9:00 AM onwards
const FLOW: [number, number, string, string, string][] = [
  [T(9, 0), T(9, 20), 'Ceremony', 'Felicitation of Dignitaries & BRICS Delegates', 'Reception and welcome of dignitaries, BRICS delegates, officials and participating teams at the venue. Traditional welcome by host representatives. Delegates escorted to designated seating/VIP area. Soft instrumental music reflecting the cultural diversity of BRICS nations.'],
  [T(9, 20), T(9, 25), 'Ceremony', 'Diya lighting', 'House lights transition; ceremonial music begins. The emcee welcomes the gathering, announces the commencement of the Opening Ceremony and calls the dignitaries for diya lighting.'],
  [T(9, 25), T(9, 30), 'Address', 'Opening / Welcome Address', 'Welcome address by the designated host/representative, highlighting the importance of traditional and indigenous sports in strengthening people-to-people relations and cultural cooperation.'],
  [T(9, 30), T(9, 35), 'AV presentation', 'AV Presentation', 'Audio-visual journey showcasing traditional and indigenous sports across BRICS countries, highlighting heritage, communities, generations and cultural diversity.'],
  [T(9, 35), T(9, 40), 'Address', 'Speech', TBC],
  [T(9, 40), T(9, 45), 'Cultural', 'Artistic presentation for BRICS Unity & Cultural Heritage', 'A short artistic presentation symbolising the coming together of diverse traditions under the BRICS platform.'],
  [T(9, 45), T(9, 55), 'Address', 'Address by BRICS member countries', 'Address by the designated BRICS countries\' dignitaries/officials.'],
  [T(9, 55), T(10, 0), 'Address', 'Speech', TBC],
  [T(10, 0), T(10, 10), 'Address', 'Address by BRICS member countries', 'Address by the designated BRICS countries\' dignitaries/officials.'],
  [T(10, 10), T(10, 15), 'Ceremony', 'Formal opening & group photograph', 'Formal declaration/opening of the BRICS Traditional & Indigenous Sports Demonstration Games 2026, followed by a group photograph of dignitaries/delegations.'],
  // 10:15–1:45: seven 30-minute country demonstration slots (inserted below)
  [T(13, 45), T(14, 30), 'Break', 'Lunch', 'Lunch break.'],
  [T(14, 30), T(14, 35), 'AV presentation', 'AV – "A Journey Across Living Traditions"', 'A cinematic recap of the traditional and indigenous sports demonstrations, practitioners, delegations and moments of interaction.'],
  [T(14, 35), T(14, 40), 'Address', 'Welcome Speech', 'Welcome remarks highlighting the successful coming together of BRICS traditions and communities.'],
  [T(14, 40), T(14, 45), 'Cultural', 'Cultural Presentation', 'Artistic presentation bringing together motifs, rhythms and movement inspired by the participating BRICS cultures.'],
  [T(14, 45), T(14, 50), 'AV presentation', 'AV – "Beyond the Game"', 'Focus on the knowledge, traditions, stories and inter-generational heritage carried by indigenous sports.'],
  [T(14, 50), T(15, 0), 'Address', 'Speech', TBC],
  [T(15, 0), T(15, 10), 'Ceremony', 'Recognition of Participating Countries / Delegations', 'Ceremonial acknowledgement of all participating BRICS member/partner countries and practitioners.'],
  [T(15, 10), T(15, 15), 'Address', 'Closing Remarks', TBC],
  [T(15, 15), T(15, 20), 'Address', 'Vote of Thanks', 'Acknowledgement of participating countries, practitioners, officials, technical teams and partners.'],
  [T(15, 20), T(15, 25), 'Ceremony', 'BRICS Group Photo', 'All Heads of Delegation, dignitaries and practitioners invited for a collective photograph.'],
];

export function buildSessions(): Session[] {
  const out: Session[] = FLOW.map(([start, end, kind, title, brief]) => ({ id: `d1-${start}`, day: 1, start, end, venue: 'main', sport: null, country: null, kind, title, brief }));
  DEMO_ORDER.forEach((cid, i) => {
    const c = COUNTRIES.find((x) => x.id === cid)!;
    const start = T(10, 15) + i * 30;
    const sports = SPORTS.filter((s) => s.c === cid).map((s) => s.name).join(', ');
    out.push({
      id: `d1-${start}`, day: 1, start, end: start + 30, venue: 'main', sport: null, country: cid, kind: 'Demonstration', slot: i + 1,
      title: `${c.name}: Demonstration Games`,
      brief: `${i === 0 ? 'Transition to the Demonstration Games. ' : ''}Country ${i + 1}: ${c.name} presents ${sports}.`,
    });
  });
  return out.sort((a, b) => a.start - b.start);
}

// Updates are published by event control during the event; none are pre-loaded.
export const SAMPLE_UPDATES: { id: string; type: UpdateType; day: number; t: number; title: string; body: string }[] = [];

export const DEFAULT_ANNOUNCEMENT = { title: 'Welcome to BRICS Traditional & Indigenous Sports 2026', body: '12 October 2026 · Veer Savarkar Sports Complex, Ahmedabad. The programme begins at 9:00 AM.' };

export const SESSIONS = buildSessions();
export const countryById = (id: string) => COUNTRIES.find((c) => c.id === id)!;
export const sportById = (id: string) => SPORTS.find((s) => s.id === id);
export const venueById = (id: string) => VENUES.find((v) => v.id === id);
export const facilityById = (id: string) => FACILITIES.find((f) => f.id === id);

/** Videos offered in the admin's library at first start. Embedding can be switched off by a video's owner;
 * if one shows "Video unavailable", pick another in the admin. */
export const DEFAULT_VIDEOS = [
  { id: 'v-pkl-final', title: 'Kabaddi: Pro Kabaddi League final highlights', url: 'https://www.youtube.com/watch?v=uDA3kOwmD-g' },
  { id: 'v-pkl-final-2', title: 'Kabaddi: Haryana Steelers vs Patna Pirates, PKL final', url: 'https://www.youtube.com/watch?v=y_iNp6x0EtY' },
];

export const MASCOT = { name: 'Mitra', image: '/brand/mascot-600.png', thumb: '/brand/mascot-160.png' };
export const MASCOT_ABOUT = 'This mascot unites the spirit of all 11 BRICS nations in one powerful athletic character. Its form blends distinctive traits inspired by each member nation’s national animal, symbolizing strength, agility, resilience, and heritage. Every feature contributes to a unique identity that celebrates cultural diversity within a single unified form. The mascot represents cooperation, shared ambition, and the collective sporting spirit of BRICS on the global stage.';
