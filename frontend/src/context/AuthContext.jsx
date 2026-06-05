import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Vérifie si l'utilisateur est déjà connecté en mémoire locale
  useEffect(() => {
    const storedUser = localStorage.getItem("lanUser");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Fonction de connexion (Simule le retour OAuth de Google/Microsoft)
  const login = (provider) => {
    const mockUser = {
      name: "Gabriel Hervé", // Profil de test
      email: "joueur@cegepstfe.ca",
      provider: provider,
      reservation: null,
    };
    setUser(mockUser);
    localStorage.setItem("lanUser", JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("lanUser");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
