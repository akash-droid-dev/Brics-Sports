import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { HubProvider, useHub, useLiveState } from './lib/hub.tsx';
import { AnnouncementBar, BackDock, Footer, Header, LiveToast } from './components/chrome.tsx';
import Home from './pages/Home.tsx';
import { Countries, CountryDetail, Schedule, SportDetail, Sports } from './pages/Browse.tsx';
import { MapPage, Updates } from './pages/MapUpdates.tsx';
import About from './pages/About.tsx';

const Admin = lazy(() => import('./admin/Admin.tsx'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    // The map swaps its selection in place; everything else starts at the top.
    if (!pathname.startsWith('/map/') && !location.hash) window.scrollTo({ top: 0 });
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
      <img src="/brand/logo-mark.png" alt="" width={96} height={96} style={{ animation: 'ftsSpin 6s linear infinite' }} />
      <div className="mono" style={{ fontSize: 12, letterSpacing: '.14em', color: '#F28C28', textTransform: 'uppercase' }}>{error ? 'Reconnecting to the Live Hub…' : 'Loading the Live Hub…'}</div>
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
      <main className={pathname === '/' ? undefined : 'has-back'}>
        {pathname !== '/' && <BackDock />}
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
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
      <LiveToast />
    </HubProvider>
  );
}
