import React, { useState, useEffect } from "react";
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

import HomePage from "./pages/HomePage.jsx";
import CalendarPage from "./pages/CalendarPage.jsx";
import TicketsPage from "./pages/TicketsPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import BoutiquePage from "./pages/BoutiquePage.jsx";
import CagnottePage from "./pages/CagnottePage.jsx";
import CompetitionsPage from "./pages/CompetitionsPage.jsx";
import InvitesVipPage from "./pages/InvitesVipPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

function AnimatedRoutes() {
  const location = useLocation();

  useEffect(() => {
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    }
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
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
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
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
