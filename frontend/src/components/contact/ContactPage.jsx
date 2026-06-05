import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { fadeInUp } from "../../utils/animation";

const ContactPage = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("http://localhost:3000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setStatus(data.success ? "success" : "error");
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <main className="pt-32 min-h-screen pb-20 flex flex-col items-center">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="show"
        className="w-full max-w-2xl px-6"
      >
        <h1 className="text-4xl font-gaming text-lanGold mb-4 text-center">
          Service Après-Vente
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Une question ? Un problème technique ? Contactez-nous à{" "}
          <a
            href="mailto:comiteetuinfo@cegepstfe.ca"
            className="text-lanAccent hover:underline"
          >
            comiteetuinfo@cegepstfe.ca
          </a>
          .
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-neutral-900 p-8 rounded border border-neutral-800 shadow-glow-gold"
        >
          {status === "success" ? (
            <div className="text-center text-green-500 py-10 font-gaming">
              Message envoyé avec succès !
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nom"
                required
                className="w-full bg-black border border-neutral-700 p-3 text-white"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="Courriel"
                required
                className="w-full bg-black border border-neutral-700 p-3 text-white"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Sujet"
                required
                className="w-full bg-black border border-neutral-700 p-3 text-white"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
              />
              <textarea
                placeholder="Votre message"
                required
                rows="5"
                className="w-full bg-black border border-neutral-700 p-3 text-white"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
              />

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full py-4 bg-lanAccent text-white font-gaming hover:bg-red-700 transition-colors"
              >
                {status === "loading" ? "Envoi..." : "Envoyer"}
              </button>
            </div>
          )}
        </form>
      </motion.div>
    </main>
  );
};

export default ContactPage;
