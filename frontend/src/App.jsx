import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/layout/Navbar";
import Loader from "./components/layout/Loader";
import Footer3D from "./components/layout/Footer3D";
import HeroCanvas from "./components/home/HeroCanvas";
import BioConcept from "./components/home/BioConcept";
import PartnerBanner from "./components/home/PartnerBanner";
import FoundationBlock from "./components/home/FoundationBlock";
import Timeline from "./components/calendar/Timeline";
import MapOverlay from "./components/calendar/MapOverlay";
import TicketsPage from "./components/tickets/TicketsPage";

const Home = () => (
  <main>
    <HeroCanvas />
    <BioConcept />
    <PartnerBanner />
    <FoundationBlock />
  </main>
);

const CalendarPage = () => (
  <main className="pt-24 min-h-screen pb-20">
    <Timeline />
    <MapOverlay />
  </main>
);

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 2800);
  }, []);

  return (
    <AuthProvider>
      {" "}
      {/* <-- Enveloppe toute l'application */}
      <Router>
        <AnimatePresence mode="wait">
          {loading ? (
            <Loader key="loader" />
          ) : (
            <div key="content" className="flex flex-col min-h-screen">
              <Navbar />
              <div className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/calendrier" element={<CalendarPage />} />
                  <Route path="/billetterie" element={<TicketsPage />} />
                </Routes>
              </div>
              <Footer3D />
            </div>
          )}
        </AnimatePresence>
      </Router>
    </AuthProvider>
  );
}

export default App;
