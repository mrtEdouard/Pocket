import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { ActivityModal } from "../components/ActivityModal";
import { energyLabels, locationLabels } from "../data/activityLabels";
import type { Activity } from "../types/activity";
import type { User } from "../types/user";

interface ActivitiesPageProps {
  activitiesError: string | null;
  isCheckingSession: boolean;
  isLoadingActivities: boolean;
  myActivities: Activity[];
  onActivitySaved: (activity: Activity) => void;
  user: User | null;
}

export function ActivitiesPage({
  activitiesError,
  isCheckingSession,
  isLoadingActivities,
  myActivities,
  onActivitySaved,
  user,
}: ActivitiesPageProps) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  if (isCheckingSession) {
    return <p className="session-check" role="status">Vérification de la session…</p>;
  }

  if (!user) {
    return (
      <section className="activity-access" aria-labelledby="activity-access-title">
        <p>Création d’activité</p>
        <h2 id="activity-access-title">Connecte-toi pour ajouter une activité.</h2>
        <button className="button button-primary" type="button" onClick={() => navigate("/profil")}>
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
            <span>{myActivities.length} activité{myActivities.length > 1 ? "s" : ""}</span>
          </div>
        </div>

        <button
          className="add-activity-button"
          type="button"
          aria-label="Ajouter une activité"
          onClick={() => {
            setEditingActivity(null);
            setIsModalOpen(true);
          }}
        >
          +
        </button>
      </header>

      {activitiesError && (
        <p className="suitcase-message is-error" role="alert">{activitiesError}</p>
      )}

      {isLoadingActivities ? (
        <p className="suitcase-message" role="status">Ouverture de la valise…</p>
      ) : myActivities.length === 0 ? (
        <div className="empty-suitcase">
          <span aria-hidden="true">+</span>
          <p>Ta première fiche d’activité viendra se ranger ici.</p>
        </div>
      ) : (
        <ul className="activity-card-grid">
          {myActivities.map((activity) => (
            <li className={`activity-card energy-${activity.energyLevel}`} key={activity.id}>
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
                      setIsModalOpen(true);
                    }}
                  >
                    Modifier
                  </button>
                )}
              </header>
              {activity.imageUrl && (
                <img className="activity-card-image" src={activity.imageUrl} alt="" loading="lazy" />
              )}
              <h2>{activity.title}</h2>
              <p>{activity.description}</p>
              <footer>
                <div>
                  <span>{activity.minAge}–{activity.maxAge} ans</span>
                  <span>{activity.durationMinutes} min</span>
                  <span>{locationLabels[activity.locationType]}</span>
                </div>
                <button type="button" onClick={() => navigate(`/activites/${activity.id}`)}>
                  Voir
                </button>
              </footer>
            </li>
          ))}
        </ul>
      )}

      {isModalOpen && (
        <ActivityModal
          activity={editingActivity}
          onClose={() => {
            setIsModalOpen(false);
            setEditingActivity(null);
          }}
          onSaved={(savedActivity) => {
            const wasCreating = editingActivity === null;
            onActivitySaved(savedActivity);
            setIsModalOpen(false);
            setEditingActivity(null);

            if (wasCreating && savedActivity.isPublic) navigate("/");
          }}
        />
      )}
    </section>
  );
}
