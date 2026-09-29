export interface HomePost {
  author: string;
  body: string;
  category: string;
  facts: string[];
  id: number;
  image: string;
  imageAlt: string;
  initials: string;
  meta: string;
  stats: string;
  title: string;
  tone: "activity" | "recruitment" | "stay";
}

export const homePosts: HomePost[] = [
  {
    id: 1,
    author: "Lina Morel",
    initials: "LM",
    meta: "Animatrice · Lyon · 4 h",
    category: "Activité",
    tone: "activity",
    title: "L'affaire des couleurs",
    image:
      "https://images.pexels.com/photos/8033799/pexels-photo-8033799.jpeg?auto=compress&cs=tinysrgb&w=1200",
    imageAlt: "Activité de groupe en extérieur",
    body: "Testé hier avec 24 enfants. Prévoir plus de ficelle.",
    facts: ["8–10 ans", "1 h", "Extérieur"],
    stats: "28 favoris · 5 commentaires",
  },
  {
    id: 2,
    author: "Thomas Rey",
    initials: "TR",
    meta: "Directeur · Saint-Étienne · 6 h",
    category: "Annonce",
    tone: "recruitment",
    title: "Recherche SB — Vercors",
    image:
      "https://images.pexels.com/photos/17079655/pexels-photo-17079655.jpeg?auto=compress&cs=tinysrgb&w=1200",
    imageAlt: "Campement installé en montagne",
    body: "Du 4 au 16 août avec un groupe de 12 à 17 ans. Logement sur place.",
    facts: ["12–17 ans", "4–16 août", "Vercors"],
    stats: "12 intéressés · 3 réponses",
  },
  {
    id: 3,
    author: "Élise Duarte",
    initials: "ED",
    meta: "Directrice · Marseille · hier",
    category: "Séjour",
    tone: "stay",
    title: "Cassis · départ dans 7 jours",
    image:
      "https://images.unsplash.com/photo-1657751471074-028e4e43e717?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Calanque près de Cassis",
    body: "L'équipe est complète. Il reste deux veillées à caler.",
    facts: ["8–12 ans", "8–21 août", "8 membres"],
    stats: "34 suivis · 6 idées",
  },
];
