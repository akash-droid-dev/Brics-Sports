import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { HubProvider, useHub, useLiveState } from './lib/hub.tsx';
import { AnnouncementBar, Emblem, Footer, Header, LiveToast } from './components/chrome.tsx';
import Home from './pages/Home.tsx';
import { Countries, CountryDetail, Schedule, SportDetail, Sports } from './pages/Browse.tsx';
import { MapPage, Updates } from './pages/MapUpdates.tsx';

const Admin = lazy(() => import('./admin/Admin.tsx'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    // The map swaps its selection in place; everything else starts at the top.
    if (!pathname.startsWith('/map/')) window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

function Title() {
  const { settings } = useHub();
  useEffect(() => { document.title = `${settings.eventName} · Live Hub`; }, [settings.eventName]);
  return null;
}

function Loading({ error }: { error?: boolean }) {
  return (
    <div style={{ minHeight: '100vh', background: '#13100D', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
      <div style={{ animation: 'ftsSpin 4s linear infinite' }}><Emblem size={72} /></div>
      <div className="mono" style={{ fontSize: 12, letterSpacing: '.14em', color: '#F3A53A', textTransform: 'uppercase' }}>{error ? 'Reconnecting to the Live Hub…' : 'Loading the Live Hub…'}</div>
    </div>
  );
}

export default function App() {
  const { state, setState, online } = useLiveState();
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin')) {
    if (!state) return <Loading error={!online} />;
    return <Suspense fallback={<Loading />}><Admin state={state} onState={setState} /></Suspense>;
  }
  if (!state) return <Loading error={!online} />;
  return (
    <HubProvider state={state}>
      <Title />
      <ScrollToTop />
      <Header />
      <AnnouncementBar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/countries" element={<Countries />} />
          <Route path="/countries/:id" element={<CountryDetail />} />
          <Route path="/sports" element={<Sports />} />
          <Route path="/sports/:id" element={<SportDetail />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/map/:loc" element={<MapPage />} />
          <Route path="/updates" element={<Updates />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
      <LiveToast />
    </HubProvider>
  );
}
