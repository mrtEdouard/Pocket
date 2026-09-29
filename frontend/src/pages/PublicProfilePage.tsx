import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getPublicProfile } from "../api/users";
import {
  ProfileView,
  type ProfileActivityPreview,
} from "../components/profile/ProfileView";
import type { Activity } from "../types/activity";
import type { PublicUser } from "../types/user";

interface PublicProfileData {
  activities: Activity[];
  profile: PublicUser;
  savedActivities: Activity[];
}

function toProfilePreview(activity: Activity): ProfileActivityPreview {
  return {
    id: activity.id,
    imageUrl: activity.imageUrl,
    title: activity.title,
  };
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

  const { profile, activities, savedActivities } = data;
  const memberSince = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(new Date(profile.createdAt));

  return (
    <ProfileView
      activities={activities.map(toProfilePreview)}
      bio={`Membre de Pocket depuis ${memberSince}.`}
      name={profile.name}
      onActivityClick={(activityId) => navigate(`/activites/${activityId}`)}
      publishedActivities={activities.map(toProfilePreview)}
      role="Membre Pocket"
      savedActivities={savedActivities.map(toProfilePreview)}
    />
  );
}
