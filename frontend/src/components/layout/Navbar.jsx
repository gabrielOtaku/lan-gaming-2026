import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import Logo from "./Logo";

const Navbar = () => {
  const location = useLocation();
  const { user, login, logout } = useAuth();

  const navLinks = [
    { name: "Accueil", path: "/" },
    { name: "Calendrier & Plans", path: "/calendrier" },
    { name: "Billetterie", path: "/billetterie" },
  ];

  return (
    <nav className="fixed w-full z-50 bg-lanDark/90 backdrop-blur-md border-b border-lanGold/20">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-3 group">
          <Logo className="w-14 h-14" />
          <div className="flex flex-col">
            <span className="text-2xl font-gaming tracking-widest text-white drop-shadow-glow-gold group-hover:text-lanGold transition-colors">
              LAN <span className="text-lanAccent">2026</span>
            </span>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest -mt-1">
              Cégep St-Félicien
            </span>
          </div>
        </Link>

        <ul className="hidden md:flex space-x-8">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                to={link.path}
                className={`text-sm uppercase tracking-widest transition-colors duration-300 hover:text-lanGold hover:drop-shadow-glow-gold ${
                  location.pathname === link.path
                    ? "text-lanGold"
                    : "text-gray-400"
                }`}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {user ? (
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-lanGold font-gaming tracking-widest text-sm">
              {user.name}
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 text-xs border border-gray-600 text-gray-400 hover:text-white hover:border-white transition-colors uppercase tracking-wider"
            >
              Déconnexion
            </button>
          </div>
        ) : (
          <div className="hidden md:flex space-x-3">
            <motion.button
              onClick={() => login("Google")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 border border-blue-500 text-blue-500 font-sans uppercase text-xs tracking-wider hover:bg-blue-500 hover:text-white transition-all shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            >
              Google
            </motion.button>
            <motion.button
              onClick={() => login("Microsoft")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 border border-lanAccent text-lanAccent font-sans uppercase text-xs tracking-wider hover:bg-lanAccent hover:text-white transition-all shadow-glow-red"
            >
              Microsoft
            </motion.button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
