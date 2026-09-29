import { useEffect, useState, type FormEvent } from "react";

import { getCurrentUser, login, logout, register } from "./api/auth";
import type { User } from "./types/user";

type PageId = "home" | "stays" | "activities" | "planning" | "profile";
type AuthMode = "login" | "register";

interface NavigationItem {
  id: PageId;
  label: string;
}

interface HomePost {
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
  target: PageId;
  title: string;
  tone: "activity" | "recruitment" | "stay";
}

interface DemoPerson {
  name: string;
  picture: string;
}

interface RandomUserResponse {
  results: Array<{
    name: {
      first: string;
      last: string;
    };
    picture: {
      large: string;
    };
  }>;
}

const navigationItems: NavigationItem[] = [
  { id: "home", label: "Accueil" },
  { id: "stays", label: "Séjours" },
  { id: "activities", label: "Activités" },
  { id: "planning", label: "Planning" },
  { id: "profile", label: "Profil" },
];

const homePosts: HomePost[] = [
  {
    id: 1,
    author: "Lina Morel",
    initials: "LM",
    meta: "Animatrice · Lyon · 4 h",
    category: "Activité",
    tone: "activity",
    title: "L'affaire des couleurs",
    image: "https://images.pexels.com/photos/8033799/pexels-photo-8033799.jpeg?auto=compress&cs=tinysrgb&w=1200",
    imageAlt: "Activité de groupe en extérieur",
    body: "Testé hier avec 24 enfants. Prévoir plus de ficelle.",
    facts: ["8–10 ans", "1 h", "Extérieur"],
    stats: "28 favoris · 5 commentaires",
    target: "activities",
  },
  {
    id: 2,
    author: "Thomas Rey",
    initials: "TR",
    meta: "Directeur · Saint-Étienne · 6 h",
    category: "Annonce",
    tone: "recruitment",
    title: "Recherche SB — Vercors",
    image: "https://images.pexels.com/photos/17079655/pexels-photo-17079655.jpeg?auto=compress&cs=tinysrgb&w=1200",
    imageAlt: "Campement installé en montagne",
    body: "Du 4 au 16 août avec un groupe de 12 à 17 ans. Logement sur place.",
    facts: ["12–17 ans", "4–16 août", "Vercors"],
    stats: "12 intéressés · 3 réponses",
    target: "stays",
  },
  {
    id: 3,
    author: "Élise Duarte",
    initials: "ED",
    meta: "Directrice · Marseille · hier",
    category: "Séjour",
    tone: "stay",
    title: "Cassis · départ dans 7 jours",
    image: "https://images.unsplash.com/photo-1657751471074-028e4e43e717?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Calanque près de Cassis",
    body: "L'équipe est complète. Il reste deux veillées à caler.",
    facts: ["8–12 ans", "8–21 août", "8 membres"],
    stats: "34 suivis · 6 idées",
    target: "stays",
  },
];

