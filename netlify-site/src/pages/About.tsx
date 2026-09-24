import { Link } from 'react-router-dom';
import { COUNTRIES, MASCOT, flagUrl } from '../../shared/data.ts';
import { BRAND } from '../lib/hub.tsx';
import { PageHead, Stripe } from '../components/chrome.tsx';

const PIB = 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2302494&lang=2&reg=48';

function Src({ href, children }: { href: string; children: React.ReactNode }) {
  return <p className="source">Source: <a href={href} target="_blank" rel="noopener noreferrer">{children} ↗</a></p>;
}

function Block({ children, accent = BRAND.orange }: { children: React.ReactNode; accent?: string }) {
  return (
    <section className="card prose" style={{ borderRadius: 22, padding: 'clamp(22px, 3.5vw, 40px)', borderTop: `4px solid ${accent}` }}>
      {children}
    </section>
  );
}

export default function About() {
  return (
    <div className="page">
      <PageHead small eyebrow="About us" title="About BRICS Traditional & Indigenous Sports 2026"
        right={<img src="/brand/logo-120.png" alt="BRICS Traditional & Indigenous Sports 2026 logo" style={{ height: 96, width: 'auto' }} />}>
        Celebrating living traditions through sport
      </PageHead>

      <div className="wrap" style={{ paddingTop: 24, display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 'clamp(28px, 4vw, 44px)', maxWidth: 1000 }}>
        <Block>
          <p style={{ fontSize: 18.5, color: BRAND.ink }}>
            BRICS Traditional &amp; Indigenous Sports 2026 is a celebration of sporting heritage, cultural diversity and connections between communities. The event is being developed under India’s BRICS Chairship 2026 to provide a platform for participating countries to share their traditional and indigenous sporting practices.
          </p>
          <p>
            The Government of India describes the initiative as a non-competitive cultural showcase, centred on preserving heritage, encouraging cultural exchange and building mutual understanding through sport.
          </p>
          <Src href={PIB}>Ministry of Youth Affairs and Sports</Src>
        </Block>

        <Block accent={BRAND.green}>
          <h2>Our purpose</h2>
          <p>The event places the people, knowledge and traditions behind sport at the centre of the experience. Through demonstrations, cultural presentations and exchanges between delegations, it aims to:</p>
          <ul>
            <li><strong>Celebrate sporting heritage:</strong> Give visibility to traditional and indigenous practices and the communities that sustain them.</li>
            <li><strong>Connect people and cultures:</strong> Encourage understanding and friendship through shared sporting experiences.</li>
            <li><strong>Recognise practitioners:</strong> Acknowledge the people who carry forward sporting skills, stories and traditions.</li>
            <li><strong>Connect generations:</strong> Highlight the knowledge and cultural heritage passed from one generation to the next.</li>
          </ul>
          <p>These themes are reflected in the planned opening ceremony, demonstration programme and closing presentations.</p>
          <p className="source">Source: Event RFP, pages 26–28</p>
        </Block>

        <Block accent={BRAND.blue}>
          <h2>Where BRICS began</h2>
          <p>The name BRICS grew from the initials of Brazil, Russia, India, China and South Africa. Its origins can be understood through several milestones:</p>
          <div className="timeline">
            <div><span className="yr">2001</span><div><strong>The term BRIC:</strong> Economist Jim O’Neill introduced the acronym at Goldman Sachs to describe Brazil, Russia, India and China as significant emerging economies. This was the origin of the term, before the countries established their formal cooperation. <a href="https://www.goldmansachs.com/our-firm/history/moments/2001-brics" target="_blank" rel="noopener noreferrer">Goldman Sachs ↗</a></div></div>
            <div><span className="yr">2006</span><div><strong>Formal cooperation begins:</strong> The first BRIC Foreign Ministers’ Meeting took place alongside the United Nations General Assembly in New York.</div></div>
            <div><span className="yr">2009</span><div><strong>The first summit:</strong> The first BRIC leaders’ summit was held in Yekaterinburg, Russia, on 16 June.</div></div>
            <div><span className="yr">2010–11</span><div><strong>South Africa joins:</strong> South Africa’s inclusion brought the name BRICS, and it attended its first summit in Sanya, China, in April 2011. <a href="https://brics2021.gov.in/about-brics" target="_blank" rel="noopener noreferrer">Ministry of External Affairs: BRICS history ↗</a></div></div>
          </div>
          <p>BRICS cooperation has developed across political, economic, cultural and people-to-people exchanges. Sport forms part of this wider effort to strengthen connections between countries and their communities.</p>
          <Src href="https://www.loc.gov/item/lcwaN0042825/">BRICS background, Library of Congress</Src>
        </Block>

        <Block accent={BRAND.red}>
          <h2>The origins of BRICS sporting exchanges</h2>
          <p>The first BRICS Games opened in Guangzhou, China, on 17 June 2017, following agreement at the 2016 BRICS Summit in Goa, India.</p>
          <p>That event brought together athletes from the five BRICS countries of the time, with basketball, volleyball and wushu on its programme. Cultural activities accompanied the sporting competitions, giving participants opportunities to connect beyond the field of play.</p>
          <Src href="https://za.china-embassy.gov.cn/eng/zngx_1/ChinaSARelations2017/202401/t20240104_11217921.htm">Official account of the 2017 BRICS Games</Src>
          <p>The 2026 traditional and indigenous sports initiative has a specific focus on cultural demonstrations and the preservation of sporting heritage.</p>
          <Src href={PIB}>Government of India announcement</Src>
        </Block>

        <Block accent={BRAND.yellow}>
          <h2>Why traditional and indigenous sports matter</h2>
          <p>Traditional sports and games are rooted in the identities of communities and regions. Their value includes the skills, customs, relationships and knowledge shared through participation.</p>
          <p>UNESCO recognises traditional sports and games as part of living cultural heritage. Protecting these practices supports dialogue between cultures and generations, helps young people engage with their heritage and keeps community knowledge in active use.</p>
          <Src href="https://www.unesco.org/en/sport-and-anti-doping/traditional-sports-and-games">UNESCO: Traditional Sports and Games</Src>
        </Block>

        <Block accent={BRAND.orange}>
          <h2>What the event will bring together</h2>
          <p>The indicative programme includes a ceremonial welcome, addresses, audiovisual presentations, country-led sports demonstrations, cultural performances and recognition of participating delegations and practitioners.</p>
          <p>Presentations such as “A Journey Across Living Traditions” and “Beyond the Game” will explore the sporting demonstrations alongside the stories, knowledge and intergenerational heritage they represent.</p>
          <p>The detailed programme remains subject to confirmation.</p>
          <p className="source">Source: Event RFP, pages 26–28</p>
          <div style={{ marginTop: 16 }}><Link to="/schedule" className="btn navy">See the programme →</Link></div>
        </Block>

        <Block accent={BRAND.green}>
          <h2>Event coordination</h2>
          <p>Event delivery is planned under the direction of the Sports Authority of Gujarat, with the appointed event management agency working in coordination with the Local Organising Committee.</p>
          <p>Veer Savarkar Sports Complex is the venue for the event.</p>
          <div style={{ marginTop: 16 }}><Link to="/map" className="btn ghost">Venue map →</Link></div>
        </Block>

        <section className="card" style={{ borderRadius: 22, padding: 'clamp(22px, 3.5vw, 36px)' }}>
          <h2 className="h2" style={{ fontSize: 30 }}>Participating countries</h2>
          <Stripe width={80} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 12, marginTop: 20 }}>
            {COUNTRIES.map((c) => (
              <Link key={c.id} to={`/countries/${c.id}`} className="fac" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img className="flag" src={flagUrl(c)} alt="" width={32} height={24} />
                <span style={{ fontWeight: 700, color: BRAND.navy, fontSize: 14.5 }}>{c.name}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mascot-card card" style={{ gridTemplateColumns: 'minmax(160px, 240px) 1fr' }}>
          <img src={MASCOT.image} alt={MASCOT.name ? `${MASCOT.name}, the event mascot` : 'The event mascot'} style={{ maxHeight: 300 }} />
          <div>
            <div className="eyebrow">Meet our mascot</div>
            <h2 className="h2" style={{ marginTop: 8 }}>{MASCOT.name ? `This is our Mascot, ${MASCOT.name}!` : 'This is our Mascot!'}</h2>
            <Stripe />
            <p className="lede" style={{ marginTop: 14 }}>Look out for our mascot at the venue, welcoming delegations and visitors throughout the day.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
