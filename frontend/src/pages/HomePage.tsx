import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getPublicActivities } from "../api/activities";
import { getRecentUsers } from "../api/users";
import { energyLabels, locationLabels } from "../data/activityLabels";
import { recruitmentAnnouncements } from "../data/recruitmentAnnouncements";
import type { Activity } from "../types/activity";
import type { PublicUser, User } from "../types/user";

interface DemoPerson {
  name: string;
  picture: string;
}

interface RandomUserResponse {
  results: Array<{
    name: { first: string; last: string };
    picture: { large: string };
  }>;
}

interface HomePageProps {
  myActivities: Activity[];
  onSaveActivity: (activity: Activity) => Promise<void>;
  savingActivityIds: string[];
  user: User | null;
}

export function HomePage({
  myActivities,
  onSaveActivity,
  savingActivityIds,
  user,
}: HomePageProps) {
  const navigate = useNavigate();
  const [demoPeople, setDemoPeople] = useState<DemoPerson[]>([]);
  const [publicActivities, setPublicActivities] = useState<Activity[]>([]);
  const [recentUsers, setRecentUsers] = useState<PublicUser[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    getPublicActivities(controller.signal)
      .then(setPublicActivities)
      .catch(() => {
        if (!controller.signal.aborted) setPublicActivities([]);
      });

    getRecentUsers(controller.signal)
      .then(setRecentUsers)
      .catch(() => {
        if (!controller.signal.aborted) setRecentUsers([]);
      });

    fetch(
      "https://randomuser.me/api/1.4/?results=6&nat=fr&inc=name,picture&seed=pocket-home-v1&noinfo",
      { signal: controller.signal },
    )
      .then((response) => (response.ok ? response.json() : null))
      .then((data: RandomUserResponse | null) => {
        if (!data) return;
        setDemoPeople(
          data.results.map((person) => ({
            name: `${person.name.first} ${person.name.last}`,
            picture: person.picture.large,
          })),
        );
      })
      .catch(() => {
        if (!controller.signal.aborted) setDemoPeople([]);
      });

    return () => controller.abort();
  }, []);

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
              <button type="button" onClick={() => navigate("/profil")}>
                Participer
              </button>
            )}
          </header>

          {publicActivities.map((activity) => {
            const activityIsSaved = myActivities.some(
              (savedActivity) => savedActivity.id === activity.id,
            );
            const activityIsSaving = savingActivityIds.includes(activity.id);

            return (
              <article className="feed-entry" key={`activity-${activity.id}`}>
                <header className="feed-entry-header">
                  <button
                    className="profile-avatar avatar-activity"
                    type="button"
                    aria-label={`Voir le profil de ${activity.ownerName}`}
                    onClick={() => navigate(`/utilisateurs/${activity.ownerId}`)}
                  >
                    {activity.ownerName.charAt(0).toUpperCase()}
                  </button>
                  <div className="feed-author">
                    <button
                      type="button"
                      onClick={() => navigate(`/utilisateurs/${activity.ownerId}`)}
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
                    <li>{activity.minAge}–{activity.maxAge} ans</li>
                    <li>{activity.minChildren}–{activity.maxChildren} enfants</li>
                    <li>{energyLabels[activity.energyLevel]}</li>
                  </ul>
                </div>

                <footer className="feed-entry-footer">
                  <span>Nouvelle activité publique</span>
                  <div className="feed-entry-actions">
                    {user && (
                      <button
                        type="button"
                        disabled={activityIsSaved || activityIsSaving}
                        onClick={() => void onSaveActivity(activity)}
                      >
                        {activityIsSaved
                          ? "Dans ma valise"
                          : activityIsSaving
                            ? "Ajout…"
                            : "+ Valise"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => navigate(`/activites/${activity.id}`)}
                    >
                      Voir la fiche
                    </button>
                  </div>
                </footer>
              </article>
            );
          })}

          {recruitmentAnnouncements.map((announcement, index) => (
            <article className="feed-entry" key={`recruitment-${announcement.id}`}>
              <header className="feed-entry-header">
                <div className="profile-avatar avatar-recruitment" aria-hidden="true">
                  {demoPeople[index] ? (
                    <img src={demoPeople[index].picture} alt="" />
                  ) : (
                    announcement.authorInitials
                  )}
                </div>
                <div className="feed-author">
                  <strong>{demoPeople[index]?.name ?? announcement.authorName}</strong>
                  <span>{announcement.authorMeta}</span>
                </div>
                <span className="post-category">Recrutement</span>
              </header>

              <img
                className="post-image"
                src={announcement.imageUrl}
                alt={announcement.imageAlt}
                loading={index === 0 ? "eager" : "lazy"}
              />

              <div className="feed-entry-content">
                <h2>{announcement.title}</h2>
                <p>{announcement.description}</p>
                <ul className="post-facts" aria-label="Informations principales">
                  <li>{announcement.role}</li>
                  <li>{announcement.dateRange}</li>
                  <li>{announcement.location}</li>
                </ul>
              </div>

              <footer className="feed-entry-footer">
                <span>{announcement.stats}</span>
                <button
                  type="button"
                  onClick={() => navigate(`/annonces/${announcement.id}`)}
                >
                  Voir l’annonce
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
            <ul className="recruitment-list">
              {recruitmentAnnouncements.slice(0, 3).map((announcement) => (
                <li key={`sidebar-${announcement.id}`}>
                  <img src={announcement.imageUrl} alt="" loading="lazy" />
                  <div>
                    <strong>{announcement.location}</strong>
                    <span>{announcement.dateRange} · {announcement.role}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="sidebar-section">
            <header><h2>Nouveaux profils</h2></header>
            <ul className="member-list">
              {recentUsers.map((recentUser) => (
                <li key={recentUser.id}>
                  <button
                    className="member-initials"
                    type="button"
                    aria-label={`Voir le profil de ${recentUser.name}`}
                    onClick={() => navigate(`/utilisateurs/${recentUser.id}`)}
                  >
                    {recentUser.name.charAt(0).toUpperCase()}
                  </button>
                  <div>
                    <button
                      className="member-name"
                      type="button"
                      onClick={() => navigate(`/utilisateurs/${recentUser.id}`)}
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
            <button className="sidebar-action" type="button" onClick={() => navigate("/profil")}>
              Rejoindre la communauté
            </button>
          </section>
        </aside>
      </div>
    </section>
  );
}