function NavigationIcon({ page }: { page: PageId }) {
  const commonProps = {
    viewBox: "0 0 32 32",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 2.2,
    "aria-hidden": true,
  };

  if (page === "home") {
    return (
      <svg {...commonProps}>
        <circle cx="16" cy="16" r="5" />
        <path d="M16 3v5M16 24v5M3 16h5M24 16h5M6.8 6.8l3.5 3.5M21.7 21.7l3.5 3.5M25.2 6.8l-3.5 3.5M10.3 21.7l-3.5 3.5" />
      </svg>
    );
  }

  if (page === "stays") {
    return (
      <svg {...commonProps}>
        <path d="M5 26 16 7l11 19H5Z" />
        <path d="m16 7 2.5 19M16 7l-2.5 19M12.5 26l3.5-6 3.5 6" />
      </svg>
    );
  }

  if (page === "activities") {
    return (
      <svg {...commonProps}>
        <path d="m16 4 3.1 8.9L28 16l-8.9 3.1L16 28l-3.1-8.9L4 16l8.9-3.1L16 4Z" />
      </svg>
    );
  }

  if (page === "planning") {
    return (
      <svg {...commonProps}>
        <path d="M6 8h20v18H6zM10 4v7M22 4v7M6 13h20" />
        <path d="m11 19 3 3 7-7" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <circle cx="16" cy="11" r="5" />
      <path d="M6 28c.8-6 4.2-9 10-9s9.2 3 10 9" />
      <path d="M13.5 11h.1M18.5 11h.1M14 14c1.3 1 2.7 1 4 0" />
    </svg>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState<PageId>("home");
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [demoPeople, setDemoPeople] = useState<DemoPerson[]>([]);

  useEffect(() => {
    let effectIsActive = true;

    async function checkSession(): Promise<void> {
      try {
        const currentUser = await getCurrentUser();

        if (effectIsActive) {
          setUser(currentUser);
        }
      } catch (caughtError) {
        if (effectIsActive) {
          setAuthError(
            caughtError instanceof Error
              ? caughtError.message
              : "Impossible de vérifier la session.",
          );
        }
      } finally {
        if (effectIsActive) {
          setIsCheckingSession(false);
        }
      }
    }

    void checkSession();

    return () => {
      effectIsActive = false;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDemoPeople(): Promise<void> {
      try {
        const response = await fetch(
          "https://randomuser.me/api/1.4/?results=6&nat=fr&inc=name,picture&seed=pocket-home-v1&noinfo",
          { signal: controller.signal },
        );

        if (!response.ok) return;

        const data = (await response.json()) as RandomUserResponse;
        setDemoPeople(
          data.results.map((person) => ({
            name: `${person.name.first} ${person.name.last}`,
            picture: person.picture.large,
          })),
        );
      } catch {
        if (!controller.signal.aborted) setDemoPeople([]);
      }
    }

    void loadDemoPeople();

    return () => controller.abort();
  }, []);

  async function handleAuthSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setAuthError(null);
    setIsSubmittingAuth(true);

    try {
      const authenticatedUser =
        authMode === "register"
          ? await register({ name, email, password })
          : await login({ email, password });

      setUser(authenticatedUser);
      setPassword("");
    } catch (caughtError) {
      setAuthError(
        caughtError instanceof Error
          ? caughtError.message
          : "L'authentification a échoué.",
      );
    } finally {
      setIsSubmittingAuth(false);
    }
  }

  async function handleLogout(): Promise<void> {
    setAuthError(null);
    setIsSubmittingAuth(true);

    try {
      await logout();
      setUser(null);
      setPassword("");
    } catch (caughtError) {
      setAuthError(
        caughtError instanceof Error
          ? caughtError.message
          : "La déconnexion a échoué.",
      );
    } finally {
      setIsSubmittingAuth(false);
    }
  }

  function changeAuthMode(mode: AuthMode): void {
    setAuthMode(mode);
    setAuthError(null);
    setPassword("");
  }

  function renderHome() {
    return (
      <section className="community-home">
        <div className="community-layout">
          <section className="community-feed" aria-labelledby="feed-title">
            <header className="feed-toolbar">
              <div>
                <h1 id="feed-title">Pour vous</h1>
                <p>Publications récentes</p>
              </div>
              {!user && (
                <button type="button" onClick={() => setActivePage("profile")}>
                  Participer
                </button>
              )}
            </header>

            {homePosts.map((post, index) => (
              <article className="feed-entry" key={post.id}>
                <header className="feed-entry-header">
                  <div className={`profile-avatar avatar-${post.tone}`} aria-hidden="true">
                    {demoPeople[index] ? (
                      <img src={demoPeople[index].picture} alt="" />
                    ) : (
                      post.initials
                    )}
                  </div>
                  <div className="feed-author">
                    <strong>{demoPeople[index]?.name ?? post.author}</strong>
                    <span>{post.meta}</span>
                  </div>
                  <span className="post-category">{post.category}</span>
                </header>

                <img
                  className="post-image"
                  src={post.image}
                  alt={post.imageAlt}
                  loading={index === 0 ? "eager" : "lazy"}
                />

                <div className="feed-entry-content">
                  <h2>{post.title}</h2>
                  <p>{post.body}</p>
                  <ul className="post-facts" aria-label="Informations principales">
                    {post.facts.map((fact) => (
                      <li key={fact}>{fact}</li>
                    ))}
                  </ul>
                </div>

                <footer className="feed-entry-footer">
                  <span>{post.stats}</span>
                  <button type="button" onClick={() => setActivePage(post.target)}>
                    Voir{post.tone === "activity" ? " l'activité" : ""}
                  </button>
                </footer>
              </article>
            ))}
          </section>

          <aside className="community-sidebar" aria-label="À découvrir dans Pocket">
            <section className="sidebar-section">
              <header>
                <h2>Ils recrutent</h2>
                <p>3 dernières offres · 1 par organisme</p>
              </header>
              <ul className="stay-list recruiting-list">
                <li>
                  <img src="https://images.pexels.com/photos/17079655/pexels-photo-17079655.jpeg?auto=compress&cs=tinysrgb&w=300" alt="Campement en montagne" loading="lazy" />
                  <div><strong>Vercors</strong><span>4–16 août · SB</span></div>
                </li>
                <li>
                  <img src="https://images.unsplash.com/photo-1657751471074-028e4e43e717?auto=format&fit=crop&w=300&q=75" alt="Calanque près de Cassis" loading="lazy" />
                  <div><strong>Colo Cassis</strong><span>8–21 août · Animateur·ice</span></div>
                </li>
                <li>
                  <img src="https://images.pexels.com/photos/15840757/pexels-photo-15840757.jpeg?auto=compress&cs=tinysrgb&w=300" alt="Tentes dans un paysage naturel" loading="lazy" />
                  <div><strong>Nature et créations</strong><span>3–14 août · AS</span></div>
                </li>
              </ul>
              <button className="sidebar-action" type="button" onClick={() => setActivePage("stays")}>
                Voir les séjours
              </button>
            </section>

            <section className="sidebar-section">
              <header>
                <h2>Nouveaux profils</h2>
              </header>
              <ul className="member-list">
                <li><span className="member-initials">{demoPeople[3] ? <img src={demoPeople[3].picture} alt="" /> : "MB"}</span><div><strong>{demoPeople[3]?.name ?? "Manon"}</strong><span>Animatrice · Toulouse</span></div><small>BAFA</small></li>
                <li><span className="member-initials">{demoPeople[4] ? <img src={demoPeople[4].picture} alt="" /> : "YK"}</span><div><strong>{demoPeople[4]?.name ?? "Yanis"}</strong><span>Animateur · Lille</span></div><small>SB</small></li>
                <li><span className="member-initials">{demoPeople[5] ? <img src={demoPeople[5].picture} alt="" /> : "CR"}</span><div><strong>{demoPeople[5]?.name ?? "Chloé"}</strong><span>Directrice · Rennes</span></div><small>BAFD</small></li>
              </ul>
              <button className="sidebar-action" type="button" onClick={() => setActivePage("profile")}>
                Rejoindre la communauté
              </button>
            </section>
          </aside>
        </div>
      </section>
    );
  }

  function renderStays() {
    return null;
  }

  function renderActivities() {
    return null;
  }

  function renderPlanning() {
    return null;
  }

  function renderProfile() {
    return (
      <>
        {isCheckingSession ? (
          <p className="session-check" role="status">
            Vérification de la session…
          </p>
        ) : user ? (
          <section className="profile-sheet" aria-labelledby="profile-name">
            <div className="profile-initial" aria-hidden="true">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="profile-identity">
              <p>Compte actif</p>
              <h2 id="profile-name">{user.name}</h2>
              <a href={`mailto:${user.email}`}>{user.email}</a>
            </div>
            <button
              className="text-action"
              type="button"
              disabled={isSubmittingAuth}
              onClick={() => void handleLogout()}
            >
              {isSubmittingAuth ? "Déconnexion…" : "Se déconnecter"}
            </button>
            {authError && (
              <p className="form-error profile-error" role="alert">
                {authError}
              </p>
            )}
          </section>
        ) : (
          <section className="auth-workbench" aria-labelledby="auth-title">
            <div className="auth-copy">
              <p className="auth-stamp">Bienvenue dans l'équipe</p>
              <h2 id="auth-title">
                {authMode === "login" ? "On reprend où on en était ?" : "Rejoindre Pocket"}
              </h2>
              <p>
                {authMode === "login"
                  ? "Connectez-vous pour retrouver les projets de votre équipe."
                  : "Créez votre espace pour préparer, partager et faire vivre vos séjours."}
              </p>
            </div>

            <div className="auth-zone">
              <div className="auth-tabs" aria-label="Choisir une action">
                <button
                  type="button"
                  aria-pressed={authMode === "login"}
                  onClick={() => changeAuthMode("login")}
                >
                  Connexion
                </button>
                <button
                  type="button"
                  aria-pressed={authMode === "register"}
                  onClick={() => changeAuthMode("register")}
                >
                  Inscription
                </button>
              </div>

              <form className="auth-form" onSubmit={handleAuthSubmit}>
                {authMode === "register" && (
                  <label>
                    <span>Pseudo</span>
                    <input
                      type="text"
                      name="name"
                      autoComplete="name"
                      minLength={2}
                      maxLength={100}
                      required
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                    />
                  </label>
                )}

                <label>
                  <span>Adresse email</span>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>

                <label>
                  <span>Mot de passe</span>
                  <input
                    type="password"
                    name="password"
                    autoComplete={
                      authMode === "register" ? "new-password" : "current-password"
                    }
                    minLength={authMode === "register" ? 12 : 1}
                    maxLength={128}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </label>

                <button
                  className="button button-primary auth-submit"
                  type="submit"
                  disabled={isSubmittingAuth}
                >
                  {isSubmittingAuth
                    ? "Envoi en cours…"
                    : authMode === "register"
                      ? "Créer le compte"
                      : "Entrer dans Pocket"}
                </button>
              </form>

              {authError && (
                <p className="form-error" role="alert">
                  {authError}
                </p>
              )}
            </div>
          </section>
        )}
      </>
    );
  }

  function renderActivePage() {
    if (activePage === "home") return renderHome();
    if (activePage === "stays") return renderStays();
    if (activePage === "activities") return renderActivities();
    if (activePage === "planning") return renderPlanning();
    return renderProfile();
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <button
            className="wordmark"
            type="button"
            onClick={() => setActivePage("home")}
            aria-label="Retour à l'accueil"
          >
            <span className="wordmark-symbol" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="wordmark-copy">
              <span className="wordmark-main">Pocket</span>
              <span className="wordmark-detail">L'outil des équipes d'animation</span>
            </span>
          </button>

          <nav className="primary-nav" aria-label="Navigation principale">
            {navigationItems.map((item) => {
              const isActive = activePage === item.id;

              return (
                <button
                  className="nav-item"
                  type="button"
                  key={item.id}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setActivePage(item.id)}
                >
                  <span className={`nav-icon nav-icon-${item.id}`}>
                    <NavigationIcon page={item.id} />
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <button
            className="session-link"
            type="button"
            onClick={() => setActivePage("profile")}
          >
            <span className={user ? "session-dot is-online" : "session-dot"} />
            {isCheckingSession ? "Session…" : user?.name ?? "Connexion"}
          </button>
        </div>
      </header>

      <main className="app-content">{renderActivePage()}</main>
    </div>
  );
}
