// Event content ported from the Claude Design prototype (project/hub-data.js).
// Countries, sports, venues, facilities and the programme are sample content.
// Replace them here with the real lists; the rest of the app reads only from this file.

const W = (p: string, w = 960) => { const f = p.split('/').pop(); return `https://upload.wikimedia.org/wikipedia/commons/thumb/${p}/${w}px-${f}`; };
const V = (p: string) => { const f = p.split('/').pop(); return `https://upload.wikimedia.org/wikipedia/commons/transcoded/${p}/${f}.480p.vp9.webm`; };

export type SportType = 'Wrestling' | 'Combat' | 'Team' | 'Target' | 'Strength' | 'Skill';
export type VenueId = 'main' | 'fop1' | 'fop2' | 'fop3' | 'tsz' | 'cz';
export interface Country { id: string; name: string; code: string; color: string; story: string }
export interface Sport { id: string; c: string; name: string; type: SportType; photo: string | null; video?: string; about: string }
export interface Venue { id: VenueId; name: string; short: string; kind: string; desc: string; cap: string }
export interface Facility { id: string; name: string; note: string; where: string; hours: string }
export interface Session { id: string; day: number; start: number; end: number; venue: VenueId; sport: string | null; country: string; kind: string }
export interface Story { id: string; title: string; sport: string; video: string; len: string; photo: string }
export type UpdateType = 'Schedule change' | 'Notice' | 'Highlight' | 'Facility';

export const EVENT_DAYS = 3;
export const DAY_START = 9 * 60;
export const DAY_END = 18 * 60 + 30;

export const COUNTRIES: Country[] = [
  { id: 'ind', name: 'India', code: 'IND', color: '#E8871E', story: 'Village-ground games of breath, pursuit and pole gymnastics, played on packed earth for centuries.' },
  { id: 'jpn', name: 'Japan', code: 'JPN', color: '#C8243B', story: 'Budō traditions where ritual, etiquette and form matter as much as the result.' },
  { id: 'mng', name: 'Mongolia', code: 'MNG', color: '#2B6CB0', story: 'The "three manly games" of Naadam: wrestling, archery and horsemanship, with knucklebones for everyone.' },
  { id: 'tur', name: 'Türkiye', code: 'TUR', color: '#0F8B8D', story: 'Kırkpınar oil wrestling has been held annually since 1346, one of the oldest sporting events in the world.' },
  { id: 'tha', name: 'Thailand', code: 'THA', color: '#6B3FA0', story: 'Weapon arts, ancestral boxing and the acrobatic kick-volley game of rattan ball.' },
  { id: 'idn', name: 'Indonesia', code: 'IDN', color: '#B5452C', story: 'Silat schools from across the archipelago, alongside stilt races and spinning-top duels.' },
  { id: 'kor', name: 'Korea', code: 'KOR', color: '#D64F79', story: 'Sand-pit wrestling, flowing foot-fighting and the shuttlecock-kicking game of the new year.' },
  { id: 'sco', name: 'Scotland', code: 'SCO', color: '#1B3A6B', story: 'Highland heavy events: tossing the caber, putting the stone and teams hauling on the rope.' },
  { id: 'irl', name: 'Ireland', code: 'IRL', color: '#2F8F46', story: 'Gaelic games of stick, ball and road, run by communities and played at speed.' },
  { id: 'bra', name: 'Brazil', code: 'BRA', color: '#D9A60B', story: 'Capoeira circles, the feathered hand-shuttle and Xingu wrestling from the Kuarup ceremony.' },
];

