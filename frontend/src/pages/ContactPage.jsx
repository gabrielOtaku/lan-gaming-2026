import React, { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Send, Mail, MapPin, Clock, CheckCircle, AlertTriangle, Zap } from 'lucide-react';
import { pageTransition, staggerContainer, fadeInUp, scrollRevealLeft, scrollRevealRight, EASE_GAME } from '../utils/animations.js';

const SUBJECTS = [
  { value: 'information', label: 'Informations générales' },
  { value: 'billet', label: 'Problème de billet' },
  { value: 'tournoi', label: 'Inscriptions tournois' },
  { value: 'partenariat', label: 'Partenariat / Commandite' },
  { value: 'media', label: 'Presse / Médias' },
  { value: 'autre', label: 'Autre' },
];

const CONTACT_INFO = [
  {
    icon: Mail,
    label: 'Courriel officiel',
    value: 'comiteetuinfo@cegepstfe.ca',
    href: 'mailto:comiteetuinfo@cegepstfe.ca',
    color: '#C89B3C',
  },
  {
    icon: MapPin,
    label: 'Lieu de l\'événement',
    value: '525 Boul. Hamel, Saint-Félicien, QC',
    href: 'https://maps.google.com/?q=Cégep+de+Saint-Félicien',
    color: '#FF4655',
  },
  {
    icon: Clock,
    label: 'Réponse sous',
    value: '48h ouvrables',
    href: null,
    color: '#4FC3F7',
  },
];

function GlitchText({ text, className }) {
  return (
    <span className={`relative inline-block ${className}`} data-text={text}>
      {text}
      <motion.span
        className="absolute inset-0 text-ember-300 pointer-events-none"
        animate={{
          opacity: [0, 0, 1, 0, 0, 0.5, 0],
          x: [0, -2, 2, 0, 1, -1, 0],
          clipPath: [
            'inset(0 0 100% 0)',
            'inset(30% 0 50% 0)',
            'inset(60% 0 10% 0)',
            'inset(0 0 100% 0)',
          ],
        }}
        transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 6 + Math.random() * 4 }}
        aria-hidden
      >
        {text}
      </motion.span>
    </span>
  );
}

function ContactCard({ icon: Icon, label, value, href, color, index }) {
  const ref = useRef();
  const inView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: index * 0.12, duration: 0.6, ease: EASE_GAME }}
      className="group"
    >
      {href ? (
        <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="block">
          <CardInner Icon={Icon} label={label} value={value} color={color} />
        </a>
      ) : (
        <CardInner Icon={Icon} label={label} value={value} color={color} />
      )}
    </motion.div>
  );
}

function CardInner({ Icon, label, value, color }) {
  return (
    <motion.div
      className="flex items-start gap-4 p-4 border border-zinc-800 bg-obsidian-800/60 hover:border-opacity-60 transition-all duration-300 cursor-default group-[a]:cursor-pointer"
      whileHover={{ borderColor: `${color}50`, x: 4 }}
      style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
    >
      <div
        className="w-10 h-10 clip-hex flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ backgroundColor: `${color}20`, borderColor: `${color}40` }}
      >
        <Icon size={16} style={{ color }} />
      </div>
      <div>
        <p className="font-mono text-zinc-600 text-[10px] tracking-widest uppercase mb-1">{label}</p>
        <p className="font-body text-zinc-300 text-sm leading-snug">{value}</p>
      </div>
    </motion.div>
  );
}

