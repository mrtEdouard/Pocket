import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getPublicProfile } from "../api/users";
import type { Activity } from "../types/activity";
import type { PublicUser } from "../types/user";

interface PublicProfileData {
  activities: Activity[];
  profile: PublicUser;
}

export function PublicProfilePage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [data, setData] = useState<PublicProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setError("Identifiant utilisateur manquant.");
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setData(null);
    setError(null);
    setIsLoading(true);

    getPublicProfile(userId, controller.signal)
      .then(setData)
      .catch((caughtError: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Impossible de charger ce profil.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [userId]);

  if (isLoading) return <p className="session-check">Chargement du profil…</p>;

  if (error || !data) {
    return (
      <section className="public-profile-error">
        <p>{error ?? "Profil introuvable."}</p>
        <button type="button" onClick={() => navigate("/")}>Retour au fil</button>
      </section>
    );
  }

  const { profile, activities } = data;

  return (
    <section className="public-profile-page">
      <button className="detail-back" type="button" onClick={() => navigate("/")}>
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
        <header><h2 id="profile-activities-title">Activités publiques</h2></header>
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
                  <span>{activity.minAge}–{activity.maxAge} ans · {activity.durationMinutes} min</span>
                </div>
                <button type="button" onClick={() => navigate(`/activites/${activity.id}`)}>
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
