import React, { useState, useEffect, Suspense, lazy } from "react";
import Lenis from "@studio-freight/lenis";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

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
const BoutiquePage = lazy(() => import("./pages/BoutiquePage.jsx"));
const CagnottePage = lazy(() => import("./pages/CagnottePage.jsx"));
const CompetitionsPage = lazy(() => import("./pages/CompetitionsPage.jsx"));
const InvitesVipPage = lazy(() => import("./pages/InvitesVipPage.jsx"));
const CreditsPage = lazy(() => import("./pages/CreditsPage.jsx"));
const PracticalInfoPage = lazy(() => import("./pages/PracticalInfoPage.jsx"));
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
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    }
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
        <Route path="/boutique" element={<BoutiquePage />} />
        <Route path="/cagnotte" element={<CagnottePage />} />
        <Route path="/credits" element={<CreditsPage />} />
        <Route path="/infos-pratiques" element={<PracticalInfoPage />} />
        <Route path="/interne/festival-finales" element={<FestivalFinalesProposal />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 2,
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);
    window.__lenis = lenis;

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  return (
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
  );
}
