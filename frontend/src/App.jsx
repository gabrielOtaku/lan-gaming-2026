import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { AuthProvider } from "./context/AuthContext.jsx";

// Layouts
import Navbar from "./components/layout/Navbar.jsx";
import Footer3D from "./components/layout/Footer3D.jsx";
import Loader from "./components/layout/Loader.jsx";
import Chatbot from "./components/layout/Chatbot.jsx";
import CustomCursor from "./components/layout/CustomCursor.jsx";

// Components Home
import HeroCanvas from "./components/home/HeroCanvas.jsx";
import BioConcept from "./components/home/BioConcept.jsx";
import Sponsors from "./components/home/Sponsors.jsx";
import FoundationBlock from "./components/home/FoundationBlock.jsx";

// Components Calendar
import Timeline from "./components/calendar/Timeline.jsx";
import MapOverlay from "./components/calendar/MapOverlay.jsx";

// Pages Components
import TicketsPage from "./components/tickets/TicketsPage.jsx";
import ContactPage from "./components/contact/ContactPage.jsx";

const Home = () => (
  <motion.main
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <HeroCanvas />
    <BioConcept />
    <Sponsors />
    <FoundationBlock />
  </motion.main>
);

const CountdownBanner = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    mins: 0,
    secs: 0,
  });

  useEffect(() => {
    const targetDate = new Date("2026-10-09T18:00:00").getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = targetDate - now;
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          secs: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="bg-[#C89B3C]/10 border-y border-[#C89B3C]/15 py-4 mt-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-center gap-6 md:gap-12">
        {Object.entries(timeLeft).map(([unit, value]) => (
          <div key={unit} className="text-center flex items-center gap-4">
            <div>
              <p className="font-black text-3xl md:text-4xl text-[#FFD700] min-w-[3rem]">
                {value.toString().padStart(2, "0")}
              </p>
              <p className="text-gray-500 text-[10px] tracking-widest uppercase">
                {unit}
              </p>
            </div>
            {unit !== "secs" && (
              <span className="text-[#C89B3C] text-2xl hidden md:block animate-pulse">
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const CalendarPage = () => (
  <motion.main
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="min-h-screen pt-10"
  >
    <CountdownBanner />
    <div className="max-w-7xl mx-auto px-6 py-16">
      <Timeline />
      <MapOverlay />
    </div>
  </motion.main>
);

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/calendrier" element={<CalendarPage />} />
        <Route path="/billetterie" element={<TicketsPage />} />
        <Route path="/contact" element={<ContactPage />} />
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

  return (
    <AuthProvider>
      <Router>
        <div className="noise-overlay scan-lines min-h-screen bg-[#030508] relative">
          <CustomCursor />
          <AnimatePresence mode="wait">
            {isLoading && (
              <Loader key="loader" onComplete={() => setIsLoading(false)} />
            )}
          </AnimatePresence>

          {!isLoading && (
            <>
              <Navbar />
              <AnimatedRoutes />
              <Chatbot />
              <Footer3D />
            </>
          )}
        </div>
      </Router>
    </AuthProvider>
  );
}
