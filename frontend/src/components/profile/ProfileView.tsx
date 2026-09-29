import { useState } from "react";

export type ProfileTab = "published" | "activities" | "saved";

export interface ProfileActivityPreview {
  id: string;
  imageUrl: string | null;
  title: string;
}

interface ProfileViewProps {
  activities?: ProfileActivityPreview[];
  avatarUrl?: string | null;
  bio: string;
  isOwnProfile?: boolean;
  name: string;
  onActivityClick?: (activityId: string) => void;
  publishedActivities: ProfileActivityPreview[];
  role: string;
  savedActivities?: ProfileActivityPreview[];
}

const tabs: Array<{ id: ProfileTab; label: string }> = [
  { id: "published", label: "Publiées" },
  { id: "activities", label: "Activités" },
  { id: "saved", label: "Enregistrées" },
];

export function ProfileView({
  activities: activityItems,
  avatarUrl = null,
  bio,
  isOwnProfile = false,
  name,
  onActivityClick,
  publishedActivities,
  role,
  savedActivities = [],
}: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>("published");
  const activities = activityItems ?? publishedActivities;
  const displayedActivities = activeTab === "saved"
    ? savedActivities
    : activeTab === "activities"
      ? activities
      : publishedActivities;
  const emptyMessage = activeTab === "saved"
    ? "Aucune activité enregistrée."
    : activeTab === "activities"
      ? "Aucune activité pour le moment."
      : "Aucune activité publiée pour le moment.";

  return (
    <section className="social-profile">
      <header className="social-profile-header">
        <div className="social-profile-avatar">
          {avatarUrl ? (
            <img src={avatarUrl} alt={`Photo de ${name}`} />
          ) : (
            <span aria-hidden="true">{name.charAt(0).toUpperCase()}</span>
          )}
        </div>

        <div className="social-profile-main">
          <div className="social-profile-heading">
            <h1>{name}</h1>

            {isOwnProfile && <button type="button">Modifier le profil</button>}
          </div>

          <dl className="social-profile-stats">
            <div>
              <dt>Publiées</dt>
              <dd>{publishedActivities.length}</dd>
            </div>

            <div>
              <dt>Activités</dt>
              <dd>{activities.length}</dd>
            </div>

            <div>
              <dt>Enregistrées</dt>
              <dd>{savedActivities.length}</dd>
            </div>
          </dl>

          <div className="social-profile-bio">
            <strong>{role}</strong>
            <p>{bio}</p>
          </div>
        </div>
      </header>

      <nav className="social-profile-tabs" aria-label="Contenu du profil" role="tablist">
        {tabs.map((tab) => (
          <button
            type="button"
            role="tab"
            key={tab.id}
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section className="social-profile-gallery" aria-live="polite">
        {displayedActivities.length === 0 ? (
          <p className="social-profile-empty">{emptyMessage}</p>
        ) : (
          displayedActivities.map((activity) => (
            <button
              type="button"
              key={activity.id}
              onClick={() => onActivityClick?.(activity.id)}
            >
              {activity.imageUrl ? (
                <img src={activity.imageUrl} alt={activity.title} />
              ) : (
                <span className="social-profile-activity-placeholder">
                  {activity.title}
                </span>
              )}
              <span className="sr-only">Ouvrir {activity.title}</span>
            </button>
          ))
        )}
      </section>
    </section>
  );
}
