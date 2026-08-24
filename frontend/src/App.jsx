import React, { useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, MotionConfig } from "framer-motion";

import { AuthProvider } from "./context/AuthContext.jsx";
import Navbar from "./components/layout/Navbar.jsx";
import Footer3D from "./components/layout/Footer3D.jsx";
import Loader from "./components/layout/Loader.jsx";
import CustomCursor from "./components/layout/CustomCursor.jsx";
import LiveCursors from "./components/layout/LiveCursors.jsx";
import Chatbot from "./components/layout/Chatbot.jsx";

// Chaque page (et les scènes 3D + polices/librairies qu'elle importe, ex.
// socket.io-client pour Competitions) part dans son propre chunk : visiter
// l'accueil ne doit pas télécharger le code des quatre autres pages.
const HomePage = lazy(() => import("./pages/HomePage.jsx"));
const CalendarPage = lazy(() => import("./pages/CalendarPage.jsx"));
const TicketsPage = lazy(() => import("./pages/TicketsPage.jsx"));
const ContactPage = lazy(() => import("./pages/ContactPage.jsx"));
const AdminPage = lazy(() => import("./pages/AdminPage.jsx"));
const CagnottePage = lazy(() => import("./pages/CagnottePage.jsx"));
const LivePage = lazy(() => import("./pages/LivePage.jsx"));
const DonationOverlayPage = lazy(() => import("./pages/DonationOverlayPage.jsx"));
const CompetitionsPage = lazy(() => import("./pages/CompetitionsPage.jsx"));
const InvitesVipPage = lazy(() => import("./pages/InvitesVipPage.jsx"));
const CreditsPage = lazy(() => import("./pages/CreditsPage.jsx"));
const PracticalInfoPage = lazy(() => import("./pages/PracticalInfoPage.jsx"));
const MentionsLegalesPage = lazy(() => import("./pages/MentionsLegalesPage.jsx"));
const FestivalFinalesProposal = lazy(() => import("./pages/FestivalFinalesProposal.jsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.jsx"));

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-ember-400/40 border-t-ember-400 rounded-full animate-spin" />
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<RouteFallback />}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/calendrier" element={<CalendarPage />} />
        <Route path="/billetterie" element={<TicketsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/competitions" element={<CompetitionsPage />} />
        <Route path="/invites-vip" element={<InvitesVipPage />} />
        <Route path="/cagnotte" element={<CagnottePage />} />
        <Route path="/live" element={<LivePage />} />
        <Route path="/credits" element={<CreditsPage />} />
        <Route path="/infos-pratiques" element={<PracticalInfoPage />} />
        <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
        <Route path="/interne/festival-finales" element={<FestivalFinalesProposal />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

// matchMedia isn't available during SSR/build, and only needs reading once —
// the OS-level setting rarely changes mid-session.
const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// L'URL /overlay/donations n'est jamais atteinte par navigation interne — elle
// est collée telle quelle dans une Browser Source OBS/Streamlabs. Elle ne doit
// donc porter aucun des habillages du site public (navbar, curseur, loader,
// fond opaque) : on court-circuite tout ça avant même de monter le Router.
// window.location.pathname est stable pour toute la durée de vie de cette
// instance d'App (rien ne navigue vers/depuis cette page en SPA), donc les
// hooks plus bas restent appelés de façon cohérente à chaque rendu.
function isOverlayPath() {
  return typeof window !== "undefined" && window.location.pathname.startsWith("/overlay");
}

export default function App() {
  // Rendu directement, sans BrowserRouter : cette page n'a ni lien interne ni
  // besoin de routing, et Routes/Route exigent un Router déjà monté.
  if (isOverlayPath()) {
    return (
      <Suspense fallback={null}>
        <DonationOverlayPage />
      </Suspense>
    );
  }

  return <MainApp />;
}

function MainApp() {
  const [isLoading, setIsLoading] = useState(!prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const timer = setTimeout(() => setIsLoading(false), 3200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <BrowserRouter>
          <div className="noise-overlay scan-lines min-h-screen bg-obsidian-900 relative">
            <CustomCursor />
            <LiveCursors />
            <AnimatePresence mode="wait">
              {isLoading && (
                <Loader key="loader" onComplete={() => setIsLoading(false)} />
              )}
            </AnimatePresence>

            {!isLoading && (
              <>
                <Navbar />
                <main>
                  <AnimatedRoutes />
                </main>
                <Chatbot />
                <Footer3D />
              </>
            )}
          </div>
        </BrowserRouter>
      </AuthProvider>
    </MotionConfig>
  );
}
