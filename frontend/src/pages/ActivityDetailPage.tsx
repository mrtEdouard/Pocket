import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getActivity } from "../api/activities";
import { CommentsSection } from "../components/CommentsSection";
import { locationLabels } from "../data/activityLabels";
import type { Activity } from "../types/activity";
import type { User } from "../types/user";

interface ActivityDetailPageProps {
  myActivities: Activity[];
  onSaveActivity: (activity: Activity) => Promise<void>;
  savingActivityIds: string[];
  user: User | null;
}

export function ActivityDetailPage({
  myActivities,
  onSaveActivity,
  savingActivityIds,
  user,
}: ActivityDetailPageProps) {
  const navigate = useNavigate();
  const { activityId } = useParams();
  const localActivity = myActivities.find((activity) => activity.id === activityId);
  const [activity, setActivity] = useState<Activity | null>(localActivity ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!localActivity);

  useEffect(() => {
    if (!activityId) {
      setError("Identifiant d’activité manquant.");
      setIsLoading(false);
      return;
    }

    if (localActivity) {
      setActivity(localActivity);
      setError(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setActivity(null);
    setError(null);
    setIsLoading(true);

    getActivity(activityId, controller.signal)
      .then(setActivity)
      .catch((caughtError: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Impossible de charger cette activité.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [activityId, localActivity]);

  if (isLoading) return <p className="session-check">Chargement de l’activité…</p>;

  if (error || !activity) {
    return (
      <section className="public-profile-error">
        <p>{error ?? "Activité introuvable."}</p>
        <button type="button" onClick={() => navigate("/")}>Retour au fil</button>
      </section>
    );
  }

  const activityIsSaved = myActivities.some(
    (savedActivity) => savedActivity.id === activity.id,
  );
  const activityIsSaving = savingActivityIds.includes(activity.id);

  return (
    <section className="detail-page">
      <button className="detail-back" type="button" onClick={() => navigate("/")}>
        ← Retour au fil
      </button>

      <article className="detail-card">
        <header className="detail-author">
          <button
            className="profile-avatar avatar-activity"
            type="button"
            onClick={() => navigate(`/utilisateurs/${activity.ownerId}`)}
          >
            {activity.ownerName.charAt(0).toUpperCase()}
          </button>
          <div>
            <button
              type="button"
              onClick={() => navigate(`/utilisateurs/${activity.ownerId}`)}
            >
              {activity.ownerName}
            </button>
            <span>Créateur de l’activité</span>
          </div>
          <small>Activité</small>
        </header>

        {activity.imageUrl ? (
          <img
            className="detail-cover"
            src={activity.imageUrl}
            alt={`Illustration de ${activity.title}`}
          />
        ) : (
          <div
            className={`activity-feed-cover detail-cover energy-${activity.energyLevel}`}
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

        <div className="detail-content">
          <h1>{activity.title}</h1>
          <p>{activity.description}</p>
          <dl className="activity-details-list">
            <div><dt>Âges</dt><dd>{activity.minAge}–{activity.maxAge} ans</dd></div>
            <div><dt>Groupe</dt><dd>{activity.minChildren}–{activity.maxChildren} enfants</dd></div>
            <div><dt>Durée</dt><dd>{activity.durationMinutes} min</dd></div>
            <div><dt>Lieu</dt><dd>{locationLabels[activity.locationType]}</dd></div>
          </dl>

          {user && (
            <button
              className="detail-save-button"
              type="button"
              disabled={activityIsSaved || activityIsSaving}
              onClick={() => void onSaveActivity(activity)}
            >
              {activityIsSaved
                ? "Déjà dans ma valise"
                : activityIsSaving
                  ? "Ajout…"
                  : "+ Ajouter à ma valise"}
            </button>
          )}
        </div>
      </article>

      {activity.isPublic ? (
        <CommentsSection
          currentUser={user}
          targetId={activity.id}
          targetType="activity"
          onAuthorClick={(authorId) => navigate(`/utilisateurs/${authorId}`)}
          onLoginRequired={() => navigate("/profil")}
        />
      ) : (
        <p className="detail-private-note">
          Les commentaires sont disponibles lorsque l’activité est publique.
        </p>
      )}
    </section>
  );
}
