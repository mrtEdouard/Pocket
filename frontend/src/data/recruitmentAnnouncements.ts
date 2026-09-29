import type { RecruitmentAnnouncement } from "../types/recruitmentAnnouncement";

// Données temporaires dédiées au recrutement.
// Elles seront remplacées par l'API des annonces, sans toucher au modèle Activity.
export const recruitmentAnnouncements: RecruitmentAnnouncement[] = [
  {
    id: "1",
    authorName: "Thomas Rey",
    authorInitials: "TR",
    authorMeta: "Directeur · Saint-Étienne · 6 h",
    title: "Recherche SB — Vercors",
    description:
      "Du 4 au 16 août avec un groupe de 12 à 17 ans. Logement sur place.",
    imageUrl:
      "https://images.pexels.com/photos/17079655/pexels-photo-17079655.jpeg?auto=compress&cs=tinysrgb&w=1200",
    imageAlt: "Campement installé en montagne",
    role: "SB",
    ageGroup: "12–17 ans",
    dateRange: "4–16 août",
    location: "Vercors",
    stats: "12 intéressés · 3 réponses",
  },
  {
    id: "2",
    authorName: "Maëva Rolland",
    authorInitials: "MR",
    authorMeta: "Directrice · Marseille · hier",
    title: "Animateur·ice recherché·e — Cassis",
    description:
      "Équipe dynamique pour un groupe de 8 à 12 ans. Expérience mer appréciée.",
    imageUrl:
      "https://images.unsplash.com/photo-1657751471074-028e4e43e717?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Calanque près de Cassis",
    role: "Animateur·ice",
    ageGroup: "8–12 ans",
    dateRange: "8–21 août",
    location: "Cassis",
    stats: "8 intéressés · 2 réponses",
  },
  {
    id: "3",
    authorName: "Jules Perrin",
    authorInitials: "JP",
    authorMeta: "Directeur · Nîmes · 2 j",
    title: "Recherche AS — Cévennes",
    description:
      "Mission nature avec 36 enfants. PSC1 et expérience en suivi sanitaire demandés.",
    imageUrl:
      "https://images.pexels.com/photos/15840757/pexels-photo-15840757.jpeg?auto=compress&cs=tinysrgb&w=1200",
    imageAlt: "Tentes dans un paysage naturel",
    role: "AS",
    ageGroup: "9–13 ans",
    dateRange: "3–14 août",
    location: "Cévennes",
    stats: "6 intéressés · 1 réponse",
  },
];
