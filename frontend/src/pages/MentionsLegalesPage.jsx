import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ScrollText, ShieldCheck, Mail, Cookie } from 'lucide-react';
import { pageTransition, staggerContainer, fadeInUp } from '../utils/animations.js';

function Section({ icon: Icon, title, children }) {
  return (
    <motion.section variants={fadeInUp} className="mb-12">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 clip-hex flex items-center justify-center bg-ember-400/10 border border-ember-400/30 flex-shrink-0">
          <Icon size={15} className="text-ember-400" />
        </div>
        <h2 className="font-display text-xl md:text-2xl font-bold text-white uppercase tracking-wide">
          {title}
        </h2>
      </div>
      <div className="font-body text-zinc-400 text-sm leading-relaxed space-y-3 pl-0 md:pl-12">
        {children}
      </div>
    </motion.section>
  );
}

export default function MentionsLegalesPage() {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen pt-28 md:pt-36 pb-24 px-4 sm:px-6"
    >
      <div className="max-w-3xl mx-auto">
        {/* ── Draft banner ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 border border-amber-500/30 bg-amber-500/5 px-4 py-3 mb-10"
        >
          <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
          <p className="font-mono text-amber-400 text-[11px] tracking-wide leading-relaxed">
            Modèle générique — à faire valider par le Cégep de Saint-Félicien (responsable de
            la protection des renseignements personnels) avant publication officielle, conformément à la Loi 25.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-14"
        >
          <p className="font-mono text-ember-500 text-xs tracking-[0.5em] uppercase mb-4">
            [ Cadre légal ]
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-black uppercase leading-none text-white mb-4">
            Mentions légales
          </h1>
          <p className="font-body text-zinc-500 max-w-xl text-sm leading-relaxed">
            Informations sur l'éditeur du site et sur le traitement de tes renseignements
            personnels dans le cadre de LAN Gaming 2026.
          </p>
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          <Section icon={ScrollText} title="Éditeur du site">
            <p>
              Ce site est édité par le Comité étudiant informatique du Cégep de Saint-Félicien
              dans le cadre de l'organisation de l'événement LAN Gaming 2026, sous la coresponsabilité
              de Gabriel Hervé et Jovan Knezevic.
            </p>
            <p>
              Adresse : 525, boul. Hamel, Saint-Félicien, QC G8K 2R8<br />
              Courriel : <a href="mailto:comiteetuinfo@cegepstfe.ca" className="text-ember-400 hover:text-ember-300">comiteetuinfo@cegepstfe.ca</a><br />
              Téléphone : 581 704-1221
            </p>
            <p>
              Le contenu du site (textes, visuels, identité graphique) est la propriété du comité
              organisateur, à l'exception des modèles 3D utilisés dans les scènes du site, dont les
              licences et attributions sont détaillées sur la page <a href="/credits" className="text-ember-400 hover:text-ember-300">Crédits</a>.
            </p>
          </Section>

          <Section icon={ShieldCheck} title="Données collectées et utilisées">
            <p>Selon les formulaires que tu utilises sur ce site, nous recueillons :</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-zinc-300">Formulaire de contact</strong> — nom, courriel, sujet, message.</li>
              <li><strong className="text-zinc-300">Boutique / Ticket d'Or</strong> — nom, courriel, articles ou quantité commandés.</li>
              <li><strong className="text-zinc-300">Inscription à un tournoi</strong> — nom d'équipe, membres, courriel de contact.</li>
              <li><strong className="text-zinc-300">Connexion avec Google ou Microsoft</strong> — nom, courriel et photo de profil transmis par le fournisseur d'identité.</li>
            </ul>
            <p>
              Ces renseignements servent uniquement à répondre à ta demande, traiter ta commande ou
              ton inscription, et gérer l'accès aux fonctionnalités réservées (ex. tableau de bord admin).
              Ils sont transmis par courriel à l'équipe organisatrice
              (<span className="text-zinc-300">comiteetuinfo@cegepstfe.ca</span>) et ne sont pas revendus
              ni partagés avec un tiers à des fins commerciales. Ils sont conservés le temps nécessaire
              à l'organisation de l'événement, puis supprimés.
            </p>
          </Section>

          <Section icon={Cookie} title="Cookies">
            <p>
              Le site utilise un seul cookie technique (<code className="text-zinc-300 font-mono text-xs">auth_token</code>),
              nécessaire au maintien de ta session lorsque tu te connectes. Ce cookie est protégé
              (HttpOnly, expire après 7 jours) et n'est pas utilisé à des fins de suivi publicitaire.
              Aucun cookie de mesure d'audience tiers n'est déposé.
            </p>
          </Section>

          <Section icon={Mail} title="Tes droits">
            <p>
              Conformément à la Loi sur la protection des renseignements personnels dans le secteur
              privé (Loi 25, Québec), tu peux demander l'accès, la rectification ou la suppression des
              renseignements que nous détenons à ton sujet en écrivant à
              {' '}<a href="mailto:comiteetuinfo@cegepstfe.ca" className="text-ember-400 hover:text-ember-300">comiteetuinfo@cegepstfe.ca</a>.
            </p>
          </Section>
        </motion.div>
      </div>
    </motion.div>
  );
}
