import { useEffect, useState, type FormEvent } from "react";

import { getCurrentUser, login, logout, register } from "./api/auth";
import type { User } from "./types/user";

type PageId = "home" | "stays" | "activities" | "planning" | "profile";
type AuthMode = "login" | "register";

interface NavigationItem {
  id: PageId;
  label: string;
}

const navigationItems: NavigationItem[] = [
  { id: "home", label: "Accueil" },
  { id: "stays", label: "Séjours" },
  { id: "activities", label: "Activités" },
  { id: "planning", label: "Planning" },
  { id: "profile", label: "Profil" },
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
    return null;
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
