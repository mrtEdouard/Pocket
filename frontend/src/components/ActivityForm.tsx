import { useState, type FormEvent } from "react";

import { createActivity, updateActivity } from "../api/activities";
import type { Activity, CreateActivityInput } from "../types/activity";

interface ActivityFormProps {
  activity?: Activity | null;
  onCancel: () => void;
  onSaved: (activity: Activity) => void;
}

export function ActivityForm({
  activity = null,
  onCancel,
  onSaved,
}: ActivityFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState(activity?.imageUrl ?? "");
  const isEditing = activity !== null;

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const imageUrl = String(formData.get("imageUrl")).trim();
    const input: CreateActivityInput = {
      title: String(formData.get("title")),
      description: String(formData.get("description")),
      minAge: Number(formData.get("minAge")),
      maxAge: Number(formData.get("maxAge")),
      minChildren: Number(formData.get("minChildren")),
      maxChildren: Number(formData.get("maxChildren")),
      durationMinutes: Number(formData.get("durationMinutes")),
      locationType: String(
        formData.get("locationType"),
      ) as Activity["locationType"],
      energyLevel: String(
        formData.get("energyLevel"),
      ) as Activity["energyLevel"],
      imageUrl: imageUrl || null,
      isPublic: formData.get("isPublic") === "on",
    };

    if (input.maxAge < input.minAge) {
      setError("L’âge maximum doit être supérieur ou égal à l’âge minimum.");
      return;
    }

    if (input.maxChildren < input.minChildren) {
      setError(
        "Le nombre maximum d’enfants doit être supérieur ou égal au minimum.",
      );
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const savedActivity = isEditing
        ? await updateActivity(activity.id, input)
        : await createActivity(input);

      onSaved(savedActivity);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : `Impossible de ${isEditing ? "modifier" : "créer"} l’activité.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="activity-form" onSubmit={handleSubmit}>
      <header className="activity-form-header">
        <div>
          <h2>{isEditing ? "Modifier l’activité" : "Ajouter une activité"}</h2>
          <span>
            {isEditing
              ? "Mets à jour la fiche enregistrée dans ta valise."
              : "Crée une fiche simple à retrouver dans ta valise."}
          </span>
        </div>
        <button type="button" onClick={onCancel} aria-label="Fermer">
          ×
        </button>
      </header>

      <label className="activity-field activity-field-wide">
        <span>Titre</span>
        <input
          type="text"
          name="title"
          minLength={1}
          maxLength={150}
          defaultValue={activity?.title ?? ""}
          required
        />
      </label>

      <label className="activity-field activity-field-wide">
        <span>Description</span>
        <textarea
          name="description"
          rows={5}
          defaultValue={activity?.description ?? ""}
          required
        />
      </label>

      <label className="activity-field activity-field-wide">
        <span>Image de couverture (URL)</span>
        <input
          type="url"
          name="imageUrl"
          placeholder="https://…"
          defaultValue={activity?.imageUrl ?? ""}
          onChange={(event) => setImagePreview(event.target.value.trim())}
        />
        <small>Utilise pour l’instant une adresse d’image publique.</small>
      </label>

      {imagePreview && (
        <div className="activity-image-preview activity-field-wide">
          <img src={imagePreview} alt="Aperçu de la couverture" />
        </div>
      )}

      <div className="activity-field-row activity-field-wide">
        <label className="activity-field">
          <span>Âge minimum</span>
          <input
            type="number"
            name="minAge"
            min={0}
            defaultValue={activity?.minAge ?? 6}
            required
          />
        </label>

        <label className="activity-field">
          <span>Âge maximum</span>
          <input
            type="number"
            name="maxAge"
            min={0}
            defaultValue={activity?.maxAge ?? 12}
            required
          />
        </label>
      </div>

      <div className="activity-field-row activity-field-wide">
        <label className="activity-field">
          <span>Minimum d’enfants</span>
          <input
            type="number"
            name="minChildren"
            min={1}
            defaultValue={activity?.minChildren ?? 5}
            required
          />
        </label>

        <label className="activity-field">
          <span>Maximum d’enfants</span>
          <input
            type="number"
            name="maxChildren"
            min={1}
            defaultValue={activity?.maxChildren ?? 20}
            required
          />
        </label>
      </div>

      <label className="activity-field">
        <span>Durée en minutes</span>
        <input
          type="number"
          name="durationMinutes"
          min={1}
          defaultValue={activity?.durationMinutes ?? 60}
          required
        />
      </label>

      <label className="activity-field">
        <span>Lieu</span>
        <select
          name="locationType"
          defaultValue={activity?.locationType ?? "both"}
        >
          <option value="indoor">Intérieur</option>
          <option value="outdoor">Extérieur</option>
          <option value="both">Intérieur ou extérieur</option>
        </select>
      </label>

      <label className="activity-field">
        <span>Niveau d’énergie</span>
        <select
          name="energyLevel"
          defaultValue={activity?.energyLevel ?? "medium"}
        >
          <option value="low">Calme</option>
          <option value="medium">Modéré</option>
          <option value="high">Dynamique</option>
        </select>
      </label>

      <label className="activity-checkbox activity-field-wide">
        <input
          type="checkbox"
          name="isPublic"
          defaultChecked={activity?.isPublic ?? true}
        />
        <span>Rendre cette activité publique</span>
      </label>

      <div className="activity-form-footer activity-field-wide">
        <button
          className="button button-primary"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Enregistrement…"
            : isEditing
              ? "Enregistrer les modifications"
              : "Créer l’activité"}
        </button>

        <button
          className="activity-cancel-button"
          type="button"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          Annuler
        </button>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
