import { useState } from "react";
import { NavLink, type NavLinkRenderProps } from "react-router-dom";

import type { User } from "../types/user";
import { NotificationsModal } from "./NotificationsModal";

type MainPageId = "home" | "stays" | "activities" | "planning" | "profile";

interface NavigationItem {
  id: MainPageId;
  label: string;
  path: string;
}

interface AppLayoutProps {
  children: React.ReactNode;
  isCheckingSession: boolean;
  isLoggingOut: boolean;
  logoutError: string | null;
  onLogout: () => Promise<void>;
  user: User | null;
}

const navigationItems: NavigationItem[] = [
  { id: "home", label: "Accueil", path: "/" },
  { id: "stays", label: "Séjours", path: "/sejours" },
  { id: "activities", label: "Activités", path: "/activites" },
  { id: "planning", label: "Planning", path: "/planning" },
  { id: "profile", label: "Profil", path: "/profil" },
];

function NavigationIcon({ page }: { page: MainPageId }) {
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

function navClassName(_props: NavLinkRenderProps): string {
  return "nav-item";
}

export function AppLayout({
  children,
  isCheckingSession,
  isLoggingOut,
  logoutError,
  onLogout,
  user,
}: AppLayoutProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <NavLink className="wordmark" to="/" aria-label="Retour à l'accueil">
            <span className="wordmark-symbol" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="wordmark-copy">
              <span className="wordmark-main">Pocket</span>
              <span className="wordmark-detail">L'outil des équipes d'animation</span>
            </span>
          </NavLink>

          <nav className="primary-nav" aria-label="Navigation principale">
            {navigationItems.map((item) => (
              <NavLink
                className={navClassName}
                end={item.path === "/"}
                key={item.id}
                to={item.path}
              >
                <span className={`nav-icon nav-icon-${item.id}`}>
                  <NavigationIcon page={item.id} />
                </span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="header-account-actions">
            {user && (
              <button
                className="header-notifications"
                type="button"
                aria-haspopup="dialog"
                aria-expanded={isNotificationsOpen}
                aria-label="Ouvrir les notifications"
                onClick={() => setIsNotificationsOpen(true)}
                title="Notifications"
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6.5 9.5a5.5 5.5 0 0 1 11 0c0 6 2.5 6 2.5 7.5H4c0-1.5 2.5-1.5 2.5-7.5ZM10 20h4" />
                </svg>
              </button>
            )}



            {user && (
              <button
                className="header-logout"
                type="button"
                disabled={isLoggingOut}
                aria-label={isLoggingOut ? "Déconnexion en cours" : "Se déconnecter"}
                onClick={() => {
                  setIsNotificationsOpen(false);
                  void onLogout();
                }}
                title="Se déconnecter"
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10" />
                </svg>
              </button>
            )}
          </div>
        </div>
        {logoutError && <p className="header-session-error" role="alert">{logoutError}</p>}
      </header>

      {user && isNotificationsOpen && (
        <NotificationsModal onClose={() => setIsNotificationsOpen(false)} />
      )}

      <main className="app-content">{children}</main>
    </div>
  );
}
