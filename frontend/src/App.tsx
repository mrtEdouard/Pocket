import { useEffect, useState, type FormEvent } from "react";

import {
  getMyActivities,
  getPublicActivities,
  saveActivity,
} from "./api/activities";
import { getCurrentUser, login, logout, register } from "./api/auth";
import { getPublicProfile, getRecentUsers } from "./api/users";
import { ActivityModal } from "./components/ActivityModal";
import { CommentsSection } from "./components/CommentsSection";
import type { Activity } from "./types/activity";
import type { PublicUser, User } from "./types/user";

type MainPageId = "home" | "stays" | "activities" | "planning" | "profile";
type PageId =
  | MainPageId
  | "activityDetail"
  | "announcementDetail"
  | "publicProfile";
type AuthMode = "login" | "register";

interface NavigationItem {
  id: MainPageId;
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

const locationLabels: Record<Activity["locationType"], string> = {
  indoor: "Intérieur",
  outdoor: "Extérieur",
  both: "Intérieur / extérieur",
};

const energyLabels: Record<Activity["energyLevel"], string> = {
  low: "Calme",
  medium: "Modérée",
  high: "Dynamique",
};

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
  },
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
  const [publicActivities, setPublicActivities] = useState<Activity[]>([]);
  const [myActivities, setMyActivities] = useState<Activity[]>([]);
  const [isLoadingMyActivities, setIsLoadingMyActivities] = useState(false);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [recentUsers, setRecentUsers] = useState<PublicUser[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<HomePost | null>(
    null,
  );
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<{
    profile: PublicUser;
    activities: Activity[];
  } | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [savingActivityIds, setSavingActivityIds] = useState<string[]>([]);

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

  useEffect(() => {
    const controller = new AbortController();

    getRecentUsers(controller.signal)
      .then(setRecentUsers)
      .catch(() => {
        if (!controller.signal.aborted) setRecentUsers([]);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selectedProfileId) return;

    const controller = new AbortController();
    setSelectedProfile(null);
    setProfileError(null);
    setIsLoadingProfile(true);

    getPublicProfile(selectedProfileId, controller.signal)
      .then(setSelectedProfile)
      .catch((caughtError: unknown) => {
        if (!controller.signal.aborted) {
          setProfileError(
            caughtError instanceof Error
              ? caughtError.message
              : "Impossible de charger ce profil.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingProfile(false);
      });

    return () => controller.abort();
  }, [selectedProfileId]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPublicActivities(): Promise<void> {
      try {
        const activities = await getPublicActivities(controller.signal);
        setPublicActivities(activities);
      } catch (caughtError) {
        if (!controller.signal.aborted) {
          setActivitiesError(
            caughtError instanceof Error
              ? caughtError.message
              : "Impossible de charger les activités.",
          );
        }
      }
    }

    void loadPublicActivities();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (isCheckingSession) return;

    if (!user) {
      setMyActivities([]);
      setIsActivityModalOpen(false);
      setEditingActivity(null);
      return;
    }

    const controller = new AbortController();
    setIsLoadingMyActivities(true);
    setActivitiesError(null);

    async function loadMyActivities(): Promise<void> {
      try {
        const activities = await getMyActivities(controller.signal);
        setMyActivities(activities);
      } catch (caughtError) {
        if (!controller.signal.aborted) {
          setActivitiesError(
            caughtError instanceof Error
              ? caughtError.message
              : "Impossible d’ouvrir ta valise à activités.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setIsLoadingMyActivities(false);
      }
    }

    void loadMyActivities();

    return () => controller.abort();
  }, [isCheckingSession, user]);

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

      if (authMode === "register") {
        setRecentUsers((currentUsers) => [
          {
            id: authenticatedUser.id,
            name: authenticatedUser.name,
            createdAt: authenticatedUser.createdAt,
            activityCount: 0,
          },
          ...currentUsers.filter(
            (currentUser) => currentUser.id !== authenticatedUser.id,
          ),
        ].slice(0, 3));
      }
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

  function openActivity(activity: Activity): void {
    setSelectedActivity(activity);
    setActivePage("activityDetail");
  }

  function openAnnouncement(post: HomePost): void {
    setSelectedAnnouncement(post);
    setActivePage("announcementDetail");
  }

  function openPublicProfile(userId: string): void {
    setSelectedProfileId(userId);
    setActivePage("publicProfile");
  }

  async function addActivityToSuitcase(activity: Activity): Promise<void> {
    if (!user) {
      setActivePage("profile");
      return;
    }

    if (
      myActivities.some((savedActivity) => savedActivity.id === activity.id) ||
      savingActivityIds.includes(activity.id)
    ) {
      return;
    }

    setActivitiesError(null);
    setSavingActivityIds((ids) => [...ids, activity.id]);

    try {
      const result = await saveActivity(activity.id);
      setMyActivities((currentActivities) =>
        currentActivities.some(
          (currentActivity) => currentActivity.id === result.activity.id,
        )
          ? currentActivities
          : [result.activity, ...currentActivities],
      );
    } catch (caughtError) {
      setActivitiesError(
        caughtError instanceof Error
          ? caughtError.message
          : "Impossible d’ajouter cette activité à ta valise.",
      );
    } finally {
      setSavingActivityIds((ids) =>
        ids.filter((activityId) => activityId !== activity.id),
      );
    }
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

            {publicActivities.map((activity) => (
              <article className="feed-entry" key={`activity-${activity.id}`}>
                <header className="feed-entry-header">
                  <button
                    className="profile-avatar avatar-activity"
                    type="button"
                    aria-label={`Voir le profil de ${activity.ownerName}`}
                    onClick={() => openPublicProfile(activity.ownerId)}
                  >
                    {activity.ownerName.charAt(0).toUpperCase()}
                  </button>
                  <div className="feed-author">
                    <button
                      type="button"
                      onClick={() => openPublicProfile(activity.ownerId)}
                    >
                      {activity.ownerName}
                    </button>
                    <span>vient d’ajouter une activité</span>
                  </div>
                  <span className="post-category">Activité</span>
                </header>

                {activity.imageUrl ? (
                  <img
                    className="post-image"
                    src={activity.imageUrl}
                    alt={`Illustration de ${activity.title}`}
                    loading="lazy"
                  />
                ) : (
                  <div
                    className={`activity-feed-cover energy-${activity.energyLevel}`}
                    aria-hidden="true"
                  >
                    <span>{locationLabels[activity.locationType]}</span>
                    <svg viewBox="0 0 120 72" fill="none">
                      <path d="M17 57 43 25l18 21 14-17 28 28H17Z" />
                      <circle cx="87" cy="17" r="8" />
                      <path d="M11 62h98" />
                    </svg>
                    <strong>{activity.durationMinutes} min</strong>
                  </div>
                )}

                <div className="feed-entry-content">
                  <h2>{activity.title}</h2>
                  <p>{activity.description}</p>
                  <ul className="post-facts" aria-label="Informations principales">
                    <li>
                      {activity.minAge}–{activity.maxAge} ans
                    </li>
                    <li>
                      {activity.minChildren}–{activity.maxChildren} enfants
                    </li>
                    <li>{energyLabels[activity.energyLevel]}</li>
                  </ul>
                </div>

                <footer className="feed-entry-footer">
                  <span>Nouvelle activité publique</span>
                  <div className="feed-entry-actions">
                    <button
                      type="button"
                      disabled={
                        myActivities.some(
                          (savedActivity) => savedActivity.id === activity.id,
                        ) || savingActivityIds.includes(activity.id)
                      }
                      onClick={() => void addActivityToSuitcase(activity)}
                    >
                      {myActivities.some(
                        (savedActivity) => savedActivity.id === activity.id,
                      )
                        ? "Dans ma valise"
                        : savingActivityIds.includes(activity.id)
                          ? "Ajout…"
                          : "+ Valise"}
                    </button>
                    <button type="button" onClick={() => openActivity(activity)}>
                      Voir la fiche
                    </button>
                  </div>
                </footer>
              </article>
            ))}

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
                  <button type="button" onClick={() => openAnnouncement(post)}>
                    Voir la publication
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
                {recentUsers.map((recentUser) => (
                  <li key={recentUser.id}>
                    <button
                      className="member-initials"
                      type="button"
                      aria-label={`Voir le profil de ${recentUser.name}`}
                      onClick={() => openPublicProfile(recentUser.id)}
                    >
                      {recentUser.name.charAt(0).toUpperCase()}
                    </button>
                    <div>
                      <button
                        className="member-name"
                        type="button"
                        onClick={() => openPublicProfile(recentUser.id)}
                      >
                        {recentUser.name}
                      </button>
                      <span>Vient de rejoindre Pocket</span>
                    </div>
                    <small>
                      {recentUser.activityCount} activité
                      {recentUser.activityCount > 1 ? "s" : ""}
                    </small>
                  </li>
                ))}
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
    if (isCheckingSession) {
      return (
        <p className="session-check" role="status">
          Vérification de la session…
        </p>
      );
    }

    if (!user) {
      return (
        <section className="activity-access" aria-labelledby="activity-access-title">
          <p>Création d’activité</p>
          <h2 id="activity-access-title">Connecte-toi pour ajouter une activité.</h2>
          <button
            className="button button-primary"
            type="button"
            onClick={() => setActivePage("profile")}
          >
            Aller à la connexion
          </button>
        </section>
      );
    }

    return (
      <section className="activity-suitcase" aria-label="Ma valise à activités">
        <header className="suitcase-toolbar">
          <div className="suitcase-name">
            <span className="suitcase-handle" aria-hidden="true" />
            <div>
              <strong>Ma valise</strong>
              <span>
                {myActivities.length} activité{myActivities.length > 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <button
            className="add-activity-button"
            type="button"
            aria-label="Ajouter une activité"
            onClick={() => {
              setEditingActivity(null);
              setIsActivityModalOpen(true);
            }}
          >
            +
          </button>
        </header>

        {activitiesError && (
          <p className="suitcase-message is-error" role="alert">
            {activitiesError}
          </p>
        )}

        {isLoadingMyActivities ? (
          <p className="suitcase-message" role="status">
            Ouverture de la valise…
          </p>
        ) : myActivities.length === 0 ? (
          <div className="empty-suitcase">
            <span aria-hidden="true">+</span>
            <p>Ta première fiche d’activité viendra se ranger ici.</p>
          </div>
        ) : (
          <ul className="activity-card-grid">
            {myActivities.map((activity) => (
              <li
                className={`activity-card energy-${activity.energyLevel}`}
                key={activity.id}
              >
                <header>
                  <div>
                    <span>{activity.isPublic ? "Publique" : "Privée"}</span>
                    <small>{energyLabels[activity.energyLevel]}</small>
                  </div>
                  {activity.isOwned && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingActivity(activity);
                        setIsActivityModalOpen(true);
                      }}
                    >
                      Modifier
                    </button>
                  )}
                </header>
                {activity.imageUrl && (
                  <img
                    className="activity-card-image"
                    src={activity.imageUrl}
                    alt=""
                    loading="lazy"
                  />
                )}
                <h2>{activity.title}</h2>
                <p>{activity.description}</p>
                <footer>
                  <div>
                    <span>
                      {activity.minAge}–{activity.maxAge} ans
                    </span>
                    <span>{activity.durationMinutes} min</span>
                    <span>{locationLabels[activity.locationType]}</span>
                  </div>
                  <button type="button" onClick={() => openActivity(activity)}>
                    Voir
                  </button>
                </footer>
              </li>
            ))}
          </ul>
        )}

        {isActivityModalOpen && (
          <ActivityModal
            activity={editingActivity}
            onClose={() => {
              setIsActivityModalOpen(false);
              setEditingActivity(null);
            }}
            onSaved={(savedActivity) => {
              const wasCreating = editingActivity === null;

              setMyActivities((currentActivities) => {
                const alreadyExists = currentActivities.some(
                  (activity) => activity.id === savedActivity.id,
                );

                return alreadyExists
                  ? currentActivities.map((activity) =>
                      activity.id === savedActivity.id ? savedActivity : activity,
                    )
                  : [savedActivity, ...currentActivities];
              });

              setPublicActivities((currentActivities) => {
                const withoutSavedActivity = currentActivities.filter(
                  (activity) => activity.id !== savedActivity.id,
                );

                return savedActivity.isPublic
                  ? [savedActivity, ...withoutSavedActivity]
                  : withoutSavedActivity;
              });

              setIsActivityModalOpen(false);
              setEditingActivity(null);

              if (wasCreating && savedActivity.isPublic) {
                setActivePage("home");
              }
            }}
          />
        )}
      </section>
    );
  }

  function renderActivityDetail() {
    if (!selectedActivity) return null;

    const activityIsSaved = myActivities.some(
      (activity) => activity.id === selectedActivity.id,
    );
    const activityIsSaving = savingActivityIds.includes(selectedActivity.id);

    return (
      <section className="detail-page">
        <button className="detail-back" type="button" onClick={() => setActivePage("home")}>
          ← Retour au fil
        </button>

        <article className="detail-card">
          <header className="detail-author">
            <button
              className="profile-avatar avatar-activity"
              type="button"
              onClick={() => openPublicProfile(selectedActivity.ownerId)}
            >
              {selectedActivity.ownerName.charAt(0).toUpperCase()}
            </button>
            <div>
              <button
                type="button"
                onClick={() => openPublicProfile(selectedActivity.ownerId)}
              >
                {selectedActivity.ownerName}
              </button>
              <span>Créateur de l’activité</span>
            </div>
            <small>Activité</small>
          </header>

          {selectedActivity.imageUrl ? (
            <img
              className="detail-cover"
              src={selectedActivity.imageUrl}
              alt={`Illustration de ${selectedActivity.title}`}
            />
          ) : (
            <div
              className={`activity-feed-cover detail-cover energy-${selectedActivity.energyLevel}`}
              aria-hidden="true"
            >
              <span>{locationLabels[selectedActivity.locationType]}</span>
              <svg viewBox="0 0 120 72" fill="none">
                <path d="M17 57 43 25l18 21 14-17 28 28H17Z" />
                <circle cx="87" cy="17" r="8" />
                <path d="M11 62h98" />
              </svg>
              <strong>{selectedActivity.durationMinutes} min</strong>
            </div>
          )}

          <div className="detail-content">
            <h1>{selectedActivity.title}</h1>
            <p>{selectedActivity.description}</p>
            <dl className="activity-details-list">
              <div>
                <dt>Âges</dt>
                <dd>
                  {selectedActivity.minAge}–{selectedActivity.maxAge} ans
                </dd>
              </div>
              <div>
                <dt>Groupe</dt>
                <dd>
                  {selectedActivity.minChildren}–{selectedActivity.maxChildren} enfants
                </dd>
              </div>
              <div>
                <dt>Durée</dt>
                <dd>{selectedActivity.durationMinutes} min</dd>
              </div>
              <div>
                <dt>Lieu</dt>
                <dd>{locationLabels[selectedActivity.locationType]}</dd>
              </div>
            </dl>

            <button
              className="detail-save-button"
              type="button"
              disabled={activityIsSaved || activityIsSaving}
              onClick={() => void addActivityToSuitcase(selectedActivity)}
            >
              {activityIsSaved
                ? "Déjà dans ma valise"
                : activityIsSaving
                  ? "Ajout…"
                  : "+ Ajouter à ma valise"}
            </button>
          </div>
        </article>

        {selectedActivity.isPublic ? (
          <CommentsSection
            currentUser={user}
            targetId={selectedActivity.id}
            targetType="activity"
            onAuthorClick={openPublicProfile}
            onLoginRequired={() => setActivePage("profile")}
          />
        ) : (
          <p className="detail-private-note">
            Les commentaires sont disponibles lorsque l’activité est publique.
          </p>
        )}
      </section>
    );
  }

  function renderAnnouncementDetail() {
    if (!selectedAnnouncement) return null;

    return (
      <section className="detail-page">
        <button className="detail-back" type="button" onClick={() => setActivePage("home")}>
          ← Retour au fil
        </button>

        <article className="detail-card">
          <header className="detail-author">
            <span
              className={`profile-avatar avatar-${selectedAnnouncement.tone}`}
              aria-hidden="true"
            >
              {selectedAnnouncement.initials}
            </span>
            <div>
              <strong>{selectedAnnouncement.author}</strong>
              <span>{selectedAnnouncement.meta}</span>
            </div>
            <small>{selectedAnnouncement.category}</small>
          </header>

          <img
            className="detail-cover"
            src={selectedAnnouncement.image}
            alt={selectedAnnouncement.imageAlt}
          />

          <div className="detail-content">
            <h1>{selectedAnnouncement.title}</h1>
            <p>{selectedAnnouncement.body}</p>
            <ul className="post-facts" aria-label="Informations principales">
              {selectedAnnouncement.facts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
          </div>
        </article>

        <CommentsSection
          currentUser={user}
          targetId={`feed-${selectedAnnouncement.id}`}
          targetType="announcement"
          onAuthorClick={openPublicProfile}
          onLoginRequired={() => setActivePage("profile")}
        />
      </section>
    );
  }

  function renderPublicProfile() {
    if (isLoadingProfile) {
      return <p className="session-check">Chargement du profil…</p>;
    }

    if (profileError || !selectedProfile) {
      return (
        <section className="public-profile-error">
          <p>{profileError ?? "Profil introuvable."}</p>
          <button type="button" onClick={() => setActivePage("home")}>
            Retour au fil
          </button>
        </section>
      );
    }

    const { profile, activities } = selectedProfile;

    return (
      <section className="public-profile-page">
        <button className="detail-back" type="button" onClick={() => setActivePage("home")}>
          ← Retour au fil
        </button>

        <header className="public-profile-header">
          <span aria-hidden="true">{profile.name.charAt(0).toUpperCase()}</span>
          <div>
            <p>Membre de Pocket</p>
            <h1>{profile.name}</h1>
            <small>
              Inscrit le {new Intl.DateTimeFormat("fr-FR").format(new Date(profile.createdAt))}
            </small>
          </div>
          <strong>
            {profile.activityCount} activité{profile.activityCount > 1 ? "s" : ""}
          </strong>
        </header>

        <section className="profile-activities" aria-labelledby="profile-activities-title">
          <header>
            <h2 id="profile-activities-title">Activités publiques</h2>
          </header>
          {activities.length === 0 ? (
            <p>Ce membre n’a pas encore partagé d’activité.</p>
          ) : (
            <ul>
              {activities.map((activity) => (
                <li key={activity.id}>
                  {activity.imageUrl && <img src={activity.imageUrl} alt="" />}
                  <div>
                    <h3>{activity.title}</h3>
                    <p>{activity.description}</p>
                    <span>
                      {activity.minAge}–{activity.maxAge} ans · {activity.durationMinutes} min
                    </span>
                  </div>
                  <button type="button" onClick={() => openActivity(activity)}>
                    Voir
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    );
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
    if (activePage === "activityDetail") return renderActivityDetail();
    if (activePage === "announcementDetail") return renderAnnouncementDetail();
    if (activePage === "publicProfile") return renderPublicProfile();
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