export const SPORTS: Sport[] = [
  { id: 'kabaddi', c: 'ind', name: 'Kabaddi', type: 'Team', photo: W('1/1f/Iran_men%27s_national_kabaddi_team_13970602000432636707284535394012_98208.jpg'), video: V('5/53/Kabaddi-japan-2015-10-4.webm'), about: 'A raider crosses into the opposing half on a single breath, tags defenders and races back before being tackled.' },
  { id: 'khokho', c: 'ind', name: 'Kho Kho', type: 'Team', photo: W('2/2c/Kho_Kho_game_at_a_Government_school_in_Haryana%2C_India.jpg'), about: 'A chase game: seated defenders rise when tapped and the chasers change direction only at the poles.' },
  { id: 'mallakhamb', c: 'ind', name: 'Mallakhamb', type: 'Skill', photo: W('3/39/Malakhambha_pradarshana_Nudisir_2015_02.JPG'), about: 'Gymnasts perform holds, climbs and inversions on a vertical wooden pole or a hanging rope.' },
  { id: 'sumo', c: 'jpn', name: 'Sumo', type: 'Wrestling', photo: W('a/ac/Asashoryu_fight_Jan08.JPG'), video: V('f/f2/Sumo.webm'), about: 'Two rikishi meet in a clay ring. Force the opponent out, or make anything but the soles of their feet touch the ground.' },
  { id: 'kendo', c: 'jpn', name: 'Kendo', type: 'Combat', photo: W('f/ff/2022_All_Japan_Kendo_Championship_Tetsuhiko_Murakami4.jpg'), about: 'Bamboo-sword fencing in armour. Points need a clean strike, correct posture and a spirited shout.' },
  { id: 'kyudo', c: 'jpn', name: 'Kyūdō', type: 'Target', photo: W('2/29/Professor_Inagaki_Genshiro.jpg'), about: 'The way of the bow: a tall asymmetric yumi and eight prescribed stages for every shot.' },
  { id: 'bokh', c: 'mng', name: 'Bökh', type: 'Wrestling', photo: W('3/3e/Men_Traditional_Wrestling_Outfits_Stage_a_Display_as_Secretary_Kerry_Attends_a_%22Mini-Nadaam%22_in_a_Field_Outside_Ulaanbaatar_%2826934055503%29.jpg'), about: 'No weight classes, no ring. A bout ends when any part of the body other than feet or hands touches the ground.' },
  { id: 'archery', c: 'mng', name: 'Mongolian Archery', type: 'Target', photo: null, about: 'Composite bows, leather targets on the ground and judges who sing the result of each shot.' },
  { id: 'shagai', c: 'mng', name: 'Shagai', type: 'Skill', photo: W('e/e4/Shagai_2x2.jpg'), about: 'Knucklebone shooting: flick a marble-sized bone along a board to knock the target bones.' },
  { id: 'oil', c: 'tur', name: 'Oil Wrestling', type: 'Wrestling', photo: W('d/dd/Yagli_gures3.JPG'), about: 'Pehlivans douse themselves in olive oil and wrestle in leather kispet trousers on open grass.' },
  { id: 'cirit', c: 'tur', name: 'Cirit', type: 'Team', photo: null, about: 'A mounted team game in which riders throw blunted javelins at opponents while dodging in return.' },
  { id: 'okculuk', c: 'tur', name: 'Turkish Archery', type: 'Target', photo: null, about: 'Short recurve bows built for distance. Flight-shooting records from the Ottoman era still stand.' },
  { id: 'muay', c: 'tha', name: 'Muay Boran', type: 'Combat', photo: W('e/ea/Muay_Thai_Boran_1.jpg'), about: 'The ancestral form of Thai boxing, with rope-bound hands and a pre-fight wai khru dance.' },
  { id: 'sepak', c: 'tha', name: 'Sepak Takraw', type: 'Team', photo: W('7/75/Incheon_AsianGames_Sepaktakraw_09_%2815291705581%29.jpg'), video: V('c/c7/BIM_sepak_takraw.webm'), about: 'Volleyball played with the feet, knees and head over a net, using a woven rattan ball.' },
  { id: 'krabi', c: 'tha', name: 'Krabi Krabong', type: 'Combat', photo: W('7/71/Krabi_Krabong_Buddhai_Swan_1.jpg'), about: 'A weapons art of swords, staffs and shields, performed with live music.' },
  { id: 'silat', c: 'idn', name: 'Pencak Silat', type: 'Combat', photo: W('e/e2/DSC_3099_wikimedia2020_deni_dahniel_atraksi_silek_minagkabau.jpg'), about: 'A family of martial arts from the archipelago, shown as solo forms, duets and sparring.' },
  { id: 'egrang', c: 'idn', name: 'Egrang', type: 'Skill', photo: null, about: 'Bamboo stilt racing and balance duels, a staple of Independence Day village games.' },
  { id: 'gasing', c: 'idn', name: 'Gasing', type: 'Skill', photo: null, about: 'Top spinning: hard-wood tops are thrown to spin the longest or to knock rivals out of the circle.' },
  { id: 'ssireum', c: 'kor', name: 'Ssireum', type: 'Wrestling', photo: W('d/d0/Danwon-Ssireum.jpg'), about: 'Wrestlers grip each other\'s satba sash in a sand ring. The first to touch down above the knee loses.' },
  { id: 'taekkyon', c: 'kor', name: 'Taekkyon', type: 'Combat', photo: W('a/a6/KTF_National_Championships.png'), about: 'A rhythmic foot-fighting art with a constant dance-like step, on the UNESCO heritage list.' },
  { id: 'jegi', c: 'kor', name: 'Jegichagi', type: 'Skill', photo: W('5/5c/Sailors_play_Jegichagi_with_Korean_students_during_a_community_relations_event_%2830361247131%29.jpg'), about: 'Keep a paper-tasselled shuttle in the air with the inside of the foot for as long as possible.' },
  { id: 'caber', c: 'sco', name: 'Caber Toss', type: 'Strength', photo: W('4/4c/Caber_2.jpg'), about: 'Run with a tapered log upright, then toss it so it flips end over end and lands at twelve o\'clock.' },
  { id: 'stone', c: 'sco', name: 'Stone Put', type: 'Strength', photo: W('7/79/Highland_Games-Opening_ceremonies_in_Canmore.jpg'), about: 'The forerunner of shot put, thrown with a river stone from behind a trig board.' },
  { id: 'tug', c: 'sco', name: 'Tug of War', type: 'Team', photo: W('5/5b/Queen_Mary%27s_Auxilary_Army_Corps_tug-o-war%2C_3_August_1918_%28cropped%29.jpg'), about: 'Two teams of eight, one rope and a four-metre pull to win the end.' },
  { id: 'hurling', c: 'irl', name: 'Hurling', type: 'Team', photo: W('9/9f/David_Collins_and_Eoin_Kelly_%28Tipperary%29.jpg'), about: 'Players strike a sliotar with an ash hurley at over 150 km/h. Often called the fastest game on grass.' },
  { id: 'gaelic', c: 'irl', name: 'Gaelic Football', type: 'Team', photo: W('e/ea/Aidan_O%27Mahony_%26_Eoin_Bradley.jpg'), about: 'Carry, bounce, solo and kick. Over the bar for a point, under it for a goal.' },
  { id: 'bowling', c: 'irl', name: 'Road Bowling', type: 'Target', photo: W('d/d7/Road_Bowling.jpg'), about: 'Throw a 28-ounce iron bowl along a country road. Fewest throws over the course wins.' },
  { id: 'capoeira', c: 'bra', name: 'Capoeira', type: 'Combat', photo: W('1/19/Rugendasroda.jpg'), video: V('4/46/Capoeira_no_terreiro_de_jesus.webm'), about: 'Played in a roda to the berimbau: kicks, escapes and acrobatics in a continuous conversation.' },
  { id: 'peteca', c: 'bra', name: 'Peteca', type: 'Skill', photo: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Modernpeteca.jpg', about: 'A feathered hand-shuttle struck over a net with the palm, with roots in Tupi games.' },
  { id: 'huka', c: 'bra', name: 'Huka-Huka', type: 'Wrestling', photo: W('6/66/Huka_huka_fight_Kuarup_ceremony.jpg', 500), about: 'Xingu wrestling that opens from kneeling. Part of the Kuarup ceremony honouring ancestors.' },
];

export const VENUES: Venue[] = [
  { id: 'main', name: 'Main Arena', short: 'Arena', kind: 'Showcase', desc: 'Headline showcases and the daily parade of nations.', cap: '4,000 seats' },
  { id: 'fop1', name: 'FOP 1', short: 'FOP 1', kind: 'Demonstration', desc: 'Wrestling and combat demonstrations on a 12 m mat.', cap: 'Standing + 600 seats' },
  { id: 'fop2', name: 'FOP 2', short: 'FOP 2', kind: 'Demonstration', desc: 'Team games on a 40 × 20 m turf field.', cap: 'Standing + 900 seats' },
  { id: 'fop3', name: 'FOP 3', short: 'FOP 3', kind: 'Demonstration', desc: 'Target, strength and skill events.', cap: 'Standing + 400 seats' },
  { id: 'tsz', name: 'Traditional Sports Zone', short: 'TS Zone', kind: 'Have-a-go', desc: 'Try it yourself with coaches from each country.', cap: 'Open area' },
  { id: 'cz', name: 'Cultural Zone', short: 'Culture', kind: 'Performance', desc: 'Music, costume, storytelling and country showcases.', cap: 'Open area' },
];

export const FACILITIES: Facility[] = [
  { id: 'registration', name: 'Registration', note: 'Accreditation and athlete check-in', where: 'North Gate', hours: '08:00–18:00' },
  { id: 'info', name: 'Information', note: 'Lost property, accessibility help, programme questions', where: 'Beside Main Arena', hours: '08:30–19:00' },
  { id: 'food', name: 'Food', note: 'Food court with dishes from all 10 countries', where: 'Between FOP 2 and Cultural Zone', hours: '10:00–20:00' },
  { id: 'medical', name: 'Medical', note: 'First aid and ambulance point', where: 'Behind FOP 1', hours: 'All event hours' },
  { id: 'transport', name: 'Transport', note: 'Shuttle buses to partner hotels every 20 min', where: 'South Gate', hours: '07:30–21:00' },
  { id: 'toilets', name: 'Toilets', note: 'Accessible toilets at every block', where: '4 blocks across the site', hours: 'All event hours' },
  { id: 'water', name: 'Water points', note: 'Free refill stations', where: 'Next to every FOP', hours: 'All event hours' },
  { id: 'prayer', name: 'Prayer room', note: 'Quiet room, multi-faith', where: 'Cultural Zone pavilion', hours: '09:00–18:00' },
];

const VENUE_TYPES: Record<string, SportType[]> = { fop1: ['Wrestling', 'Combat'], fop2: ['Team'], fop3: ['Target', 'Strength', 'Skill'] };
const pad = (n: number) => String(n).padStart(2, '0');
export const hhmm = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;

export function buildSessions(): Session[] {
  const out: Session[] = [];
  const cursors: Record<string, number> = {};
  const pick = (types: SportType[] | null, seed: number): Sport => {
    const pool = SPORTS.filter((s) => !types || types.includes(s.type));
    const k = types ? types.join() : 'all';
    cursors[k] = ((cursors[k] ?? seed) + 1) % pool.length;
    return pool[cursors[k]];
  };
  for (const day of [1, 2, 3]) {
    for (let t = 9 * 60; t < 18 * 60; t += 30) {
      for (const v of ['fop1', 'fop2', 'fop3'] as const) out.push(mk(day, t, 30, v, pick(VENUE_TYPES[v], day * 3), 'Demonstration'));
      if (t % 60 === 0) {
        out.push(mk(day, t, 45, 'main', pick(null, day * 7), 'Showcase'));
        out.push(mk(day, t, 60, 'tsz', pick(null, day * 11), 'Have-a-go'));
        out.push(mk(day, t + 30, 30, 'cz', COUNTRIES[(t / 60 + day) % 10], 'Cultural performance'));
      }
    }
  }
  // Scripted example from the brief: Day 2 14:30 FOP 1 and 15:00 FOP 2
  const fix = (day: number, start: number, venue: VenueId, sportId: string) => { const s = out.find((x) => x.day === day && x.start === start && x.venue === venue)!; const sp = SPORTS.find((x) => x.id === sportId)!; s.sport = sp.id; s.country = sp.c; };
  fix(2, 14 * 60 + 30, 'fop1', 'sumo');
  fix(2, 15 * 60, 'fop2', 'kabaddi');
  fix(2, 14 * 60 + 30, 'fop2', 'sepak');
  fix(2, 14 * 60, 'main', 'capoeira');
  return out;
}
function mk(day: number, start: number, len: number, venue: VenueId, ref: Sport | Country, kind: string): Session {
  const isCountry = !('c' in ref);
  return { id: `d${day}-${venue}-${start}`, day, start, end: start + len, venue, sport: isCountry ? null : ref.id, country: isCountry ? ref.id : (ref as Sport).c, kind };
}

// Sample updates, published on Day 2 at the given minute once the event clock passes it.
export const SAMPLE_UPDATES: { id: string; type: UpdateType; day: number; t: number; title: string; body: string }[] = [
  { id: 'u1', day: 2, type: 'Schedule change', t: 14 * 60 + 20, title: 'Gaelic Football moved from FOP 3 to FOP 2', body: 'The 16:00 demonstration now takes place on FOP 2 to allow a full-size pitch.' },
  { id: 'u2', day: 2, type: 'Notice', t: 13 * 60 + 55, title: 'Shuttle frequency increased', body: 'Hotel shuttles now leave South Gate every 15 minutes until 21:00.' },
  { id: 'u3', day: 2, type: 'Highlight', t: 13 * 60 + 10, title: 'Record crowd for the Sumo showcase', body: 'The Main Arena reached capacity for the 13:00 showcase. Repeat session at 16:30 on FOP 1.' },
  { id: 'u4', day: 2, type: 'Facility', t: 12 * 60 + 40, title: 'Water point added beside FOP 3', body: 'A second refill station is open between FOP 3 and the Traditional Sports Zone.' },
  { id: 'u5', day: 2, type: 'Notice', t: 11 * 60 + 5, title: 'Have-a-go sign-up is walk-in only', body: 'No booking needed. Join the queue at the Traditional Sports Zone entrance.' },
  { id: 'u6', day: 2, type: 'Highlight', t: 10 * 60 + 15, title: 'Parade of Nations opens Day 2', body: 'All 10 delegations took part in the morning parade at the Main Arena.' },
];

export const STORIES: Story[] = [
  { id: 's1', title: 'Salt, stamp and clash: the rituals before a sumo bout', sport: 'sumo', video: V('1/1e/Sumo_stable_practice%2C_Tokyo_2014-08-19.webm'), len: '0:26', photo: W('a/ac/Asashoryu_fight_Jan08.JPG') },
  { id: 's2', title: 'One breath, one raid: learning kabaddi in a day', sport: 'kabaddi', video: V('5/53/Kabaddi-japan-2015-10-4.webm'), len: '0:11', photo: W('1/1f/Iran_men%27s_national_kabaddi_team_13970602000432636707284535394012_98208.jpg') },
  { id: 's3', title: 'Inside the roda: music as the referee in capoeira', sport: 'capoeira', video: V('4/46/Capoeira_no_terreiro_de_jesus.webm'), len: '0:23', photo: W('1/19/Rugendasroda.jpg') },
];

export const DEFAULT_ANNOUNCEMENT = { title: 'Gate B closed 15:00–15:30', body: 'Use Gate A or South Gate while the Parade of Nations passes. Sessions run on time.' };

export const SESSIONS = buildSessions();
export const countryById = (id: string) => COUNTRIES.find((c) => c.id === id)!;
export const sportById = (id: string) => SPORTS.find((s) => s.id === id);
export const venueById = (id: string) => VENUES.find((v) => v.id === id);
export const facilityById = (id: string) => FACILITIES.find((f) => f.id === id);