function FormField({ label, code, children, error }) {
  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-1.5">
        <label className="font-mono text-ember-500 text-[10px] tracking-widest uppercase">{label}</label>
        <span className="font-mono text-zinc-800 text-[9px] tracking-widest">{code}</span>
      </div>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-1.5 mt-1.5 font-mono text-red-400 text-[10px]"
          >
            <AlertTriangle size={10} /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputCls =
  'w-full bg-obsidian-900 border border-zinc-800 focus:border-ember-400/60 text-white text-sm px-4 py-3 outline-none transition-all duration-300 font-body placeholder-zinc-700 focus:bg-obsidian-800/80';

const clipStyle = {
  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
};

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'information', message: '' });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null); // null | 'sending' | 'success' | 'error'

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.length < 2) errs.name = 'Minimum 2 caractères requis.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Adresse courriel invalide.';
    if (!form.message.trim() || form.message.length < 10) errs.message = 'Message trop court (10 caractères min).';
    if (!consent) errs.consent = 'Ton consentement est requis pour envoyer ce formulaire.';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...form, subject: SUBJECTS.find((s) => s.value === form.subject)?.label || form.subject }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        setForm({ name: '', email: '', subject: 'information', message: '' });
        setConsent(false);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const titleRef = useRef();
  const inView = useInView(titleRef, { once: true });

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen pt-24 pb-20 relative overflow-hidden"
    >
      {/* Background ambiance */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-obsidian-900" />
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
          animate={{ opacity: [0.04, 0.08, 0.04], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
          style={{ background: 'radial-gradient(circle, #C89B3C, transparent)' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full"
          animate={{ opacity: [0.03, 0.07, 0.03], scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          style={{ background: 'radial-gradient(circle, #FF4655, transparent)' }}
        />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(200,155,60,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(200,155,60,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          ref={titleRef}
          className="text-center mb-16"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          <motion.p
            variants={fadeInUp}
            className="font-mono text-ember-500 text-xs tracking-[0.5em] uppercase mb-4"
          >
            [ Support · Service Après-Vente ]
          </motion.p>

          <motion.h1
            variants={fadeInUp}
            className="font-display text-5xl md:text-7xl font-black uppercase leading-none mb-4"
          >
            <span className="block text-white">Service</span>
            <GlitchText
              text="Support"
              className="block font-display text-5xl md:text-7xl font-black uppercase text-ember-glow"
              style={{ color: '#C89B3C' }}
            />
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="font-body text-zinc-500 max-w-xl mx-auto text-sm leading-relaxed"
          >
            Une question sur l'événement, un problème de billet, une opportunité de partenariat?
            L'équipe du comité étudiant est à l'écoute.
          </motion.p>

          {/* Divider */}
          <motion.div
            variants={fadeInUp}
            className="flex items-center justify-center gap-4 mt-8"
          >
            <div className="h-px flex-1 max-w-24 bg-gradient-to-r from-transparent to-ember-400/30" />
            <Zap size={12} className="text-ember-500" />
            <div className="h-px flex-1 max-w-24 bg-gradient-to-l from-transparent to-ember-400/30" />
          </motion.div>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left — Contact info */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <motion.div
              variants={scrollRevealLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
            >
              <p className="font-mono text-ember-500 text-xs tracking-widest uppercase mb-4">
                Coordonnées
              </p>
              <div className="space-y-3">
                {CONTACT_INFO.map((info, i) => (
                  <ContactCard key={info.label} {...info} index={i} />
                ))}
              </div>
            </motion.div>

            {/* Decorative terminal block */}
            <motion.div
              variants={scrollRevealLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              className="border border-zinc-800/60 bg-obsidian-900/80 p-4 font-mono text-xs"
              style={clipStyle}
            >
              <div className="text-ember-500 mb-2 tracking-widest">// STATUT DU SYSTÈME</div>
              {[
                { key: 'événement', val: 'CONFIRMÉ', color: '#22c55e' },
                { key: 'billetterie', val: 'OUVERTE', color: '#22c55e' },
                { key: 'tournois', val: 'INSCRIPTIONS_OUVERTES', color: '#22c55e' },
                { key: 'support', val: 'ACTIF', color: '#22c55e' },
              ].map(({ key, val, color }, i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                  className="flex items-center gap-2 mb-1.5"
                >
                  <span className="text-zinc-700">{key}:</span>
                  <motion.span
                    style={{ color }}
                    animate={{ opacity: [1, 0.6, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
                  >
                    {val}
                  </motion.span>
                </motion.div>
              ))}
              <div className="mt-3 border-t border-zinc-800 pt-2 text-zinc-700">
                <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.8, repeat: Infinity }}>
                  █
                </motion.span>
              </div>
            </motion.div>
          </div>

          {/* Right — Form */}
          <motion.div
            className="lg:col-span-3"
            variants={scrollRevealRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <div
              className="bg-obsidian-800/60 border border-zinc-800 p-6 md:p-8 relative"
              style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}
            >
              {/* Corner badge */}
              <div className="absolute top-0 right-0 px-3 py-1 bg-ember-400/10 border-b border-l border-ember-400/20">
                <span className="font-mono text-ember-500 text-[9px] tracking-widest uppercase">Transmission Sécurisée</span>
              </div>

              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-16 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="w-16 h-16 mx-auto clip-hex bg-green-500/20 border border-green-500/40 flex items-center justify-center mb-6"
                    >
                      <CheckCircle size={28} className="text-green-400" />
                    </motion.div>
                    <h3 className="font-display text-2xl text-white font-bold mb-3 tracking-wide">
                      Transmission Reçue
                    </h3>
                    <p className="font-body text-zinc-400 text-sm max-w-xs mx-auto leading-relaxed">
                      Ton message a été transmis avec succès à l'organisation. Réponse sous 48h ouvrables.
                    </p>
                    <motion.button
                      onClick={() => setStatus(null)}
                      className="mt-8 font-mono text-xs text-ember-400 border border-ember-400/30 px-5 py-2 hover:border-ember-400 hover:text-ember-300 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Nouveau message →
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5"
                  >
                    <p className="font-mono text-ember-500 text-[10px] tracking-widest uppercase mb-6">
                      Formulaire de contact
                    </p>

                    {/* Name + Email */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField label="Nom complet" code="[REQ]" error={errors.name}>
                        <input
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Jean Tremblay"
                          className={`${inputCls} ${errors.name ? 'border-red-500/50' : ''}`}
                          style={clipStyle}
                        />
                      </FormField>
                      <FormField label="Adresse courriel" code="[REQ]" error={errors.email}>
                        <input
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="ton@email.ca"
                          className={`${inputCls} ${errors.email ? 'border-red-500/50' : ''}`}
                          style={clipStyle}
                        />
                      </FormField>
                    </div>

                    {/* Subject */}
                    <FormField label="Sujet" code="[OPT]">
                      <select
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        className={`${inputCls} cursor-pointer`}
                        style={clipStyle}
                      >
                        {SUBJECTS.map((s) => (
                          <option key={s.value} value={s.value} className="bg-obsidian-900">
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </FormField>

                    {/* Message */}
                    <FormField label="Message" code="[REQ]" error={errors.message}>
                      <div className="relative">
                        <textarea
                          name="message"
                          value={form.message}
                          onChange={handleChange}
                          placeholder="Décris ton problème ou ta demande..."
                          rows={5}
                          className={`${inputCls} resize-none ${errors.message ? 'border-red-500/50' : ''}`}
                          style={clipStyle}
                        />
                        <span className="absolute bottom-2.5 right-3 font-mono text-zinc-700 text-[9px]">
                          {form.message.length}/2000
                        </span>
                      </div>
                    </FormField>

                    {/* Consent checkbox */}
                    <div>
                      <label className="flex items-start gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={consent}
                          onChange={(e) => {
                            setConsent(e.target.checked);
                            if (errors.consent) setErrors((er) => ({ ...er, consent: undefined }));
                          }}
                          className="mt-0.5 w-4 h-4 flex-shrink-0 accent-ember-400 cursor-pointer"
                        />
                        <span className="font-body text-zinc-500 text-xs leading-relaxed">
                          J'accepte que les informations transmises via ce formulaire soient
                          utilisées pour traiter ma demande, conformément à la{' '}
                          <a
                            href="/mentions-legales"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-ember-400 hover:text-ember-300 underline underline-offset-2"
                          >
                            politique de confidentialité
                          </a>.
                        </span>
                      </label>
                      <AnimatePresence>
                        {errors.consent && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="flex items-center gap-1.5 mt-1.5 font-mono text-red-400 text-[10px]"
                          >
                            <AlertTriangle size={10} /> {errors.consent}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Error banner */}
                    <AnimatePresence>
                      {status === 'error' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-2 text-red-400 font-mono text-xs border border-red-500/30 bg-red-500/10 px-3 py-2"
                        >
                          <AlertTriangle size={12} /> Erreur de transmission. Réessaie ou contacte-nous directement.
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit */}
                    <motion.button
                      type="submit"
                      disabled={status === 'sending'}
                      className="w-full relative py-4 clip-diagonal overflow-hidden group disabled:opacity-50"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <span className="absolute inset-0 bg-ember-400 group-hover:bg-ember-300 transition-colors duration-300" />
                      <motion.span
                        className="absolute inset-0 bg-gradient-to-r from-ember-300 via-white/20 to-ember-300 opacity-0 group-hover:opacity-100"
                        animate={{ backgroundPosition: ['200% center', '-200% center'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        style={{ backgroundSize: '200% 100%' }}
                      />
                      <span className="relative font-display font-bold text-obsidian-900 text-sm tracking-widest uppercase flex items-center justify-center gap-2">
                        {status === 'sending' ? (
                          <>
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="w-4 h-4 border-2 border-obsidian-900 border-t-transparent rounded-full block"
                            />
                            Transmission en cours...
                          </>
                        ) : (
                          <>
                            <Send size={14} />
                            Envoyer la transmission
                          </>
                        )}
                      </span>
                    </motion.button>

                    <p className="text-center font-mono text-zinc-700 text-[9px] tracking-widest uppercase">
                      Ou directement : comiteetuinfo@cegepstfe.ca
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
