import { useState, type FormEvent } from "react";

import { login, logout, register } from "../api/auth";
import type { User } from "../types/user";

type AuthMode = "login" | "register";

interface ProfilePageProps {
  isCheckingSession: boolean;
  onUserChange: (user: User | null) => void;
  user: User | null;
}

export function ProfilePage({
  isCheckingSession,
  onUserChange,
  user,
}: ProfilePageProps) {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function changeAuthMode(mode: AuthMode): void {
    setAuthMode(mode);
    setError(null);
    setPassword("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const authenticatedUser = authMode === "register"
        ? await register({ name, email, password })
        : await login({ email, password });

      onUserChange(authenticatedUser);
      setPassword("");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "L'authentification a échoué.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout(): Promise<void> {
    setError(null);
    setIsSubmitting(true);

    try {
      await logout();
      onUserChange(null);
      setPassword("");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "La déconnexion a échoué.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isCheckingSession) {
    return <p className="session-check" role="status">Vérification de la session…</p>;
  }

  if (user) {
    return (
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
          disabled={isSubmitting}
          onClick={() => void handleLogout()}
        >
          {isSubmitting ? "Déconnexion…" : "Se déconnecter"}
        </button>
        {error && <p className="form-error profile-error" role="alert">{error}</p>}
      </section>
    );
  }

  return (
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

        <form className="auth-form" onSubmit={handleSubmit}>
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
              autoComplete={authMode === "register" ? "new-password" : "current-password"}
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
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Envoi en cours…"
              : authMode === "register"
                ? "Créer le compte"
                : "Entrer dans Pocket"}
          </button>
        </form>

        {error && <p className="form-error" role="alert">{error}</p>}
      </div>
    </section>
  );
}
