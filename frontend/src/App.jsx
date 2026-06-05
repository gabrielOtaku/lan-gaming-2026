import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Contexte
import { AuthProvider } from "./context/AuthContext";

// Layouts
import Navbar from "./components/layout/Navbar";
import Loader from "./components/layout/Loader";
import Footer3D from "./components/layout/Footer3D";

// Pages / Composants
import HeroCanvas from "./components/home/HeroCanvas";
import BioConcept from "./components/home/BioConcept";
import PartnerBanner from "./components/home/PartnerBanner";
import FoundationBlock from "./components/home/FoundationBlock";
import Timeline from "./components/calendar/Timeline";
import MapOverlay from "./components/calendar/MapOverlay";
import TicketsPage from "./components/tickets/TicketsPage";
import ContactPage from "./components/contact/ContactPage"; // Assure-toi d'avoir ce fichier

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

  // Simulation du temps de chargement des assets 3D
  useEffect(() => {
    setTimeout(() => setLoading(false), 2800);
  }, []);

  return (
    <AuthProvider>
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
                  <Route path="/contact" element={<ContactPage />} />
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
